// Mapa público: no computador, lista à esquerda e mapa em cartão à direita; no celular, conteúdo ou mapa.
import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { addBasemap } from '../basemap.js'
import { Link, toast } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { catOf, fmtDate, pinHtml, symOf } from '../theme.jsx'
import { catsOf } from '../../../server/categories.js'
import { libIcon, libHtml, useLibVersion } from '../iconlib.js'
import { PlacePhoto, RouteEmojis, pubVars, InstaLink, BrandMark, BRAND_LINE, NoneOpen, SavedNote, OpenTag, RouteLock, RouteProducts, NoResult } from './shared.jsx'
import { track } from '../api.js'
import { latest as newestOf, highlights, brandsOf, agendaOf } from '../lib/arrival.js'
import { routePath, gmapsRoute, withExtras, citiesOf, byCity, hasHours } from './extras.js'
import { withBase } from '../lib/base.js'
import PlaceFicha from './PlaceFicha.jsx'
import SponsorStory from './SponsorStory.jsx'
import MapLogin from './MapLogin.jsx'
import { useMe } from '../lib/me.jsx'
import './deskAscend.css'

const emoji = (cat, s) => { const ic = libIcon(String(cat.icon).startsWith('lib:') ? cat.icon : 'lib:fluent3d:round-pushpin'); return ic ? libHtml(ic, s) : '' }
const Emo = ({ cat, s = 16 }) => <i className="as-emo" aria-hidden="true" dangerouslySetInnerHTML={{ __html: emoji(cat, s) }} />
const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function CardMap({ places, theme, symbols, active, path, me, onPick, onHover, view }) {
  const el = useRef(null), map = useRef(null), layer = useRef(null), fitted = useRef('')
  const v = useLibVersion()
  useEffect(() => {
    const m = L.map(el.current, { zoomControl: false, maxZoom: 16 }).setView([-23.565, -46.655], 12)
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    m.attributionControl.setPrefix(false)
    layer.current = L.layerGroup().addTo(m); map.current = m
    return () => { m.stop(); m._onZoomTransitionEnd = () => {}; m.remove() }
  }, [])
  useEffect(() => addBasemap(map.current, theme.tone, { labels: theme.mapLabels, labelOpacity: 0.25 + (theme.labelDensity / 100) * 0.75 }), [theme.tone, theme.mapLabels, theme.labelDensity])
  useEffect(() => {
    layer.current.clearLayers()
    const stops = (path || []).map((x) => ({ n: x.n, p: places.find((p) => p.id === x.id) })).filter((x) => x.p)
    if (stops.length > 1) L.polyline(stops.map((x) => [x.p.lat, x.p.lon]), { color: theme.tone === 'dark' ? '#fff' : '#171713', weight: 3, dashArray: '2 9', interactive: false }).addTo(layer.current)
    const num = new Map(stops.map((x) => [x.p.id, x.n]))
    if (me) L.circleMarker([me.lat, me.lon], { radius: 8, color: '#fff', weight: 3, fillColor: '#2f6fdb', fillOpacity: 1, interactive: false }).addTo(layer.current)
    for (const p of places) {
      const on = p.id === active, cat = catOf(theme, p.category)
      const { n, sym } = symOf(cat, symbols)
      const pin = pinHtml({ color: cat.color, shape: theme.shape, n, sym, selected: on, size: theme.pinSize, border: theme.pinBorder, selStyle: theme.selected })
      const label = on ? `<span class="as-tag${theme.shape === 'drop' ? ' high' : ''}">${esc(p.name)}</span>` : ''
      const nb = num.has(p.id) ? `<span class="as-num">${num.get(p.id)}</span>` : ''
      L.marker([p.lat, p.lon], { zIndexOffset: on ? 1000 : 0, icon: L.divIcon({ className: 'pinwrap', iconSize: [0, 0], html: pin + nb + label }) })
        .addTo(layer.current).on('click', () => onPick(p.id)).on('mouseover', () => onHover?.(p.id))
    }
  }, [places, active, path, v, theme, me])
  useEffect(() => {
    const key = places.map((p) => p.id).join()
    // nas prévias do site a vista é fixa: os pins aparecem um a um sem o mapa se mexer
    if (view) return void map.current.setView([view.lat, view.lon], view.zoom, { animate: false })
    if (!places.length || fitted.current === key) return
    fitted.current = key
    map.current.fitBounds(L.latLngBounds(places.map((p) => [p.lat, p.lon])), { padding: [48, 48], maxZoom: 15 })
  }, [places])
  return <div ref={el} className="as-map" role="application" aria-label="Mapa dos lugares" />
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const DateBox = ({ date }) => <span className="as-date"><b>{Number(date.slice(8))}</b>{MONTHS[Number(date.slice(5, 7)) - 1]}</span>
const Spine = ({ icon, title, count, children }) => <div className="as-row"><span className="as-dot spark">{icon}</span><h1 className="pt">{title}</h1>{count != null && <span className="as-count">{count}</span>}{children}</div>

export default function DeskAscend({ data: original, slug, ctx, initialTab = 'lugares', initialRoute = null, initialPlace = null, initialShowMap = false, mobile = false, f: filters, onShare, onRequest, requested, preview = false }) {
  const [pop, setPop] = useState(null) // filtro aberto: 'bairros' | 'categorias'
  const popT = useRef(null)
  const openPop = (k) => { clearTimeout(popT.current); setPop(k) }
  const closePop = () => { clearTimeout(popT.current); popT.current = setTimeout(() => setPop(null), 220) }
  useEffect(() => { if (!pop) return; const k = (e) => e.key === 'Escape' && setPop(null); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [pop])
  const [showMap, setShowMap] = useState(initialShowMap)
  const [account, setAccount] = useState(false) // entrar ou ver a conta, por cima do mapa
  const { me } = useMe()
  // celular: ao rolar para baixo a busca vira um ícone; no topo ela volta inteira
  const [compact, setCompact] = useState(false)
  const searchRef = useRef(null), root = useRef(null)
  useEffect(() => {
    if (!mobile) return
    const f = (e) => {
      const el = e.target === document ? document.scrollingElement : e.target
      if (!el.contains(root.current)) return // só a rolagem da própria página
      if (preview && el === document.scrollingElement) return // a prévia não reage à rolagem do site
      const y = el.scrollTop
      setCompact((c) => (c ? y > 8 : y > 96))
    }
    document.addEventListener('scroll', f, true)
    return () => document.removeEventListener('scroll', f, true)
  }, [mobile])
  const openSearch = () => { setCompact(false); window.scrollTo({ top: 0, behavior: 'smooth' }); searchRef.current?.focus({ preventScroll: true }) }
  const theme = original.creator.theme
  const data = useMemo(() => ({ ...original, creator: { ...original.creator, theme } }), [original, theme])
  const { creator, places } = data
  const [tab, setTab] = useState(initialRoute ? 'roteiros' : initialTab)
  const [routeId, setRouteId] = useState(initialRoute)
  const [view, setView] = useState('timeline')
  const [over, setOver] = useState(null) // roteiro sob o mouse
  const first = creator.demo && !creator.realProfile ? creator.displayName : creator.displayName.split(' ')[0]
  const Me = ({ s: size }) => creator.avatarUrl ? <img className="as-meface" src={creator.avatarUrl} alt="" style={{ width: size, height: size }} /> : <span className="as-meface" style={{ width: size, height: size }}>{first[0]}</span>
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [hood, setHood] = useState('')
  const [latest, setLatest] = useState(false)
  const [limit, setLimit] = useState(12)
  const [active, setActive] = useState(null)
  const [open, setOpen] = useState(initialPlace)
  useLibVersion()
  // abertos agora, perto de mim e cidade vêm dos mesmos filtros do mapa atual
  const base = filters?.shown || places
  const city = filters?.cities?.length === 1 ? filters.cities[0] : ''
  const cities = useMemo(() => citiesOf(places), [places])
  const cityFirst = byCity(places)
  const anyHours = hasHours(places)
  const showBrand = creator.showBrand !== false
  const pickCity = (c) => { filters?.setCities(c ? [c] : []); setHood(''); setPop(null) }
  const cats = theme.categories.filter((c) => places.some((p) => catsOf(p).includes(c.id))).sort((a, b) => a.name.localeCompare(b.name))
  const hoods = [...new Set(places.map((p) => p.neighborhood).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  const found = useMemo(() => {
    const t = fold(q)
    const list = base.filter((p) => (!cat || catsOf(p).includes(cat)) && (!hood || p.neighborhood === hood) && (!t || fold(`${p.name} ${p.neighborhood} ${catOf(theme, p.category).name} ${p.about}`).includes(t)))
    return latest ? [...list].sort((a, b) => String(b.postedOn).localeCompare(String(a.postedOn))) : list
  }, [base, q, cat, hood, latest])
  useEffect(() => {
    if (preview || !q.trim()) return
    const h = setTimeout(() => track(slug, 'search', { term: q.trim(), results: found.length }), 900)
    return () => clearTimeout(h)
  }, [q])
  const shown = useMemo(() => found.slice(0, limit), [found, limit])
  useEffect(() => { setLimit(12); setActive(null) }, [q, cat, hood, latest, city, filters?.openNow, filters?.near])
  const sponsored = data.routes.find((r) => r.sponsor)
  const route = tab === 'roteiros' ? data.routes.find((r) => r.id === routeId) : null
  const everyone = useMemo(() => [...places, ...data.routes.flatMap((r) => r.extraPlaces || [])], [places, data])
  const place = open != null ? everyone.find((p) => p.id === open) : null
  const placesOf = (r) => { const all = withExtras(places, r); return r.placeIds.map((id) => all.find((p) => p.id === id)).filter(Boolean) }
  // no Sobre o mapa fica na cidade principal; viagens não afastam o zoom
  const home = useMemo(() => { const c = Object.entries(places.reduce((m, p) => ((m[p.municipality] = (m[p.municipality] || 0) + 1), m), {})).sort((x, y) => y[1] - x[1])[0]?.[0]; return places.filter((p) => p.municipality === c) }, [places])
  const mapped = useMemo(() => {
    if (place) return [place]
    if (route) return placesOf(route)
    if (tab === 'roteiros') { const r = data.routes.find((x) => x.id === over); return r ? placesOf(r) : [...new Map(data.routes.flatMap(placesOf).map((p) => [p.id, p])).values()] }
    if (tab === 'salvos') return everyone.filter((p) => ctx.saved.ids.includes(p.id))
    return tab === 'sobre' ? home : shown
  }, [place, route, tab, over, shown, places, data, ctx.saved.ids])
  const path = useMemo(() => (!place && route ? routePath(route) : undefined), [place, route])
  const countOf = (id) => places.filter((p) => catsOf(p).includes(id)).length
  const catName = cats.find((c) => c.id === cat)?.name
  const FILTERS = [
    ...(cityFirst ? [['cidades', city || 'Cidades', 'globe', !!city]] : [['bairros', hood || 'Bairros', 'map', !!hood]]),
    ['categorias', catName || 'Categorias', 'grid', !!cat],
    ...(!cityFirst && cities.length > 1 ? [['cidades', city || 'Cidades', 'globe', !!city]] : []),
  ]
  const pickHood0 = (h) => { setHood(h); setPop(null) }
  const pickCat0 = (c) => { setCat(c); setPop(null) }
  const POP = {
    bairros: { title: 'Bairros', all: 'Todos os bairros', value: hood, pick: pickHood0, items: hoods.map((h) => [h, h, places.filter((p) => p.neighborhood === h).length]) },
    cidades: { title: 'Cidades', all: 'Todas as cidades', value: city, pick: pickCity, items: cities.map(([c, n]) => [c, c, n]) },
    categorias: { title: 'Categorias', all: 'Todas as categorias', value: cat, pick: pickCat0, items: cats.map((c) => [c.id, c.name, countOf(c.id), c]) },
  }
  const saved = ctx.saved.ids.map((id) => everyone.find((p) => p.id === id)).filter(Boolean)
  // abrir um lugar conta no painel do criador, como no mapa atual
  const see = (id) => { if (!preview) ctx.track('place_open', { placeId: id }); setOpen(id); window.scrollTo(0, 0) }
  const RouteCard = ({ r }) => (
    <button type="button" className={'as-rt' + (over === r.id ? ' on' : '') + (r.sponsor ? ' sp' : '')} onClick={() => openRoute(r.id)}>
      {r.sponsor && r.cover
        ? <span className="as-rt-emo photo"><img src={r.cover.url} alt="" loading="lazy" /><small>Foto: {r.cover.credit}</small></span>
        : <span className="as-rt-emo"><RouteEmojis places={placesOf(r)} theme={theme} /></span>}
      <span className="as-rt-tx">
        {r.sponsor && <span className="as-rt-top"><small>Roteiro patrocinado</small><Logo s={r.sponsor} /></span>}
        <b className="pt">{r.name}</b>
        <span>{r.note}</span>
        <em>{(r.stops?.length || r.placeIds.length)} paradas →</em>
      </span>
    </button>)
  // o toque na postagem (no canto) abre o vídeo; no resto, abre o lugar
  const openIf = (id) => (e) => { if (!e.target.closest('.mcover, .postv')) see(id) }
  // o cartão inteiro abre o lugar; botões, links e a postagem continuam fazendo o que fazem
  const openCard = (id) => (e) => { if (id != null && !e.target.closest('a, button, .mcover, .postv, [role=button]') && !String(window.getSelection())) see(id) }
  const go = (t) => { setPop(null); setShowMap(false); setTab(t); setRouteId(null); setOpen(null); setActive(null); window.scrollTo(0, 0) }
  const openRoute = (id) => { setTab('roteiros'); setRouteId(id); setOpen(null); setActive(null); setView('timeline'); window.scrollTo(0, 0) }
  const first_ = first
  const Logo = ({ s: sp }) => <img className="as-logo" src={withBase(sp.logo)} alt={sp.brand} />
  const brands = brandsOf(creator)
  const [event, ...later] = agendaOf(creator)
  const hl = highlights(places, theme.categories)
  return (
    <div ref={root} className={'as pub' + (compact && !q ? ' compact' : '') + (theme.fg === '#ffffff' ? ' dark' : '') + (mobile ? ' m' : '') + (mobile && showMap ? ' map' : '') + (showBrand ? ' has-brand' : '')} style={pubVars(theme)}>
      <header className="as-top">
        <div className="as-id">
          {showBrand && <span className="as-brand" title={BRAND_LINE}><BrandMark preview={preview} /></span>}
          <button type="button" className="as-who" onClick={() => go('sobre')}>{creator.avatarUrl && <img src={creator.avatarUrl} alt="" />}<span><b>{creator.displayName}</b><small>@{creator.handle}</small></span></button>
          <InstaLink creator={creator} preview={preview} className="ig-link" />
        </div>
        <label className="as-search"><Icon n="search" s={17} c="currentColor" /><input ref={searchRef} value={q} onChange={(e) => { setQ(e.target.value); setTab('lugares'); setRouteId(null); setOpen(null); setShowMap(false) }} placeholder={mobile ? 'Buscar neste mapa' : 'O que você quer comer ou conhecer?'} aria-label="Buscar neste mapa" /></label>
        {mobile && <button type="button" className="as-find" aria-label="Buscar neste mapa" tabIndex={compact ? 0 : -1} aria-hidden={!compact} onClick={openSearch}><Icon n="search" s={20} c="currentColor" /></button>}
        <div className="as-right">
          <nav className="as-nav">{[['lugares', 'Lugares', 'pin'], ['roteiros', 'Roteiros', 'route'], ['sobre', 'Sobre', 'me']].map(([k, l, i]) => <button key={k} type="button" className={tab === k ? 'on' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>{i === 'me' ? <Me s={18} /> : <Icon n={i} s={16} c="currentColor" />}{l}</button>)}</nav>
          <div className="as-tools">
            <button type="button" className={'ms-ib' + (tab === 'salvos' ? ' on' : '')} aria-label={`Salvos (${saved.length})`} title="Salvos" onClick={() => go('salvos')}><Icon n="heart" s={20} c="currentColor" />{saved.length > 0 && <em>{saved.length}</em>}</button>
            <button type="button" className="ms-ib" aria-label="Compartilhar" title="Compartilhar" onClick={() => !preview && onShare?.()}><Icon n="share" s={20} c="currentColor" /></button>
            <button type="button" className="ms-ib as-acc" aria-label={me?.user ? 'Sua conta' : 'Entrar'} title={me?.user ? 'Sua conta' : 'Entrar'} aria-haspopup="dialog" onClick={() => !preview && setAccount(true)}>{me?.user ? <span className="ms-me">{me.user.email[0].toUpperCase()}</span> : <Icon n="user" s={20} c="currentColor" />}</button>
          </div>
        </div>
      </header>

      <main className="as-col">
        {place ? <div className="as-ficha">
          <button type="button" className="as-chip" onClick={() => setOpen(null)}><Icon n="back" s={14} c="currentColor" />Voltar</button>
          <PlaceFicha place={place} data={data} ctx={ctx} />
        </div> : tab === 'salvos' ? <div className="as-spine">
          <Spine icon={<Icon n="heart" s={14} c="currentColor" />} title={ctx.saved.logged ? 'Salvos na sua conta' : 'Salvos neste aparelho'} count={saved.length} />
          {saved.map((p) => <article key={p.id} className={'as-stop-card as-saved'} onMouseEnter={() => setActive(p.id)} onClick={openCard(p.id)}>
            <div className="as-ph" role="button" tabIndex={0} onClick={openIf(p.id)} onKeyDown={(e) => e.key === 'Enter' && see(p.id)} aria-label={`Ver ${p.name}`}><PlacePhoto place={p} theme={theme} aspect="1/1" style={{ width: '100%' }} /></div>
            <div className="as-info"><h2><button type="button" onClick={() => see(p.id)}>{p.name}</button></h2><span className="as-hood">{p.neighborhood || p.municipality} · {catOf(theme, p.category).name}</span>
              <button type="button" className="as-chip" onClick={() => ctx.saved.toggle(p.id)}><Icon n="heart" s={14} c="#d93a1c" />Remover</button></div>
          </article>)}
          {!saved.length && <p className="as-empty">Toque em Salvar em um lugar para guardá-lo aqui.</p>}
          <SavedNote saved={ctx.saved} slug={creator.slug} onLogin={() => !preview && setAccount(true)} />
        </div> : tab === 'roteiros' && !route ? <div className="as-spine">
          <Spine icon="✦" title={`Roteiros de ${first_}`} count={data.routes.length} />
          {data.routes.map((r) => <article key={r.id} className="as-card" onMouseEnter={() => setOver(r.id)}>
            <RouteCard r={r} />
          </article>)}
        </div> : route ? <div className="as-spine">
          <button type="button" className="as-chip" onClick={() => setRouteId(null)}><Icon n="back" s={14} c="currentColor" />Roteiros</button>
          <Spine icon="✦" title={route.name} />
          {route.sponsor && <div className="as-partner"><span>Em parceria com</span><Logo s={route.sponsor} /></div>}
          <p className="as-text">{route.note}</p>
          <div className="as-bar">
            <div className="as-seg">{[['timeline', 'Linha do tempo'], ['list', 'Lista']].map(([k, l]) => <button key={k} type="button" className={view === k ? 'on' : ''} onClick={() => setView(k)}>{l}</button>)}</div>
            {gmapsRoute(route, everyone) && <a className="as-chip" href={gmapsRoute(route, everyone).url} target="_blank" rel="noopener noreferrer"><Icon n="route" s={14} c="currentColor" />{mobile ? 'Google Maps' : 'Abrir no Google Maps'}</a>}
          </div>
          {(route.stops?.length ? route.stops : route.placeIds.map((placeId) => ({ placeId }))).map((st, i) => { const p = everyone.find((x) => x.id === st.placeId); if (view === 'list' && !p) return null; return (
            <article key={i} className={'as-stop' + (p && active === p.id ? ' on' : '') + (view === 'list' ? ' list' : '')} onMouseEnter={() => p && setActive(p.id)}>
              <span className="as-dot n">{i + 1}</span>
              {st.when && view === 'timeline' && <span className="as-hood">{st.when}</span>}
              <div className="as-stop-card" onClick={openCard(p?.id)}>
                <button type="button" className="as-ph" disabled={!p} onClick={() => p && see(p.id)} aria-label={p ? `Ver ${p.name}` : st.title}>
                  {p ? <PlacePhoto place={p} theme={theme} aspect="1/1" style={{ width: '100%' }} /> : <span className="as-pass" dangerouslySetInnerHTML={{ __html: (() => { const ic = libIcon(`lib:fluent3d:${st.emoji || 'round-pushpin'}`); return ic ? libHtml(ic, 54) : '' })() }} />}
                </button>
                <div className="as-info"><h2><button type="button" onClick={() => p && see(p.id)}>{st.title || p?.name}</button></h2>
                  {(st.text || p?.about) && view === 'timeline' && <p>{st.text || p.about}</p>}
                  {p && <span className="as-hood">{p.neighborhood || p.municipality} · {catOf(theme, p.category).name}</span>}</div>
              </div>
            </article>) })}
          {route.locked && <RouteLock route={route} preview={preview} />}
          {route.products?.length > 0 && <RouteProducts products={route.products} preview={preview} />}
        </div> : tab === 'sobre' ? <div className="as-spine">
          <Spine icon="✦" title={`Sobre ${first_}`}>{mobile && <span className="as-headacts">{theme.social?.instagram !== false && <InstaLink creator={creator} preview={preview} className="as-share" />}<button type="button" className="as-share" aria-label="Compartilhar este mapa" onClick={() => !preview && onShare?.()}><Icon n="share" s={18} c="currentColor" /></button></span>}</Spine>
          {theme.bio && <div className="as-box"><p className="as-bio">{theme.bio}</p></div>}
          {event && <><Spine icon={<Icon n="clock" s={14} c="currentColor" />} title="Próximo evento" />
            <div className="as-line"><DateBox date={event.date} /><span><b>{event.title}</b><small>{event.place}</small></span></div></>}
          <Spine icon={<Icon n="pin" s={14} c="currentColor" />} title="Últimos lugares" />
          <div className="as-three">{newestOf(places, 3).map((p) => <div key={p.id} role="button" tabIndex={0} onClick={openIf(p.id)} onKeyDown={(e) => e.key === 'Enter' && see(p.id)}><span className="as-ph"><PlacePhoto watch={creator} place={p} theme={theme} aspect="4/3" style={{ width: '100%' }} /></span><b>{p.name}</b><small>{p.neighborhood || p.municipality}</small></div>)}</div>
          <button type="button" className="as-news" onClick={() => go('lugares')}>✦ Ver todos os {places.length} lugares</button>
          {hl.hoods.length > 1 && <><Spine icon={<Icon n="map" s={14} c="currentColor" />} title="Onde mais vai" />
            <div className="as-chips">{hl.hoods.map((h) => <button key={h.name} type="button" className="as-chip" onClick={() => { setHood(h.name); go('lugares') }}>{h.name}<small>{h.n}</small></button>)}</div></>}
          {brands.length > 0 && <><Spine icon={<Icon n="heart" s={14} c="currentColor" />} title={creator.brandsTitle || 'Marcas que me apoiam'} />
            <div className="as-brands">{brands.map((x) => { const mask = x.logo && `url("${withBase(x.logo)}") center / contain no-repeat`; return <span key={x.name} title={x.name}>{x.logo && x.plate ? <img className="as-plate" src={withBase(x.logo)} alt={x.name} /> : x.logo ? <i role="img" aria-label={x.name} style={{ WebkitMask: mask, mask }} /> : <b>{x.name}</b>}</span> })}</div></>}
          {later.length > 0 && <><Spine icon={<Icon n="clock" s={14} c="currentColor" />} title="Agenda" />
            {later.map((e) => <div key={e.date + e.title} className="as-line"><DateBox date={e.date} /><span><b>{e.title}</b><small>{e.place}</small></span></div>)}</>}
          <div className="as-soon"><span>Em breve</span><h2 className="pt">Fique por dentro</h2><p>Novidades, roteiros e promoções de {first_} no seu e-mail.</p><div><input placeholder="seu@email.com" disabled aria-label="Seu e-mail (em breve)" /><button type="button" disabled>Enviar</button></div></div>
        </div> : <div className="as-spine">
          <div className="as-filters"><span className="as-dot"><Icon n="pin" s={14} c="currentColor" /></span>
            <div className={mobile ? 'ms-subnav' : 'dk-subnav'} role="group" aria-label="Filtrar lugares">
              {FILTERS.map(([k, label, icon, on]) => <button key={k} type="button" className={(on ? 'on' : '') + (pop === k ? ' open' : '')} aria-haspopup="true" aria-expanded={pop === k} onMouseEnter={mobile ? undefined : () => openPop(k)} onMouseLeave={mobile ? undefined : closePop} onClick={() => (pop === k ? setPop(null) : openPop(k))}><Icon n={icon} s={15} c="currentColor" /><span>{label}</span><i aria-hidden="true">▾</i></button>)}
              {filters && <>
            {anyHours && <button type="button" className={'as-chip' + (filters.openNow ? ' on' : '')} aria-pressed={!!filters.openNow} onClick={() => filters.setOpenNow(!filters.openNow)}><span className="opn"><i aria-hidden="true" />Abertos agora</span></button>}
            <button type="button" className={'as-chip' + (filters.near ? ' on' : '')} aria-pressed={!!filters.near} onClick={() => filters.toggleNear(!filters.near)}><Icon n="route" s={14} c="currentColor" />Ao meu redor</button>
              </>}
            </div>
            {!mobile && pop && <div className="dk-pop" role="menu" aria-label={POP[pop].title} onMouseEnter={() => clearTimeout(popT.current)} onMouseLeave={closePop}>
              <button type="button" role="menuitem" className={'all' + (!POP[pop].value ? ' on' : '')} onClick={() => POP[pop].pick('')}>{POP[pop].all}</button>
              {POP[pop].items.map(([v, label, n]) => <button key={v} type="button" role="menuitem" className={POP[pop].value === v ? 'on' : ''} onClick={() => POP[pop].pick(v)}>{label}<i>{n}</i></button>)}
            </div>}
          </div>
          
          <div className="as-row"><span className="as-dot spark">✦</span><h1 className="pt">{`Os lugares de ${first}`}</h1><span className="as-count">{found.length}</span>{mobile && <button type="button" className="as-share" aria-label="Compartilhar este mapa" onClick={() => !preview && onShare?.()}><Icon n="share" s={18} c="currentColor" /></button>}</div>
          <div className="as-sort" role="group" aria-label="Ordem da lista">
            {[[false, 'pin', 'Todos'], [true, 'clock', 'Mais recentes']].map(([v, icon, l]) => <button key={l} type="button" className={latest === v ? 'on' : ''} aria-pressed={latest === v} onClick={() => setLatest(v)}><Icon n={icon} s={15} c="currentColor" />{l}</button>)}
          </div>
          {latest && <p className="as-hint">Do mais novo para o mais antigo, pela data da indicação.</p>}

          {shown.map((p, i) => { const c = catOf(theme, p.category); const saved = ctx.saved.ids.includes(p.id); return (
            <React.Fragment key={p.id}>
              <article className={'as-card' + (active === p.id ? ' on' : '')} onMouseEnter={() => setActive(p.id)} onClick={openCard(p.id)}>
                <div className="as-top-row">
                  <div className="as-ph" role="button" tabIndex={0} onClick={openIf(p.id)} onKeyDown={(e) => e.key === 'Enter' && see(p.id)} aria-label={`Ver ${p.name}`}>
                    <PlacePhoto watch={creator} place={p} theme={theme} aspect="1/1" style={{ width: '100%' }} />
                    <span className="as-badge"><Emo cat={c} s={14} />{c.name}</span>
                  </div>
                  <div className="as-info">
                    <span className="as-hood">{p.neighborhood || p.municipality}{latest && p.postedOn ? <b className="as-when">Indicado em {fmtDate(p.postedOn)}</b> : null}{p.ad ? <b className="as-when">Publi</b> : null}<OpenTag place={p} />{p.km != null && <b className="as-when">{p.km < 1 ? `${Math.round(p.km * 1000)} m` : `${p.km.toFixed(1).replace('.', ',')} km`}</b>}</span>
                    <h2><button type="button" onClick={() => see(p.id)}>{p.name}</button></h2>
                    <div className="as-box">
                      
                      <p>{p.about}</p>
                      <div className="as-foot"><small>{p.address}</small><span className="as-acts"><a className="as-way" href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`} target="_blank" rel="noopener noreferrer"><Icon n="route" s={14} c="currentColor" />Como chegar</a><button type="button" className="as-save" aria-pressed={saved} onClick={() => ctx.saved.toggle(p.id)}><Icon n="heart" s={14} c={saved ? '#d93a1c' : 'currentColor'} />{saved ? 'Salvo' : 'Salvar'}</button></span></div>
                    </div>
                  </div>
                </div>
              </article>
              {i === 1 && sponsored && !q && !cat && !hood && !latest && <div className="as-card as-mid" onMouseEnter={() => setOver(sponsored.id)} onMouseLeave={() => setOver(null)}>{RouteCard({ r: sponsored })}</div>}
            </React.Fragment>) })}
          {found.length > shown.length && <button type="button" className="as-more" onClick={() => setLimit(limit + 12)}>Mostrar mais {Math.min(12, found.length - shown.length)}</button>}
          {!found.length && (q.trim() && onRequest ? <NoResult term={q.trim()} cats={cats.slice(0, 4)} onPick={(id) => { setQ(''); setCat(id) }} onRequest={() => onRequest(q.trim())} requested={requested} /> : filters?.openNow ? <NoneOpen onClear={() => filters.setOpenNow(false)} /> : <p className="as-empty">{filters?.near ? 'Nenhum lugar a menos de 5 km de você.' : 'Nada encontrado.'} <button type="button" onClick={() => { setQ(''); setCat(''); setHood(''); filters?.clear() }}>Limpar filtros</button></p>)}
        </div>}
        <div className="pfoot">{showBrand && <>Mapa feito com <b>JoyMap</b><br /></>}<a className="as-osm" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">Mapas © colaboradores do OpenStreetMap</a></div>
      </main>

      <aside className="as-side">{(!mobile || showMap) && <CardMap view={data.fixedView} places={mapped} theme={theme} symbols={creator.symbols} active={place ? place.id : active} path={path} me={filters?.near} onPick={mobile ? setActive : see} onHover={mobile ? undefined : tab === 'sobre' || tab === 'lugares' || route ? setActive : undefined} />}
        {mobile && showMap && (() => { const p = mapped.find((x) => x.id === active); return p ? <button type="button" className="as-peek" onClick={() => { setShowMap(false); see(p.id) }}><span className="as-ph"><PlacePhoto place={p} theme={theme} size={64} /></span><span><small>{p.neighborhood || p.municipality} · {catOf(theme, p.category).name}</small><b>{p.name}</b><em>Ver o lugar →</em></span></button> : null })()}
      </aside>
      {!preview && !place && creator.demo && route?.sponsor && route.cover && route.stops?.length > 0 && <SponsorStory route={route} data={data} Map={CardMap} onBack={() => setRouteId(null)} onPlace={see} />}
      {account && <MapLogin creator={creator} slug={creator.slug} savedCount={saved.length} onSaved={() => go('salvos')} onClose={() => setAccount(false)} />}
      {mobile && pop && <>
        <div className="ms-ovl" onClick={() => setPop(null)} />
        <div className="ms-panel" role="dialog" aria-modal="true" aria-label={POP[pop].title}>
          <div className="ms-ph"><b className="pt">{POP[pop].title}</b><button type="button" className="ms-ib" aria-label="Fechar" onClick={() => setPop(null)}><Icon n="close" s={20} c="currentColor" /></button></div>
          <div className="ms-pb">
            <button type="button" className={'ms-opt' + (!POP[pop].value ? ' on' : '')} onClick={() => POP[pop].pick('')}><span className="sp">{POP[pop].all}</span><i>{places.length}</i></button>
            {POP[pop].items.map(([v, label, n, c]) => { const ic = c && symOf(c, creator.symbols); return <button key={v} type="button" className={'ms-opt' + (POP[pop].value === v ? ' on' : '')} onClick={() => POP[pop].pick(v)}>{ic && <span className="ms-oi" style={{ background: c.color }}><Icon n={ic.n} sym={ic.sym} s={16} c="#fff" /></span>}<span className="sp">{label}</span><i>{n}</i></button> })}
          </div>
        </div>
      </>}
      {mobile && !place && !pop && <button type="button" className="as-flip" onClick={() => { setShowMap(!showMap); setActive(null) }}><Icon n={showMap ? 'grid' : 'map'} s={16} c="currentColor" />{showMap ? 'Ver lista' : 'Ver no mapa'}</button>}
      {mobile && <nav className="as-tabs" aria-label="Seções">{[['lugares', 'Lugares', 'pin'], ['roteiros', 'Roteiros', 'route'], ['sobre', 'Sobre', 'me'], ['salvos', 'Salvos', 'heart']].map(([k, l, i]) => <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => go(k)}>{i === 'me' ? <Me s={22} /> : <Icon n={i} s={20} c="currentColor" />}{l}{k === 'salvos' && saved.length > 0 && <em>{saved.length}</em>}</button>)}<button type="button" className="as-me" aria-haspopup="dialog" onClick={() => !preview && setAccount(true)}>{me?.user ? <span className="ms-me">{me.user.email[0].toUpperCase()}</span> : <Icon n="user" s={20} c="currentColor" />}{me?.user ? 'Conta' : 'Entrar'}</button></nav>}
    </div>
  )
}
