import { catsOf } from '../../../server/categories.js'
import MapSnippet from '../lib/MapSnippet.jsx'
import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { embedOf } from './embed.js'
import { api, track } from '../api.js'
import { toast, Link } from '../lib/router.jsx'
import { useMe } from '../lib/me.jsx'
import { Icon } from '../lib/icons.jsx'
import MapCanvas from '../MapCanvas.jsx'
import FakeMap from '../FakeMap.jsx'
import { isLib, libHtml, libIcon, useLibVersion } from '../iconlib.js'
import { STATIC, withBase } from '../lib/base.js'
import { DEMO_SLUG } from '../demoData.js'
import logoUrl from '../brand/logo.svg'
import { cityOf, openState, openLabel, gmapsRoute, GMAPS_MAX } from './extras.js'
import { DAY_LONG } from '../../../server/hours.js'
import { FONTS, catOf, fmtDate, initial, onAccent, symOf } from '../theme.jsx'

export const pubVars = (theme) => {
  const f = FONTS[theme.font] || FONTS.sans
  return { '--acc': theme.accent, '--bg': theme.bg, '--fg': theme.fg, '--r': `${theme.radius}px`, '--onacc': onAccent(theme), '--pf': f.css, '--pt': f.upper ? 'uppercase' : 'none', '--pscale': theme.font === 'disp' ? 1.25 : 1 }
}
export const sub = (p, theme) => `${p.neighborhood || p.municipality || 'São Paulo'} · ${catOf(theme, p.category).name}`
const tint = (c) => `color-mix(in srgb, ${c} 20%, #ffffff)`

// Imagem do lugar: foto quando há uma autorizada; senão, um recorte do mapa.
export function PlacePhoto({ place, theme, size, label = 'foto', style, aspect, watch }) {
  const c = catOf(theme, place.category)
  const [playing, setPlaying] = useState(false)
  if (place.photo) return <div className="pph" style={{ background: tint(c.color), overflow: 'hidden', padding: 0, ...(size ? { width: size, height: size } : {}), ...(aspect ? { aspectRatio: aspect } : {}), ...style }}><img src={place.photo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>
  // sem foto autorizada: recorte do mapa no lugar
  if (Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)) && place.lat !== '' && place.lat != null) return <>
    <MapSnippet place={place} theme={theme} size={size} style={style} aspect={aspect} onWatch={watch && embedOf(place.postUrl) ? () => (watch.demo ? toast('Postagem ilustrativa da demonstração') : setPlaying(true)) : undefined} />
    {playing && <PostPlayer embed={embedOf(place.postUrl)} url={place.postUrl} creator={watch} onClose={() => setPlaying(false)} />}
  </>
  return <div className="pph" style={{ background: tint(c.color), ...(size ? { width: size, height: size } : {}), ...(aspect ? { aspectRatio: aspect } : {}), ...style }}>{label}</div>
}

const hav = (a, b) => { const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2; return 6371 * 2 * Math.asin(Math.sqrt(x)) }
export const NEAR_KM = 5

// Dados do mapa público + sessão
export function usePubData(slug, given) {
  const [state, setState] = useState(given ? { data: given } : { loading: true })
  const [tick, setTick] = useState(0)
  useEffect(() => { const f = () => setTick((n) => n + 1); window.addEventListener('wagli:refetch', f); return () => window.removeEventListener('wagli:refetch', f) }, [])
  useEffect(() => {
    if (given) return setState({ data: given })
    api(`/public/${slug}`).then((data) => { setState({ data }); if (!tick) track(slug, 'session') }).catch(() => setState({ error: true }))
  }, [slug, given, tick])
  return state
}

