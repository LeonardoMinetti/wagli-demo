// Telas que dependem do servidor, com dados fictícios, só para a demonstração publicada (GitHub Pages):
// administração, mapa geral, restaurantes e "Meu voo". Nada é enviado: o estado vive na memória da aba (some ao recarregar)
// e, no voo, no sessionStorage. Os nomes e números são inventados.
import { DEMO_GUIDES } from '../demoGuides.js'
import { withBase } from './base.js'
import { DEMO_PLACES, DEMO_ALL } from '../demoData.js'
import { ICON_PATHS } from './icons.jsx'
import { PERSONALITIES, XP_PER_VISIT, levelOf, nextOf } from '../levels.js'

const err = (m, status = 400) => Object.assign(new Error(m), { status, data: { error: m } })
const ROLE = 'wagli_role_demo'
export const roleOn = () => { try { return sessionStorage.getItem(ROLE) || '' } catch { return '' } }
export const roleEnter = (r) => { try { sessionStorage.setItem(ROLE, r) } catch { /* ok */ } }
export const roleLeave = () => { try { sessionStorage.removeItem(ROLE) } catch { /* ok */ } }
export const roleMe = (r) => ({
  user: { id: 9, email: r === 'admin' ? 'admin@teste.wagli' : 'restaurante@teste.wagli', role: r === 'admin' ? 'admin' : 'restaurant' },
  creator: null, notices: [], minFollowers: 10000,
  claims: r === 'restaurante' ? [{ id: 1, place_key: 'k1', place_name: 'Izakaya Exemplo', status: 'approved' }] : [],
})

// ---------- mapa geral ----------
const CRE = [
  { slug: 'demo', name: 'Mapa de demonstração', handle: 'mapa_demo', accent: '#ff4b2b' },
  { slug: 'bia-caio', name: 'Bia & Caio', handle: 'biaecaio.come.demo', accent: '#2d7ff9' },
  { slug: 'duda-lu', name: 'Duda & Lu', handle: 'dudaelu.cafe.demo', accent: '#36c5a0' },
]
const day = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
const groups = () => DEMO_PLACES.slice(0, 12).map((p, i) => {
  const who = [CRE[0], ...(p.id % 3 === 0 ? [CRE[1]] : []), ...(p.id % 4 === 0 ? [CRE[2]] : [])]
  return {
    key: `k${p.id}`, name: p.name, lat: p.lat, lon: p.lon, address: 'Endereço ilustrativo (demonstração)', neighborhood: p.neighborhood, municipality: 'São Paulo', quality: i % 4 === 3 ? 'approx' : 'address_exact',
    creators: who.map((c, k) => ({ ...c, postedOn: day(3 + i * 4 + k), postUrl: c.slug === 'demo' ? 'https://example.com/post-ilustrativo' : null, tiktokId: null, ad: i % 5 === 2 && k === 0 })),
  }
})

// ---------- miniguias ----------
let GUIDES
const guides = () => (GUIDES ||= DEMO_GUIDES.map((g) => ({ ...g, published: true, photo: /^https:/.test(g.photo) ? g.photo : withBase(`/photos/${g.photo}.jpg`), avatar: g.avatar ? withBase(`/photos/${g.avatar}.jpg`) : null })))

