import { serveStatic } from '@hono/node-server/serve-static'
import { readFileSync, existsSync } from 'node:fs'
import { sha, j, placeKey } from '../lib.js'
import { DEMO_SLUG, demoMapArrival } from '../../web/src/demoData.js'
import { DEFAULT_THEME, sanitizeTheme } from '../theme.js'
import { can } from '../plans.js'
import { lockRoute } from '../offers.js'

// Cobrança ainda não existe: sem PAYMENTS=on, nenhum preço aparece no mapa público e nenhum roteiro fica trancado.
const PAYMENTS = process.env.PAYMENTS === 'on'

// mapa de demonstração: criador fictício (@criador_demo) e uma amostra de lugares reais da base;
// marcas, agenda, fotos dos "vídeos" e links de postagem são ilustrativos
const DEMO_MAP = JSON.parse(readFileSync(new URL('../demo-map.json', import.meta.url), 'utf8'))
const DEMO_BIO = "Lugares de São Paulo para tomar café sem pressa, levar quem vem de fora e voltar sempre que bate a vontade de comer bem.\n\nTem padaria de bairro, restaurante para um jantar mais caprichado, bar para encontrar os amigos e alguns passeios. Escolha um e vá.\n\nMapa de demonstração: o criador, as marcas, a agenda e os vídeos são fictícios."
const EVENTS = new Set(['session', 'search', 'place_open', 'route_click', 'post_open', 'video_open', 'request'])
const REPORT_REASONS = ['Informação errada', 'Sou o dono e quero corrigir', 'Conteúdo enganoso ou sem aviso de publicidade', 'Spam ou abuso']
const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))