// Filtros e busca (E6, E10)
export function useFilters(places, { slug, preview } = {}) {
  const [q, setQ] = useState('')
  const [cats, setCats] = useState([])
  const [hoods, setHoods] = useState([])
  const [video, setVideo] = useState(false)
  const [near, setNear] = useState(null)
  const [cities, setCities] = useState([])
  const [openNow, setOpenNow] = useState(false)
  const [clock, setClock] = useState(0)
  useEffect(() => { if (!openNow) return; const h = setInterval(() => setClock((n) => n + 1), 60000); return () => clearInterval(h) }, [openNow])
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    let list = places.filter((p) => (!cats.length || catsOf(p).some((id) => cats.includes(id))) && (!cities.length || cities.includes(cityOf(p))) && (!openNow || openState(p.hours)?.open) && (!hoods.length || hoods.includes(p.neighborhood || p.municipality)) && (!video || p.tiktokId) && (!t || `${p.name} ${p.address || ''} ${p.neighborhood || ''} ${p.municipality || ''}`.toLowerCase().includes(t)))
    if (near) list = list.map((p) => ({ ...p, km: hav(near, p) })).filter((p) => p.km <= NEAR_KM).sort((a, b) => a.km - b.km)
    return list
  }, [places, q, cats, hoods, video, near, cities, openNow, clock])
  useEffect(() => {
    if (preview || !slug || !q.trim()) return
    const h = setTimeout(() => track(slug, 'search', { term: q.trim(), results: shown.length }), 900)
    return () => clearTimeout(h)
  }, [q])
  const toggleNear = (on) => {
    if (!on) return setNear(null)
    if (!navigator.geolocation) return toast('Seu navegador não informa a localização.')
    navigator.geolocation.getCurrentPosition((g) => setNear({ lat: g.coords.latitude, lon: g.coords.longitude }), () => toast('Não foi possível usar a sua localização.'), { timeout: 8000 })
  }
  const active = !!(q.trim() || cats.length || hoods.length || video || near || cities.length || openNow)
  const clear = () => { setQ(''); setCats([]); setHoods([]); setVideo(false); setNear(null); setCities([]); setOpenNow(false) }
  return { q, setQ, cats, setCats, hoods, setHoods, video, setVideo, near, toggleNear, cities, setCities, openNow, setOpenNow, shown, active, clear }
}

// Salvos: sem conta ficam neste aparelho; com conta (e-mail) ficam na conta e valem em qualquer aparelho e em todos os mapas.
export function useSaved(slug) {
  const { me } = useMe()
  const logged = !!me?.user && !STATIC
  const key = `wagli_saved_${slug}`
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
  const [local, setLocal] = useState(read)
  const [remote, setRemote] = useState(null)
  useEffect(() => {
    if (!logged) { setRemote(null); return }
    let on = true
    ;(async () => {
      const mine = read()
      if (mine.length) { try { await api('/saved/merge', { method: 'POST', body: { slug, ids: mine } }); localStorage.removeItem(key); setLocal([]) } catch { /* mantém neste aparelho */ } }
      api(`/saved/${slug}`).then((d) => on && setRemote(d.ids)).catch(() => on && setRemote([]))
    })()
    return () => { on = false }
  }, [logged, slug])
  const toggle = (id) => {
    if (logged && remote) {
      const has = remote.includes(id)
      setRemote((cur) => (has ? cur.filter((x) => x !== id) : [...cur, id]))
      api('/saved', { method: 'POST', body: { slug, placeId: id, saved: !has } }).catch(() => { setRemote((cur) => (has ? [...cur, id] : cur.filter((x) => x !== id))); toast('Não foi possível salvar agora.') })
      return
    }
    setLocal((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
      try { localStorage.setItem(key, JSON.stringify(next)) } catch { toast('Não foi possível guardar neste aparelho.') }
      return next
    })
  }
  return { ids: logged && remote ? remote : local, toggle, logged }
}
// Aviso sobre onde os salvos ficam (e como levar para a conta de explorador)
export function SavedNote({ saved, slug, onLogin }) {
  const { me } = useMe()
  if (saved.logged) return <div className="box xs">Seus salvos ficam na sua conta, em qualquer aparelho. <Link to="/salvos" style={{ fontWeight: 700 }}>Ver salvos de todos os mapas</Link></div>
  if (STATIC && me?.user) return <div className="box xs">Você entrou na demonstração: seus salvos ficam só neste aparelho. <Link to="/salvos" style={{ fontWeight: 700 }}>Ver salvos de todos os mapas</Link></div>
  return (
    <div className="box">
      <b className="sm">Seus salvos estão só neste aparelho</b>
      <span className="xs mut">Entre como explorador para guardá-los na conta e ver os salvos de todos os mapas. Sem senha{STATIC ? ' (na demonstração, nada é enviado)' : ''}.</span>
      {onLogin ? <button type="button" className="pb sm" onClick={onLogin}>Entrar sem sair do mapa</button> : <Link className="pb sm" to={`/entrar?como=explorador&voltar=${encodeURIComponent(`/@${slug}`)}`}>Entrar como explorador</Link>}
    </div>
  )
}
// Entrada do explorador no mapa de um criador: "Entrar" para quem ainda não tem conta; atalho para os salvos (ou o painel) para quem já entrou
export function AccountBtn({ slug, preview }) {
  const { me } = useMe()
  if (me === undefined) return null
  const out = !me.user
  const to = out ? `/entrar?como=explorador&voltar=${encodeURIComponent(`/@${slug}`)}` : me.creator ? '/painel' : '/salvos'
  const label = out ? 'Entrar como explorador' : me.creator ? 'Meu painel' : 'Meus salvos de todos os mapas'
  return <Link className="ms-ib" to={to} aria-label={label} title={label} tabIndex={preview ? -1 : 0} onClick={preview ? (e) => e.preventDefault() : undefined}>{out ? <Icon n="user" s={20} c="currentColor" /> : <span className="ms-me">{initial(me.user.email)}</span>}</Link>
}