// ---------- administração ----------
const MIN = 10000
let ADM
const adm = () => (ADM ||= {
  min: MIN,
  creators: [
    { id: 1, handle: 'sabor.paulista', email: 'contato@saborpaulista.exemplo', tiktok: 'saborpaulista', followers: 48200, verified: true, status: 'approved', tier: 'creator' },
    { id: 2, handle: 'rolegastro.sp', email: 'oi@rolegastro.exemplo', tiktok: '', followers: 15300, verified: false, status: 'pending', tier: 'free' },
    { id: 3, handle: 'viajante.da.vez', email: 'viajante@exemplo.com', tiktok: '', followers: 0, verified: false, status: 'pending', tier: 'free' },
    { id: 4, handle: 'pequena.conta', email: 'pequena@exemplo.com', tiktok: '', followers: 2400, verified: true, status: 'waitlist', tier: 'free' },
    { id: 5, handle: 'perfil.suspeito', email: 'x@exemplo.com', tiktok: '', followers: 31000, verified: false, status: 'rejected', tier: 'free' },
  ],
  low: [
    { id: 101, creatorId: 1, handle: 'sabor.paulista', name: 'Cantina do Beco', issue: 'Endereço ambíguo', address: 'Rua Exemplo, 100', municipality: 'São Paulo', ...pick(3) },
    { id: 102, creatorId: 1, handle: 'sabor.paulista', name: 'Bar da Esquina', issue: 'Nome diferente do endereço', address: '', municipality: 'Osasco', ...pick(5) },
    { id: 103, creatorId: 2, handle: 'rolegastro.sp', name: 'Pastelaria Modelo', issue: 'Localização aproximada', address: 'Av. Ilustrativa, 45', municipality: 'São Paulo', ...pick(7) },
  ],
  reports: [
    { ids: [1, 2], placeName: 'Izakaya Exemplo', placeId: 1, handle: 'mapa_demo', reason: 'Lugar fechado definitivamente', count: 2, daysLeft: 3, details: ['Fechou em março.', 'Está em obras há meses.'], status: 'open' },
    { ids: [3], placeName: '', placeId: null, handle: 'rolegastro.sp', reason: 'Publicidade sem aviso', count: 1, daysLeft: 0, details: [], status: 'open' },
    { ids: [4], placeName: 'Brunch Exemplo', placeId: 2, handle: 'mapa_demo', reason: 'Endereço incorreto', count: 1, daysLeft: 5, details: ['O endereço mostrado é de outra rua.'], status: 'review' },
    { ids: [5], placeName: 'Café Exemplo', placeId: 4, handle: 'mapa_demo', reason: 'Foto de terceiros', count: 1, daysLeft: 0, details: [], status: 'resolved' },
  ],
  symbols: [{ id: 1, name: 'Xícara', handle: 'dudaelu.cafe.demo', d: ICON_PATHS.cafe, vb: '0 0 24 24', mode: 'stroke' }],
  claims: [
    { id: 1, place_name: 'Izakaya Exemplo', email: 'contato@izakaya.exemplo', method: 'email', contact: '(11) 5555-0100', status: 'pending' },
    { id: 2, place_name: 'Brunch Exemplo', email: 'dono@brunch.exemplo', method: 'manual', contact: 'dono@brunch.exemplo', status: 'approved' },
  ],
})
function pick(i) { const p = DEMO_PLACES[i] || DEMO_PLACES[0]; return { lat: p.lat, lon: p.lon } }
const crit = (c) => (!c.followers ? 'unknown' : c.followers >= adm().min ? 'met' : 'below')
const adminCreators = () => ({ minFollowers: adm().min, creators: adm().creators.map((c) => ({ ...c, criterion: crit(c) })) })

// ---------- voo ----------
const VK = 'wagli_voo_demo_v1'
const voo = () => {
  try { const r = sessionStorage.getItem(VK); if (r) return JSON.parse(r) } catch { /* ok */ }
  return { personality: 'brincalhona', visits: DEMO_PLACES.slice(0, 12).map((p) => p.id) }
}
const saveVoo = (v) => { try { sessionStorage.setItem(VK, JSON.stringify(v)) } catch { /* ok */ } }
const vooState = (v) => {
  const xp = v.visits.length * XP_PER_VISIT, lv = levelOf(xp), nx = nextOf(xp)
  const recent = [...v.visits].reverse().slice(0, 5).map((id) => ({ name: DEMO_ALL.find((p) => p.id === id)?.name || 'Lugar', slug: 'demo', creator: 'Mapa de demonstração' }))
  return { personality: v.personality, xp, visits: v.visits.length, level: lv.n, levelName: lv.name, next: nx ? { level: nx.n, name: nx.name, at: nx.min, missing: nx.min - xp } : null, recent }
}