export default function publicRoutes(app, x) {
  const { db, cfg } = x
  const live = (slug) => db.prepare("SELECT * FROM creators WHERE slug=? AND status='approved' AND published=1").get(String(slug || '').toLowerCase())
  const pubPlace = (p, slug) => ({ photo: p.photo_v && slug ? `/api/public/${slug}/places/${p.id}/photo?v=${p.photo_v}` : null, id: p.id, name: p.name, address: p.address, municipality: p.municipality, neighborhood: p.neighborhood, lat: p.lat, lon: p.lon, geoQuality: p.geo_quality, category: p.category, postUrl: p.post_url, postedOn: p.posted_on, ad: !!p.ad, tiktokId: p.post_id, couponCode: p.coupon_code || null, couponNote: p.coupon_note || null, googleUrl: p.google_url || null, instagramUrl: p.instagram_url || null, hours: j(p.hours, null) })
  const livePlaces = (id) => db.prepare("SELECT * FROM places WHERE creator_id=? AND status='confirmed' AND geo_status='found' AND lat IS NOT NULL AND hidden=0 ORDER BY id").all(id)

  // ---------- miniguias: roteiros que o criador liberou e a equipe escolheu ----------
  app.get('/api/miniguias', (c) => {
    const rows = db.prepare("SELECT r.id, r.name, r.note, r.place_ids, c.* , r.id AS rid, r.name AS rname FROM routes r JOIN creators c ON c.id=r.creator_id WHERE r.share=1 AND r.featured=1 AND c.status='approved' AND c.published=1 ORDER BY r.id DESC").all()
    const guides = rows.flatMap((r) => {
      const v = x.view(live(r.slug))
      if (!can(v.plan.tier, 'roteiros')) return []
      const ids = new Set(j(r.place_ids, []))
      const places = livePlaces(v.id).filter((p) => ids.has(p.id)).map((p) => pubPlace(p, r.slug))
      if (!places.length) return []
      return [{ id: r.rid, name: r.rname, note: r.note || '', by: v.displayName, handle: v.handle, count: places.length, city: places[0].municipality || '', photo: places.find((p) => p.photo)?.photo || null, avatar: null, href: `/@${r.slug}/roteiros/${r.rid}` }]
    })
    return c.json({ guides })
  })

  // ---------- mapa de um criador ----------
  app.get('/api/public/:slug', (c, next) => {
    // mapa de demonstração (dados fictícios), aberto a qualquer pessoa, sem cadastro
    if (c.req.param('slug') !== DEMO_SLUG) return next()
    // o mapa abre em São Paulo, mesmo com lugares visitados em viagem
    const theme = { ...sanitizeTheme({ ...DEFAULT_THEME, accent: '#FFC400', bg: '#FFFFFF', tone: 'light', shape: 'circle', bio: DEMO_BIO, social: { instagram: true, tiktok: false } }), start: 'pick', startView: { lat: -23.565, lon: -46.655, zoom: 11.5 } }
    return c.json({ creator: { handle: 'criador_demo', tiktok: null, slug: DEMO_SLUG, displayName: 'Criador Demo', theme, links: [], cover: false, symbols: {}, demo: true, showBrand: false, ...demoMapArrival() }, places: DEMO_MAP.places, routes: DEMO_MAP.routes })
  })
  app.get('/api/public/:slug', (c) => {
    const row = live(c.req.param('slug'))
    if (!row) return c.json({ error: 'indisponivel' }, 404)
    const v = x.view(row)
    const places = livePlaces(row.id).map((p) => pubPlace(p, row.slug))
    const ids = new Set(places.map((p) => p.id))
    const blocks = Object.fromEntries(v.theme.layout.blocks.map((b) => [b.id, b.on]))
    const routes = db.prepare('SELECT id, name, note, color, place_ids, stops, price, products, sponsor, video FROM routes WHERE creator_id=? ORDER BY pos, id').all(row.id)
      .map((r) => ({ video: r.video || null, id: r.id, name: r.name, note: r.note, color: r.color || null, price: PAYMENTS && can(v.plan.tier, 'sellRoteiros') ? r.price || null : null, products: can(v.plan.tier, 'products') ? j(r.products, []) : [], sponsor: can(v.plan.tier, 'sponsoredRoteiros') ? j(r.sponsor, null) : null, placeIds: j(r.place_ids, []).filter((i) => ids.has(i)), stops: j(r.stops, []).map((s) => ({ ...s, placeId: ids.has(s.placeId) ? s.placeId : null })).filter((s) => s.placeId || s.title || s.text) })).filter((r) => (can(v.plan.tier, 'roteiros') && (r.placeIds.length || r.stops.length))).map((r) => lockRoute(r, false))
    return c.json({
      creator: {
        handle: v.handle, tiktok: v.tiktok, slug: v.slug, displayName: v.displayName, theme: v.theme, showBrand: !v.plan.can.removeBrand, routesOn: v.plan.can.roteiros,
        links: blocks.links ? v.links.filter((l) => l.on) : [], cover: v.hasCover && v.theme.layout.cover,
        symbols: Object.fromEntries(x.symbolMap(row.id, true).map((s) => [s.id, { d: s.d, vb: s.vb, mode: s.mode }])),
      },
      places, routes,
    })
  })
  app.get('/api/public/:slug/places/:id/photo', (c) => {
    const row = live(c.req.param('slug'))
    const id = Number(c.req.param('id'))
    const ok = row && db.prepare("SELECT 1 FROM places WHERE id=? AND creator_id=? AND status='confirmed' AND hidden=0").get(id, row.id)
    const m = ok && db.prepare('SELECT mime, data FROM place_media WHERE place_id=?').get(id)
    return m ? c.body(m.data, 200, { 'Content-Type': m.mime, 'Cache-Control': 'public, max-age=86400' }) : c.body(null, 404)
  })
  app.get('/api/public/:slug/cover', (c) => {
    const row = live(c.req.param('slug'))
    const m = row && db.prepare('SELECT mime, data FROM media WHERE creator_id=?').get(row.id)
    if (!m) return c.body(null, 404)
    return c.body(m.data, 200, { 'Content-Type': m.mime, 'Cache-Control': 'public, max-age=300' })
  })
  app.post('/api/e', async (c) => {
    const b = await c.req.json().catch(() => ({}))
    if (b.slug === DEMO_SLUG) return c.json({ ok: true, demo: true }) // o mapa de demonstração não gera métricas
    const row = live(b.slug)
    if (!row || !EVENTS.has(b.type)) return c.json({ ok: false }, 400)
    const term = b.term ? String(b.term).replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '').replace(/https?:\/\/\S+/g, '').replace(/\+?\d[\d\s().-]{8,}\d/g, '').trim().slice(0, 60) : null
    const ref = ['instagram', 'tiktok', 'direto', 'outros'].includes(b.ref) ? b.ref : null
    db.prepare('INSERT INTO events(creator_id,type,term,place_id,results,sid,ts,dev,ref,ret) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(row.id, b.type, term, Number.isInteger(b.placeId) ? b.placeId : null, Number.isInteger(b.results) ? b.results : null, String(b.sid || '').slice(0, 40), Date.now(), b.dev === 'm' ? 'm' : b.dev === 'd' ? 'd' : null, ref, b.ret ? 1 : 0)
    return c.json({ ok: true })
  })
  app.post('/api/report', async (c) => {
    const b = await c.req.json().catch(() => ({}))
    const row = db.prepare('SELECT id FROM creators WHERE slug=?').get(String(b.slug || '').toLowerCase())
    if (!row || !REPORT_REASONS.includes(String(b.reason))) return c.json({ ok: false }, 400)
    const place = Number.isInteger(b.placeId) ? db.prepare('SELECT id FROM places WHERE id=? AND creator_id=?').get(b.placeId, row.id) : null
    const ip = c.req.header('x-forwarded-for') || 'local'
    db.prepare('INSERT INTO reports(creator_id,place_id,reason,details,ip_hash) VALUES (?,?,?,?,?)').run(row.id, place ? place.id : null, String(b.reason), String(b.details || '').slice(0, 500), sha(`salt:${ip}`).slice(0, 16))
    return c.json({ ok: true })
  })

  // ---------- descoberta em rede: só criadores que aceitaram aparecer ----------
  function groups(consent) {
    const rows = db.prepare(`SELECT p.*, c.slug, c.display_name, c.handle, c.theme, c.consents FROM places p JOIN creators c ON c.id=p.creator_id
      WHERE c.status='approved' AND c.published=1 AND p.status='confirmed' AND p.geo_status='found' AND p.lat IS NOT NULL AND p.hidden=0`).all()
    const map = new Map()
    for (const r of rows) {
      const cons = j(r.consents, {})
      const accent = j(r.theme, {}).accent || '#ff4b2b'
      const key = placeKey(r)
      if (!key) continue
      if (!map.has(key)) map.set(key, { key, name: r.name, address: r.address, lat: r.lat, lon: r.lon, municipality: r.municipality, neighborhood: r.neighborhood, quality: r.geo_quality, creators: [] })
      map.get(key).creators.push({ slug: r.slug, name: r.display_name, handle: r.handle, accent, postedOn: r.posted_on, tiktokId: r.post_id, postUrl: r.post_url, ad: !!r.ad, shared: consent ? !!cons[consent] : true })
    }
    return [...map.values()].map((g) => ({ ...g, creators: g.creators.filter((cr) => cr.shared) })).filter((g) => g.creators.length)
  }
  app.get('/api/network', (c) => {
    const list = groups('network')
    const creators = []
    for (const g of list) for (const cr of g.creators) if (!creators.find((k) => k.slug === cr.slug)) creators.push({ slug: cr.slug, name: cr.name, accent: cr.accent })
    return c.json({ creators, places: list })
  })

  // ---------- restaurantes: reivindicação (verificação por quem administra) e painel ----------
  app.get('/api/restaurants/search', (c) => {
    const q = String(c.req.query('q') || '').trim().toLowerCase()
    if (q.length < 2) return c.json({ results: [] })
    const all = groups(null)
    const aggregated = groups('aggregatesForRestaurants')
    const count = new Map(aggregated.map((g) => [g.key, g.creators.length]))
    return c.json({ results: all.filter((g) => `${g.name} ${g.address || ''}`.toLowerCase().includes(q)).slice(0, 8).map((g) => ({ key: g.key, name: g.name, address: g.address, municipality: g.municipality, neighborhood: g.neighborhood, creators: count.get(g.key) || 0 })) })
  })
  app.post('/api/claims', x.auth, async (c) => {
    const b = await c.req.json().catch(() => ({}))
    const g = groups(null).find((k) => k.key === b.key)
    if (!g) return c.json({ error: 'lugar_nao_encontrado' }, 404)
    const method = ['email', 'manual'].includes(b.method) ? b.method : null
    if (!method) return c.json({ error: 'metodo' }, 400)
    const u = c.get('u')
    db.prepare('INSERT OR IGNORE INTO claims(user_id,place_key,place_name,address,method,contact) VALUES (?,?,?,?,?,?)').run(u.id, g.key, g.name, g.address, method, String(b.contact || '').slice(0, 200))
    return c.json({ ok: true })
  })
  app.get('/api/restaurant/panel', x.auth, (c) => {
    const claims = db.prepare("SELECT * FROM claims WHERE user_id=? AND status='approved'").all(c.get('u').id)
    const all = groups('aggregatesForRestaurants')
    return c.json({
      places: claims.map((cl) => {
        const g = all.find((k) => k.key === cl.place_key)
        const list = g ? g.creators : []
        return {
          key: cl.place_key, name: cl.place_name, address: cl.address, neighborhood: g?.neighborhood || null,
          creators: [...new Set(list.map((k) => k.slug))].length, indications: list.map((k) => ({ name: k.name, accent: k.accent, postedOn: k.postedOn, ad: k.ad })),
          ads: list.filter((k) => k.ad).length,
          // não coletamos comentários: a percepção fica "dados insuficientes" até haver fonte autorizada
          perception: { state: 'insufficient', analyzed: 0, minComments: 10 },
        }
      }),
    })
  })

  // ---------- site (arquivos estáticos + SPA, com título/cartão de compartilhamento do mapa) ----------
  app.use('/*', serveStatic({ root: './web/dist' }))
  app.get('*', (c) => {
    if (c.req.path.startsWith('/api/')) return c.json({ error: 'not_found' }, 404)
    const f = 'web/dist/index.html'
    if (!existsSync(f)) return c.text('Rode "npm run build" primeiro.', 503)
    let html = readFileSync(f, 'utf8')
    const host = String(c.req.header('host') || '').split(':')[0].toLowerCase()
    const baseHost = new URL(cfg.baseUrl).hostname
    let slug = (c.req.path.match(/^\/@([a-z0-9_-]+)/i) || [])[1]?.toLowerCase()
    if (!slug && host && host !== baseHost && host !== 'localhost' && host !== '127.0.0.1') {
      const d = db.prepare("SELECT slug FROM creators WHERE domain=? AND domain_status='active'").get(host)
      if (d) { slug = d.slug; html = html.replace('<head>', `<head><script>window.__SLUG__=${JSON.stringify(d.slug)}</script>`) }
    }
    const row = slug && live(slug)
    if (row) {
      const n = livePlaces(row.id).length
      const title = esc(`${row.display_name} · mapa de lugares indicados`)
      const desc = esc(`${n} lugares indicados por @${row.handle}`)
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace('</head>', `<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:type" content="website"></head>`)
    }
    return c.html(html)
  })
}