// Marca JoyMap no topo do mapa (como no Viver SP). Some no plano Pro (showBrand false). A cor segue o texto do tema do criador.
// Instagram do dono do mapa (respeita a opção do criador no estúdio). Na demonstração o perfil é fictício e não abre nada.
export function InstaLink({ creator, preview, className, children }) {
  if (creator.theme?.social?.instagram === false) return children || null
  const off = preview || (creator.demo && !creator.realProfile)
  return <a className={className} aria-label={`Instagram de ${creator.displayName}`} title={`@${creator.handle} no Instagram`} href={off ? '#' : `https://instagram.com/${creator.handle}`} target="_blank" rel="noopener noreferrer" tabIndex={preview ? -1 : 0} onClick={(e) => { if (!off) return; e.preventDefault(); if (!preview) toast('Perfil fictício da demonstração') }}>{children}<span className="ig-ic" aria-hidden="true"><Icon n="insta" s={16} c="currentColor" /></span></a>
}
// Postagem do criador (lugar ou roteiro). Na demonstração os links são ilustrativos e não abrem nada.
export function PostLink({ url, creator, preview, className = 'pb', onOpen }) {
  const net = /instagram\.com/.test(url) ? 'Instagram' : /tiktok\.com/.test(url) ? 'TikTok' : /youtu\.?be/.test(url) ? 'YouTube' : null
  const video = /\/(reel|reels|video|shorts)\/|youtu/.test(url)
  const off = preview || creator?.demo
  const embed = embedOf(url)
  const [open, setOpen] = useState(false)
  const click = (e) => {
    if (off) { e.preventDefault(); if (!preview) toast('Postagem ilustrativa da demonstração'); return }
    onOpen?.()
    // clique simples abre o player aqui; com Ctrl/Cmd continua abrindo na plataforma
    if (embed && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); setOpen(true) }
  }
  return <>
    <a className={className} href={off ? '#' : url} target="_blank" rel="noopener noreferrer" tabIndex={preview ? -1 : 0} onClick={click}><Icon n={video || embed ? 'play' : 'ext'} s={16} c="currentColor" />{embed ? `Assistir post do ${embed.net}` : `${video ? 'Assistir' : 'Ver postagem'}${net ? ` no ${net}` : ''}`}</a>
    {open && <PostPlayer embed={embed} url={url} creator={creator} onClose={() => setOpen(false)} />}
  </>
}
// Janela com o player; só carrega o conteúdo da plataforma depois do toque
function PostPlayer({ embed, url, creator, onClose }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [onClose])
  return createPortal(
    <div className="postv" role="dialog" aria-modal="true" aria-label={`Postagem de @${creator?.handle}`} onClick={onClose}>
      <div className="postv-box" onClick={(e) => e.stopPropagation()}>
        <div className="postv-top"><b>@{creator?.handle}</b><button type="button" aria-label="Fechar" autoFocus onClick={onClose}><Icon n="close" s={20} c="currentColor" /></button></div>
        <iframe title={`Postagem no ${embed.net}`} src={embed.src} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        <a className="postv-out" href={url} target="_blank" rel="noopener noreferrer">Abrir no {embed.net}</a>
      </div>
    </div>, document.body)
}
export const BRAND_LINE = 'Os lugares de quem você segue.'
export function BrandMark({ preview }) {
  const mask = `url("${logoUrl}") left center / contain no-repeat`
  return <Link className="jm-brand" to="/" aria-label="Mapa feito com JoyMap" tabIndex={preview ? -1 : 0} onClick={preview ? (e) => e.preventDefault() : undefined}><span style={{ WebkitMask: mask, mask }} /></Link>
}