export async function demoExtrasApi(path, { method = 'GET', body = {} } = {}) {
  const [p, qs = ''] = path.split('?')
  const q = new URLSearchParams(qs)
  let m

  // mapa geral e restaurantes
  if (p === '/network') return { creators: CRE.map(({ slug, name, accent, handle }) => ({ slug, name, accent, handle })), places: groups() }
  if (p === '/restaurants/search') { const t = (q.get('q') || '').toLowerCase(); return { results: groups().filter((g) => g.name.toLowerCase().includes(t)).map((g) => ({ key: g.key, name: g.name, address: g.address, neighborhood: g.neighborhood, creators: g.creators.length })) } }
  if (p === '/claims' && method === 'POST') return { ok: true }
  if (p === '/restaurant/panel') return { places: groups().filter((g) => ['k1', 'k3'].includes(g.key)).map((g) => ({ key: g.key, name: g.name, neighborhood: g.neighborhood, address: g.address, creators: g.creators.length, ads: g.creators.filter((c) => c.ad).length, indications: g.creators.map((c) => ({ name: c.name, accent: c.accent, postedOn: c.postedOn, ad: c.ad })) })) }

  // miniguias: exemplos fictícios; a escolha da equipe vale enquanto a aba estiver aberta
  if (p === '/miniguias') return { demo: true, guides: guides().filter((g) => g.featured) }
  if (p === '/admin/miniguias') return { guides: guides() }
  if ((m = p.match(/^\/admin\/miniguias\/(\d+)$/))) { const g = guides().find((x) => x.id === Number(m[1])); if (g) g.featured = !!body.featured; return { ok: true } }

  // administração
  if (p === '/admin/creators') return adminCreators()
  if ((m = p.match(/^\/admin\/creators\/(\d+)\/decision$/))) {
    const c = adm().creators.find((x) => x.id === Number(m[1])); if (!c) throw err('nao_encontrado', 404)
    if (body.followers != null && body.followers !== '') c.followers = Math.max(0, Number(body.followers) || 0)
    if (body.verified != null) c.verified = !!body.verified
    if (body.status) { if (body.status === 'approved' && (crit(c) !== 'met' || !c.verified)) throw err('abaixo_do_criterio'); c.status = body.status }
    return { ok: true }
  }
  if ((m = p.match(/^\/admin\/creators\/(\d+)\/plan$/))) { const c = adm().creators.find((x) => x.id === Number(m[1])); if (c) c.tier = body.tier; return { ok: true } }
  if (p === '/admin/config') { adm().min = Math.max(0, Number(body.minFollowers) || MIN); return { ok: true } }
  if (p === '/admin/review') {
    const cid = Number(q.get('creator')) || null, all = adm().low
    const low = cid ? all.filter((x) => x.creatorId === cid) : all
    const queue = adm().creators.filter((c) => all.some((x) => x.creatorId === c.id)).map((c) => ({ id: c.id, handle: c.handle, places: 20 + c.id * 7, pending: all.filter((x) => x.creatorId === c.id).length }))
    return { queue, low, metrics: { reviewPct: 18, unresolvedPct: 7, places: 142 } }
  }
  if ((m = p.match(/^\/admin\/places\/(\d+)$/))) {
    const i = adm().low.findIndex((x) => x.id === Number(m[1]))
    if (i >= 0) { if (body.address) adm().low[i] = { ...adm().low[i], address: String(body.address).slice(0, 160), issue: 'Corrigido' }; if (body.reviewed) adm().low.splice(i, 1) }
    return { ok: true }
  }
  if (p === '/admin/reports') {
    const all = adm().reports, st = q.get('status') || 'open'
    return { groups: all.filter((g) => g.status === st), counts: { open: all.filter((g) => g.status === 'open').length, review: all.filter((g) => g.status === 'review').length, resolved: all.filter((g) => g.status === 'resolved').length }, slaDays: 5 }
  }
  if (p === '/admin/reports/act') { for (const g of adm().reports) if (g.ids.some((i) => (body.ids || []).includes(i))) g.status = body.action === 'notify' || body.action === 'correct' ? 'review' : 'resolved'; return { ok: true } }
  if (p === '/admin/symbols' && method === 'GET') return { symbols: adm().symbols }
  if ((m = p.match(/^\/admin\/symbols\/(\d+)$/))) { adm().symbols = adm().symbols.filter((s) => s.id !== Number(m[1])); return { ok: true } }
  if (p === '/admin/claims' && method === 'GET') return { claims: adm().claims }
  if ((m = p.match(/^\/admin\/claims\/(\d+)$/))) { const c = adm().claims.find((x) => x.id === Number(m[1])); if (c) c.status = body.status; return { ok: true } }
  if (p === '/admin/metrics') return { funnel: [['Candidaturas', 120], ['Aprovados', 64], ['Conectaram conta', 51], ['Publicaram o mapa', 43], ['Pagantes', 0]], studio: { changedVisual: 62, customSymbol: 18, customDomain: 7, network: 35 } }

  // meu voo
  if (p === '/voo' && method === 'GET') return vooState(voo())
  if (p === '/voo' && method === 'PUT') { if (!PERSONALITIES.some(([k]) => k === body.personality)) throw err('personalidade_invalida'); const v = voo(); v.personality = body.personality; saveVoo(v); return vooState(v) }
  if ((m = p.match(/^\/voo\/visited\/([\w-]+)$/))) return { ids: m[1] === 'demo' ? voo().visits : [] }
  if (p === '/voo/visits' && method === 'POST') {
    const v = voo(), before = vooState(v), id = Number(body.placeId)
    if (body.slug !== 'demo' || !DEMO_ALL.some((x) => x.id === id)) throw err('lugar_indisponivel', 404)
    if (!v.visits.includes(id)) v.visits.push(id)
    saveVoo(v)
    const after = vooState(v)
    return { ...after, gained: after.xp - before.xp, leveledUp: after.level > before.level }
  }
  return null
}
