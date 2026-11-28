import { BASE, STATIC, withBase, stripBase } from './lib/base.js'
import { demoArrival, ownerArrival } from './demoData.js'
import { demoExtrasApi, roleOn, roleEnter, roleLeave, roleMe } from './lib/demoExtras.js'
import { demoCreatorApi, demoOn, demoEnter, demoLeave, isCreatorPath, viewerEmail, viewerEnter, viewerLeave } from './lib/demoCreator.js'

// Versão estática (GitHub Pages): sem servidor. Só o mapa de demonstração existe, lido de um JSON gerado no build.
const NO_SERVER = () => Object.assign(new Error('Disponível apenas na versão com servidor'), { status: 503, data: { error: 'estatico' } })
async function staticApi(path, opts) {
  // painel do criador de demonstração (fictício, só no navegador): ver lib/demoCreator.js
  if (path === '/auth/demo-explorador') { roleLeave(); viewerEnter(opts.body?.email); return { ok: true } }
  if (path === '/auth/demo-restaurante' || path === '/auth/demo-admin') { demoLeave(); roleEnter(path.endsWith('admin') ? 'admin' : 'restaurante'); return { ok: true } }
  if (path === '/auth/demo' || path === '/auth/logout') { roleLeave(); if (path === '/auth/logout') viewerLeave(); return demoCreatorApi(path, opts) }
  if (path === '/me') {
    // telas de administração, restaurante e voo: abrir o endereço direto já entra com um perfil fictício
    const rp = stripBase(location.pathname)
    const want = /^\/admin(\/|$)/.test(rp) ? 'admin' : /^\/restaurante/.test(rp) ? 'restaurante' : ''
    if (want) { demoLeave(); roleEnter(want) }
    else if (/^\/voo/.test(rp) && !viewerEmail() && !demoOn()) { roleLeave(); viewerEnter('explorador@teste.wagli') }
    else if (!demoOn() && isCreatorPath(rp)) { roleLeave(); demoEnter() }
  }
  if (demoOn()) { const r = await demoCreatorApi(path, opts); if (r) return r }
  if (path === '/me' && roleOn()) return roleMe(roleOn())
  if (path === '/me' && viewerEmail()) return { user: { id: 2, email: viewerEmail(), role: 'viewer' }, creator: null, claims: [], notices: [] }
  { const r = await demoExtrasApi(path, opts); if (r) return r }
  if (path === '/me') return { user: null, creator: null, claims: [], notices: [] }
  if (path === '/public/demo') { const r = await fetch(`${BASE}/demo.json`); if (!r.ok) throw NO_SERVER(); const d = await r.json(); return { ...d, creator: { ...d.creator, ...(d.creator.avatarUrl ? { avatarUrl: withBase(d.creator.avatarUrl) } : {}), ...ownerArrival() }, places: d.places.map((p) => ({ ...p, ...(p.photo ? { photo: withBase(p.photo) } : {}), ...(p.cover ? { cover: withBase(p.cover) } : {}) })) } }
  // outro mapa na versão estática: um arquivo por criador em /maps/<usuario>.json
  const other = path.match(/^\/public\/([a-z0-9_-]{2,40})$/i)
  if (other) { const r = await fetch(`${BASE}/maps/${other[1]}.json`).catch(() => null); if (r?.ok && /json/.test(r.headers.get('content-type') || '')) { const d = await r.json(); return { ...d, creator: { ...d.creator, avatarUrl: d.creator.avatarUrl ? withBase(d.creator.avatarUrl) : null }, places: d.places.map((p) => ({ ...p, ...(p.photo ? { photo: withBase(p.photo) } : {}), ...(p.cover ? { cover: withBase(p.cover) } : {}) })) } } }
  throw NO_SERVER()
}

// avisa o menu do painel quando lugares ou posts mudam (o ponto de pendências em "Lugares" se atualiza)
export async function api(path, opts = {}) {
  const r = await apiRaw(path, opts)
  if ((opts.method || 'GET') !== 'GET' && /^\/creator\/(places|posts)/.test(path)) window.dispatchEvent(new Event('wagli:places'))
  return r
}
async function apiRaw(path, { method = 'GET', body } = {}) {
  if (STATIC) return staticApi(path, { method, body })
  const res = await fetch(`/api${path}`, {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status, data })
  return data
}

// Eventos de uso do mapa público (primeira parte, sem IP, sem identificar pessoas).
let sid
let ctx
function context(slug) {
  if (ctx) return ctx
  let ret = false
  try {
    const k = `wagli_seen_${slug}`
    ret = !!localStorage.getItem(k)
    localStorage.setItem(k, '1')
  } catch { /* sem armazenamento: conta como visita nova */ }
  const r = document.referrer ? new URL(document.referrer).hostname : ''
  const ref = !r ? 'direto' : /instagram\.com$|l\.instagram\.com$/.test(r) ? 'instagram' : /tiktok\.com$/.test(r) ? 'tiktok' : r === location.hostname ? 'direto' : 'outros'
  ctx = { dev: innerWidth <= 700 ? 'm' : 'd', ref, ret }
  return ctx
}
export function track(slug, type, extra = {}) {
  try {
    sid = sid || sessionStorage.getItem('sid') || Math.random().toString(36).slice(2, 14)
    sessionStorage.setItem('sid', sid)
  } catch { sid = sid || Math.random().toString(36).slice(2, 14) }
  if (STATIC) return // sem servidor: nenhum evento é enviado
  const meta = type === 'session' ? context(slug) : {}
  fetch('/api/e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, type, sid, ...meta, ...extra }), keepalive: true }).catch(() => {})
}