export const NoneOpen = ({ onClear }) => (
  <div className="pstate" style={{ padding: '36px 8px' }}>
    <div className="pcircle"><Icon n="clock" s={30} c="currentColor" /></div>
    <h2 className="pt" style={{ '--fs': '28px' }}>Nada aberto agora</h2>
    <p className="mut sm" style={{ maxWidth: 280 }}>Nenhum lugar com horário informado está aberto neste momento.</p>
    <button className="pb sec" onClick={onClear}>Ver todos os lugares</button>
  </div>
)
// E10 · Sem resultado
export function NoResult({ term, cats, onPick, onRequest, requested }) {
  return (
    <div className="pstate" style={{ padding: '36px 8px' }}>
      <div className="pcircle"><Icon n="search" s={30} c="currentColor" /></div>
      <h2 className="pt" style={{ '--fs': '28px' }}>{term ? `Nada por "${term}"` : 'Nada por aqui'}</h2>
      <p className="mut sm" style={{ maxWidth: 280 }}>Este mapa ainda não tem indicações {term ? 'com esse termo' : 'assim'}. {onRequest ? 'Você pode avisar o criador.' : ''}</p>
      {onRequest && <button className="pb" disabled={requested} onClick={onRequest}>{requested ? 'Pedido enviado' : 'Pedir uma indicação'}</button>}
      {onRequest && <span className="xs mut" style={{ maxWidth: 280 }}>O pedido é contado de forma anônima e aparece para o criador só como número.</span>}
      {!!cats?.length && <div style={{ alignSelf: 'stretch', textAlign: 'left', marginTop: 8 }}><div className="xs mut" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Que tal estes?</div><div className="pchips">{cats.map((c) => <button key={c.id} className="pchip" onClick={() => onPick(c.id)}>{c.name}</button>)}</div></div>}
    </div>
  )
}

// E1 · Página do criador (também é a prévia do Estúdio)
export function Home({ data, shown, f, selectedId, onSelect, go, preview, fake, onShare, saved, coverVer, onRequest, requested, onFilters, openFicha }) {
  const { creator } = data
  const theme = creator.theme
  const blocks = theme.layout.blocks.filter((b) => b.on)
  const usedCats = theme.categories.filter((c) => data.places.some((p) => catsOf(p).includes(c.id))).sort((a, b) => a.name.localeCompare(b.name))
  const sel = shown.find((p) => p.id === selectedId)
  const H = { sm: 240, md: 330, lg: 440 }[theme.layout.mapHeight] || 330
  const colors = useMemoColors(theme)
  const stop = (e) => e.stopPropagation()
  const body = {
    header: (
      <div key="header" className="col" style={{ gap: 10 }}>
        <div className="phead">
          <div className="pav" style={preview ? { width: 44, height: 44, fontSize: 20 } : undefined}>{creator.displayName.slice(0, 1).toUpperCase()}</div>
          <div className="sp"><h1 className="pt" style={{ '--fs': preview ? '19px' : '30px' }}>{creator.displayName}</h1><div className="xs mut" style={{ marginTop: 4 }}>@{creator.handle} · {data.places.length} lugares</div></div>
          <button className="picon" aria-label="Compartilhar" onClick={preview ? undefined : onShare}><Icon n="share" s={18} c="currentColor" /></button>
        </div>
        {theme.bio && <p className="sm" style={{ margin: 0 }}>{theme.bio}</p>}
        {(theme.social.instagram || (theme.social.tiktok && creator.tiktok)) && <div className="psocial">
          {theme.social.instagram && <a className="picon" aria-label="Instagram" href={preview ? undefined : `https://instagram.com/${creator.handle}`} target="_blank" rel="noopener noreferrer"><Icon n="insta" s={18} c="currentColor" /></a>}
          {theme.social.tiktok && creator.tiktok && <a className="picon" aria-label="TikTok" href={preview ? undefined : `https://www.tiktok.com/@${creator.tiktok}`} target="_blank" rel="noopener noreferrer"><Icon n="tiktok" s={18} c="currentColor" /></a>}
        </div>}
      </div>),
    filters: usedCats.length > 0 && (
      <div key="filters" className="pchips"><button className={'pchip' + (!f.cats.length ? ' on' : '')} onClick={() => f.setCats([])}>Todos</button>{usedCats.map((c) => <button key={c.id} className={'pchip' + (f.cats.length === 1 && f.cats[0] === c.id ? ' on' : '')} onClick={() => f.setCats([c.id])}>{c.name}</button>)}</div>),
    map: (
      <div key="map" className="col" style={{ gap: 10 }}>
        <div className="pmap" style={{ height: preview ? Math.round(H * 0.72) : H }}>
          {fake || !data.places.length ? <FakeMap h="100%" tone={theme.tone} shape={theme.shape} colors={colors} acc={theme.accent} n={9} sel={2} lab={false} />
            : <MapCanvas places={shown} theme={theme} symbols={creator.symbols} selectedId={selectedId} onSelect={preview ? undefined : onSelect} interactive={!preview} style={{ height: '100%' }} />}
          {!preview && <button className="pb sm expand" style={{ background: 'var(--bg)', color: 'var(--fg)', borderColor: 'var(--line)' }} onClick={() => go('/mapa')}><Icon n="ext" s={14} c="currentColor" />Tela cheia</button>}
        </div>
        {sel ? (
          <div role="button" tabIndex={0} className="pin" onClick={() => !preview && openFicha(sel.id)} onKeyDown={(e) => e.key === 'Enter' && !preview && openFicha(sel.id)}><PlacePhoto place={sel} theme={theme} size={48} /><span className="sp"><b>{sel.name}</b><span className="xs mut">{sub(sel, theme)}{sel.postedOn ? ` · indicado em ${fmtDate(sel.postedOn).slice(0, 5)}` : ''}</span></span>
            <a className="pb sm" href={`https://www.google.com/maps/dir/?api=1&destination=${sel.lat},${sel.lon}`} target="_blank" rel="noopener noreferrer" onClick={(e) => { stop(e); onSelect?.(sel.id, 'route') }}>Rota</a></div>
        ) : preview && <div className="pin">{(shown[0] || data.places[0]) ? <PlacePhoto place={shown[0] || data.places[0]} theme={theme} size={48} /> : <div className="pph" style={{ width: 48, height: 48, background: 'var(--soft)' }}>foto</div>}<span className="sp"><b>{(shown[0] || data.places[0])?.name || 'Seu lugar aparece aqui'}</b><span className="xs mut">{shown[0] ? sub(shown[0], theme) : 'Bairro · indicado em dd/mm'}</span></span><span className="pb sm">Rota</span></div>}
      </div>),
    list: (
      <div key="list" className="col" style={{ gap: 10 }}>
        <div className="prow"><h2 className="pt sp" style={{ '--fs': '20px' }}>Lugares</h2>{shown.length > 6 && !preview && <button className="pb sm sec" onClick={() => go('/lista')}>Ver todos ({shown.length})</button>}</div>
        {shown.length === 0 && !preview ? <NoResult term={f.q.trim()} cats={usedCats.slice(0, 4)} onPick={(id) => { f.clear(); f.setCats([id]) }} onRequest={f.q.trim() ? onRequest : null} requested={requested} />
          : theme.layout.listStyle === 'rows'
            ? <div className="col" style={{ gap: 8 }}>{shown.slice(0, 6).map((p) => <button key={p.id} className="pin" onClick={() => !preview && openFicha(p.id)}><PlacePhoto place={p} theme={theme} size={44} /><span className="sp"><b>{p.name}</b><span className="xs mut">{sub(p, theme)}</span></span></button>)}</div>
            : <div className="pgrid">{shown.slice(0, preview ? 2 : 6).map((p) => <button key={p.id} className="pcard" onClick={() => !preview && openFicha(p.id)}><PlacePhoto place={p} theme={theme} /><b className="pt" style={{ '--fs': '17px' }}>{p.name}</b><span className="xs mut">{p.neighborhood || p.municipality || ''}</span></button>)}</div>}
      </div>),
    routes: data.routes.length > 0 && (
      <div key="routes" className="col" style={{ gap: 10 }}>
        <div className="prow"><h2 className="pt sp" style={{ '--fs': '20px' }}>Roteiros</h2>{!preview && <button className="pb sm sec" onClick={() => go('/roteiros')}>Ver todos</button>}</div>
        {data.routes.slice(0, 3).map((r) => <button key={r.id} className="pin" onClick={() => !preview && go(`/roteiros/${r.id}`)}><span className="sp"><b className="pt" style={{ '--fs': '18px' }}>{r.name}</b><span className="xs mut">{r.placeIds.length} lugares{r.note ? ` · ${r.note}` : ''}</span></span><Icon n="next" s={18} c="currentColor" /></button>)}
      </div>),
  }
  return (
    <>
      {theme.layout.cover && creator.cover && <div className="pcover" style={{ backgroundImage: `url(${creator.coverUrl || `/api/public/${creator.slug}/cover`}?v=${coverVer || 0})` }} />}
      <div className="pbody">{blocks.map((b) => body[b.id]).filter(Boolean)}</div>
      {creator.showBrand !== false && <div className="pfoot">Mapa feito com <b>JoyMap</b></div>}
    </>
  )
}
export function useMemoColors(theme) {
  return useMemo(() => { const m = {}; for (const c of theme.categories) if (!/^custom:/.test(c.icon)) m[c.icon] = c.color; return m }, [theme.categories])
}

// ---------- roteiro como história: linha do tempo de paradas ----------
// Um roteiro antigo, sem paradas, vira uma linha do tempo só com os lugares na ordem.
export const routeStops = (route) => (route.stops?.length ? route.stops : route.placeIds.map((id) => ({ placeId: id })))
export const hasStory = (route) => (route.stops || []).some((s) => s.text || s.title)
// parada sem lugar no mapa (saída, chegada, volta): um quadro com emoji no espaço da foto
function PassBox({ emoji }) {
  useLibVersion()
  const ic = libIcon(`lib:fluent3d:${emoji || 'round-pushpin'}`)
  return <div className="tl-pass" aria-hidden="true">{ic && <i dangerouslySetInnerHTML={{ __html: libHtml(ic, 72) }} />}</div>
}
export function RouteTimeline({ route, places, theme, openFicha, preview }) {
  const stops = routeStops(route)
  return (
    <div className="tl-wrap">
    <ol className="tl" aria-label={`Linha do tempo: ${route.name}`}>
      {stops.map((st, i) => {
        const p = st.placeId != null ? places.find((x) => x.id === st.placeId) : null
        const title = st.title || p?.name || 'Parada'
        return (
          <li key={i} className="tl-i">
            <span className={'tl-n' + (p ? '' : ' txt')} aria-hidden="true">{i + 1}</span>
            <div className="tl-b">
              {st.when && <span className="tl-w">{st.when}</span>}
              <h3 className="pt">{title}</h3>
              {!p && <PassBox emoji={st.emoji} />}
              {p && <button type="button" className="tl-ph" aria-label={`Ver ${p.name}`} tabIndex={preview ? -1 : 0} onClick={() => !preview && openFicha?.(p.id)}><PlacePhoto place={p} theme={theme} aspect="16/9" style={{ width: '100%', borderRadius: 14 }} /></button>}
              {st.text && <p>{st.text}</p>}
              {st.tip && <div className="tl-tip"><b>Dica</b>{st.tip}</div>}
              {p && <button type="button" className="tl-pl" tabIndex={preview ? -1 : 0} onClick={() => !preview && openFicha?.(p.id)}><Icon n="pin" s={16} c="currentColor" /><span className="sp"><b className="sm">{p.name}</b><span className="xs" style={{ display: 'block', opacity: 0.7 }}>{sub(p, theme)}</span></span><Icon n="next" s={16} c="currentColor" /></button>}
            </div>
          </li>)
      })}
    </ol>
    </div>
  )
}
// Aberto agora (só para lugares com horário informado)
export const OpenTag = ({ place }) => (openState(place.hours)?.open ? <span className="opn"><i aria-hidden="true" />Aberto agora</span> : null)
export function HoursBlock({ place }) {
  if (!place.hours) return null
  const open = openState(place.hours)?.open
  const today = new Date().getDay()
  return (
    <div className="box">
      <span className="ms-sec" style={{ marginTop: 0 }}>Horário de funcionamento</span>
      <b className="sm" style={{ color: open ? '#0a7c4a' : 'inherit' }}>{openLabel(place.hours)}</b>
      <details><summary className="xs mut" style={{ cursor: 'pointer' }}>Ver todos os dias</summary>
        <ul className="hrs">{place.hours.map((h, i) => <li key={i} className={i === today ? 'on' : ''}><span>{DAY_LONG[i]}</span><span>{h ? `${h[0]} às ${h[1]}` : 'Fechado'}</span></li>)}</ul>
      </details>
    </div>
  )
}
// Capa do roteiro: os emojis das categorias dos lugares, sem repetir, os mais frequentes primeiro (até 3).
const EMOJI = 'lib:fluent3d:'
// categorias antigas que ainda usam ícone de linha no catálogo
const PLAIN = { rest: 'fork-and-knife-with-plate', store: 'ticket', pizza: 'pizza', burger: 'hamburger', cafe: 'hot-beverage', bread: 'croissant', cake: 'birthday-cake', bar: 'cocktail-glass' }
export function RouteEmojis({ places, theme }) {
  useLibVersion()
  const count = places.reduce((m, p) => m.set(p.category, (m.get(p.category) || 0) + 1), new Map())
  const icons = [...new Set([...count].sort((a, b) => b[1] - a[1]).map(([id]) => { const i = catOf(theme, id).icon; return isLib(i) && !i.startsWith('lib:lucide:') ? i : EMOJI + (PLAIN[i] || (i.startsWith('lib:lucide:ice') ? 'soft-ice-cream' : 'round-pushpin')) }))].slice(0, 3)
  return <span className="rc-emo" aria-hidden="true">{icons.map((id) => { const ic = libIcon(id); return <i key={id} dangerouslySetInnerHTML={{ __html: ic ? libHtml(ic, 28) : '' }} /> })}</span>
}
// Roteiro patrocinado: etiqueta e logo da marca parceira, sempre visíveis no cartão
export const SponsorMark = ({ s }) => s ? <span className="sp-logo" title={`Patrocinado por ${s.brand}`}>{s.logo ? <img src={withBase(s.logo)} alt={s.brand} /> : <b>{s.brand}</b>}</span> : null
export const SponsorTag = ({ s }) => s ? <span className="sp-tag">Roteiro patrocinado</span> : null
// Roteiro pago: o seguidor vê só as primeiras paradas. A cobrança ainda não existe; na demonstração a compra é simulada.
export function RouteLock({ route, preview }) {
  const [busy, setBusy] = useState(false)
  const buy = async () => { setBusy(true); try { await api(`/public/${DEMO_SLUG}/buy`, { method: 'POST', body: { routeId: route.id } }); window.dispatchEvent(new Event('wagli:refetch')); toast('Roteiro liberado (simulação)') } finally { setBusy(false) } }
  return (
    <div className="rt-lock" role="note">
      <span className="rt-lockic" aria-hidden="true"><Icon n="lock" s={18} c="currentColor" /></span>
      <div className="sp">
        <b>Prévia: {route.stops.length} de {route.stopCount} paradas</b>
        <p>O roteiro completo, com todas as histórias e dicas, custa R$ {route.price}.</p>
        {STATIC ? <><button type="button" className="pb" disabled={busy || preview} tabIndex={preview ? -1 : 0} onClick={buy}>Comprar roteiro · R$ {route.price}</button><span className="xs" style={{ display: 'block', marginTop: 6, opacity: 0.7 }}>Simulação: na demonstração ninguém é cobrado.</span></> : <span className="xs" style={{ opacity: 0.7 }}>A compra ainda não está disponível.</span>}
      </div>
    </div>
  )
}
// Produtos que o criador indica no roteiro (plano Pro): links dele, abrem em outra aba
export function RouteProducts({ products, preview }) {
  return (
    <section className="rt-prod" aria-label="Produtos deste roteiro">
      <h3 className="pt">Produtos deste roteiro</h3>
      <ul>{products.map((p, i) => <li key={i}><a href={p.url} target="_blank" rel="noopener noreferrer nofollow sponsored" tabIndex={preview ? -1 : 0} onClick={(e) => preview && e.preventDefault()}>{p.image && <img className="rt-pimg" src={withBase(p.image)} alt={p.title} loading="lazy" />}<span className="sp"><b className="sm">{p.title}</b>{p.price && <span className="xs" style={{ display: 'block', opacity: 0.7 }}>{p.price}</span>}</span><Icon n="next" s={16} c="currentColor" /></a></li>)}</ul>
      <span className="xs" style={{ opacity: 0.7 }}>Links indicados pelo criador.</span>
    </section>
  )
}
// Corpo de um roteiro aberto: escolhe como ver (linha do tempo, lista ou, no celular, o mapa)
export function RouteBody({ route, places, theme, openFicha, renderList, onMap, preview }) {
  const story = hasStory(route)
  const [view, setView] = useState(story ? 'timeline' : 'list')
  useEffect(() => { setView(story ? 'timeline' : 'list') }, [route.id])
  const gm = gmapsRoute(route, places)
  const opts = [['timeline', 'Linha do tempo'], ['list', 'Lista'], ...(onMap ? [['map', 'Mapa']] : [])]
  return (
    <>
      {route.sponsor && <div className="sp-bar"><span>Em parceria com</span><SponsorMark s={route.sponsor} /></div>}
      {route.note && <p className="ms-bio">{route.note}</p>}
      <div className="rt-bar">
        <div className="rt-seg" role="group" aria-label="Como ver o roteiro">{opts.map(([k, l]) => <button key={k} type="button" className={view === k ? 'on' : ''} aria-pressed={view === k} tabIndex={preview ? -1 : 0} onClick={() => { if (k === 'map') onMap(); else setView(k) }}>{l}</button>)}</div>
        {gm && <a className="pb sec sm rt-maps" href={gm.url} target="_blank" rel="noopener noreferrer" tabIndex={preview ? -1 : 0} onClick={(e) => preview && e.preventDefault()}><Icon n="route" s={16} c="currentColor" />Abrir no Google Maps</a>}
      </div>
      {gm?.cut > 0 && <p className="xs mut rt-cut">O Google Maps recebe as {GMAPS_MAX} primeiras paradas.</p>}
      {view === 'timeline' ? <RouteTimeline route={route} places={places} theme={theme} openFicha={openFicha} preview={preview} /> : renderList()}
      {route.locked && <RouteLock route={route} preview={preview} />}
      {route.products?.length > 0 && <RouteProducts products={route.products} preview={preview} />}
    </>
  )
}
