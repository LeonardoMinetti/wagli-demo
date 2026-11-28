import { catsOf } from '../../../server/categories.js'
import { googleSearchUrl } from '../../../server/placelinks.js'
import VisitButton from './VisitButton.jsx'
import MapSheet, { PubTabs } from './MapSheet.jsx'
import PlaceFicha from './PlaceFicha.jsx'
import DeskAscend from './DeskAscend.jsx'
import { useOwnerIcon } from '../lib/favicon.js'
import DeskMap from './Desk.jsx'
import React, { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { api, track } from '../api.js'
import { BASE, STATIC } from '../lib/base.js'
import { byCity, citiesOf, withExtras } from './extras.js'
import { Link, navigate, toast, useLocation } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import MapCanvas from '../MapCanvas.jsx'
import { catOf, fmtDate, initial } from '../theme.jsx'
import { Home, NoResult, PlacePhoto, RouteBody, HoursBlock, SavedNote, pubVars, sub, useFilters, usePubData, useSaved, NEAR_KM, PostLink } from './shared.jsx'

const useMedia = (q) => { const [m, setM] = useState(() => matchMedia(q).matches); useEffect(() => { const l = matchMedia(q); const f = () => setM(l.matches); l.addEventListener('change', f); return () => l.removeEventListener('change', f) }, [q]); return m }
const Sw = ({ on, onChange, label }) => <button type="button" role="switch" aria-checked={on} aria-label={label} className={'psw' + (on ? ' on' : '')} onClick={() => onChange(!on)} />

// E8 · Compartilhar
function ShareSheet({ url, title, onClose }) {
  const [qr, setQr] = useState('')
  useEffect(() => { QRCode.toDataURL(url, { margin: 1, width: 220 }).then(setQr).catch(() => {}) }, [url])
  const copy = () => navigator.clipboard?.writeText(url).then(() => toast('Link copiado')).catch(() => toast(url))
  return (
    <div className="psheetwrap" onClick={onClose}><div className="psheet" onClick={(e) => e.stopPropagation()}>
      <div className="prow"><h2 className="pt sp" style={{ '--fs': '26px' }}>Compartilhar</h2><button className="picon" aria-label="Fechar" onClick={onClose}><Icon n="close" s={20} c="currentColor" /></button></div>
      <div className="prow" style={{ background: 'var(--soft)', borderRadius: 12, padding: '10px 10px 10px 14px' }}><div className="sp"><b className="sm">{title}</b><div className="xs mut" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url.replace(/^https?:\/\//, '')}</div></div><button className="pb sm" onClick={copy}>Copiar</button></div>
      <div className="prow" style={{ gap: 16 }}><div style={{ width: 104, height: 104, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, display: 'grid', placeItems: 'center' }}>{qr && <img src={qr} alt="QR code" width="96" height="96" />}</div><div className="sp xs mut">Aponte a câmera para abrir este mapa.</div></div>
      <div className="plinks" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <a className="pb sm sec" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer">Mensagem</a>
        <button className="pb sm sec" onClick={() => { copy(); toast('Link copiado: cole no adesivo de link dos Stories') }}>Stories</button>
        <button className="pb sm sec" onClick={() => (navigator.share ? navigator.share({ title, url }).catch(() => {}) : copy())}>Mais</button>
      </div>
    </div></div>
  )
}

// E11 · Denunciar
const REASONS = ['Informação errada', 'Sou o dono e quero corrigir', 'Conteúdo enganoso ou sem aviso de publicidade', 'Spam ou abuso']
function ReportSheet({ slug, place, creator, onClose }) {
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [done, setDone] = useState(false)
  const send = async () => { if (!STATIC) await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, placeId: place?.id, reason, details }) }).catch(() => {}); setDone(true) }
  return (
    <div className="psheetwrap" onClick={onClose}><div className="psheet" style={{ minHeight: '70dvh' }} onClick={(e) => e.stopPropagation()}>
      <div className="prow"><button className="picon" aria-label="Fechar" onClick={onClose}><Icon n="close" s={20} c="currentColor" /></button><h2 className="pt sp" style={{ '--fs': '24px' }}>Denunciar</h2></div>
      {done ? <><h3 className="pt" style={{ '--fs': '26px' }}>Obrigado</h3><p>Recebemos o aviso. Não guardamos seu IP; usamos só um código anônimo para evitar spam.</p><button className="pb" onClick={onClose}>Fechar</button></> : <>
        <p className="sm mut">Sobre: <b style={{ color: 'var(--fg)' }}>{place ? place.name : 'o mapa inteiro'}</b> no mapa de @{creator.handle}</p>
        {REASONS.map((r) => <button key={r} className="box" style={{ flexDirection: 'row', alignItems: 'center', background: 'transparent', textAlign: 'left', color: 'var(--fg)', borderColor: reason === r ? 'var(--fg)' : undefined, borderWidth: reason === r ? 2 : 1.5, cursor: 'pointer' }} onClick={() => setReason(r)}><span className={'pradio' + (reason === r ? ' on' : '')} /><span className="sm" style={{ fontWeight: reason === r ? 700 : 400 }}>{r}</span></button>)}
        <div><label className="xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }} htmlFor="det">Detalhes (opcional)</label><textarea id="det" rows="3" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Conte o que aconteceu" maxLength="500" style={{ width: '100%', border: '2px solid var(--line)', borderRadius: 12, padding: 12, background: 'var(--bg)', color: 'var(--fg)', font: 'inherit' }} /></div>
        <button className="pb" onClick={send}>Enviar denúncia</button>
        <span className="xs mut" style={{ textAlign: 'center' }}>Não guardamos seu IP; usamos um código anônimo para evitar spam.</span></>}
    </div></div>
  )
}

// E6 · Filtros
function FiltersSheet({ data, f, onClose }) {
  const theme = data.creator.theme
  const cats = theme.categories.filter((c) => data.places.some((p) => catsOf(p).includes(c.id))).sort((a, b) => a.name.localeCompare(b.name))
  const cityNav = byCity(data.places)
  const hoods = cityNav ? citiesOf(data.places).map(([c]) => c) : [...new Set(data.places.map((p) => p.neighborhood || p.municipality).filter(Boolean))].sort().slice(0, 14)
  const [picked, setPicked] = cityNav ? [f.cities, f.setCities] : [f.hoods, f.setHoods]
  const flip = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  return (
    <div className="psheetwrap" onClick={onClose}><div className="psheet" onClick={(e) => e.stopPropagation()}>
      <div className="prow"><h2 className="pt sp" style={{ '--fs': '26px' }}>Filtros</h2><button className="pb sm sec" onClick={() => { f.clear() }}>Limpar</button></div>
      <div><div className="xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Categoria</div><div className="pchips">{cats.map((c) => <button key={c.id} className={'pchip' + (f.cats.includes(c.id) ? ' on' : '')} onClick={() => flip(f.cats, f.setCats, c.id)}>{c.name}</button>)}</div></div>
      {hoods.length > 0 && <div><div className="xs" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{cityNav ? 'Cidade' : 'Bairro'}</div><div className="pchips">{hoods.map((h) => <button key={h} className={'pchip' + (picked.includes(h) ? ' on' : '')} onClick={() => flip(picked, setPicked, h)}>{h}</button>)}</div></div>}
      <div className="prow"><div className="sp"><b className="sm">Perto de mim</b><div className="xs mut">Usa a localização só neste aparelho, nesta visita (até {NEAR_KM} km)</div></div><Sw on={!!f.near} onChange={f.toggleNear} label="Perto de mim" /></div>
      <div className="prow"><div className="sp"><b className="sm">Só com vídeo</b></div><Sw on={f.video} onChange={f.setVideo} label="Só com vídeo" /></div>
      <button className="pb" onClick={onClose}>Ver {f.shown.length} {f.shown.length === 1 ? 'lugar' : 'lugares'}</button>
    </div></div>
  )
}

// E5 · Vídeo da indicação (player oficial do TikTok)
function VideoFull({ place, creator, onClose, onFicha }) {
  return (
    <div className="pfull">
      <div className="phd"><button className="picon" style={{ color: '#fff', borderColor: '#444' }} aria-label="Fechar" onClick={onClose}><Icon n="close" s={20} c="currentColor" /></button><span className="sp">{place.name}</span></div>
      <div className="col" style={{ alignItems: 'center', gap: 12, padding: 16, flex: 1 }}>
        <iframe className="pvideo" title={`Vídeo: ${place.name}`} src={`https://www.tiktok.com/player/v1/${place.tiktokId}?music_info=1&description=1`} allow="fullscreen" />
        <div className="prow" style={{ width: 300, maxWidth: '100%' }}><div className="sp"><b>@{creator.handle}</b><div className="xs" style={{ color: '#bdbdbd' }}>{place.postedOn ? fmtDate(place.postedOn) : ''}{place.ad ? ' · publicidade declarada' : ''}</div></div>{place.postUrl && <a className="pb sm" href={place.postUrl} target="_blank" rel="noopener noreferrer">Abrir no app</a>}</div>
      </div>
      <div style={{ padding: '14px 20px 22px', width: '100%', maxWidth: 460 }}><button className="pb" style={{ width: '100%', background: '#fff', color: '#171717', borderColor: '#fff' }} onClick={onFicha}>Ver ficha do lugar</button></div>
    </div>
  )
}

// E4 · Ficha do lugar
function Ficha({ place, data, ctx }) {
  return <div className="pbody"><PlaceFicha place={place} data={data} ctx={ctx} /></div>
}

const Tabbar = PubTabs
const Header = ({ title, back, right }) => <div className="phd">{back && <Link to={back} aria-label="Voltar" className="picon" style={{ width: 32, height: 32, border: 0 }}><Icon n="back" s={22} c="currentColor" /></Link>}<span className="sp">{title}</span>{right}</div>
const PlaceRow = ({ p, theme, onClick, right }) => <div className="pin" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()}><PlacePhoto place={p} theme={theme} size={52} /><span className="sp"><b>{p.name}</b><span className="xs mut">{sub(p, theme)}</span></span>{right}</div>

export default function Public({ slug, embed }) {
  const { path, search } = useLocation()
  const st = usePubData(slug)
  useOwnerIcon(embed ? null : st.data?.creator?.avatarUrl)
  const places = st.data?.places || []
  const f = useFilters(places, { slug })
  const saved = useSaved(slug)
  const desk = useMedia('(min-width: 960px)')
  const [selectedId, setSelected] = useState(null)
  const [videoId, setVideoId] = useState(null)
  const [overlay, setOverlay] = useState(null) // { kind: 'share'|'report'|'filters', place? }
  const [requested, setRequested] = useState(false)
  const base = window.__SLUG__ ? '' : `/@${slug}`
  const rel = path.slice(base.length) || '/'
  const href = (s) => `${base}${s}` || '/'
  const go = (s) => navigate(href(s))
  const url = `${location.origin}${BASE}${base}`
  const t = (type, extra) => track(slug, type, extra)

  if (st.loading) return <div className="pubstate" style={{ padding: 48 }}>Carregando…</div>
  if (st.error) return (
    <div className="stage"><div className="phone"><div className="bd" style={{ alignItems: 'center', textAlign: 'center', justifyContent: 'center', gap: 18 }}>
      <div className="sq" style={{ width: 72, height: 72, background: 'var(--soft)', display: 'grid', placeItems: 'center' }}><Icon n="pin" s={32} c="#6b6b6b" /></div>
      <h1 className="d s44">Este mapa não está disponível</h1><p className="mut">O criador pausou ou retirou o mapa. Se você acha que é um engano, avise o criador.</p><Link className="btn" to="/exemplos">Ver outros mapas</Link></div></div></div>
  )
  const data = st.data
  const { creator } = data
  const theme = creator.theme
  const sel = places.find((p) => p.id === selectedId)
  const pickPlace = (id, how) => {
    setSelected(id)
    if (how === 'route') t('route_click', { placeId: id })
    else if (how !== 'noevent') t('place_open', { placeId: id })
  }
  const openFicha = (id) => { pickPlace(id); go(`/lugar/${id}`) }
  const ctx = {
    saved, track: t, video: (id) => { setVideoId(id); t('video_open', { placeId: id }) },
    share: (p) => setOverlay({ kind: 'share', place: p }), report: (p) => setOverlay({ kind: 'report', place: p }),
  }
  const request = (term) => { t('request', { term: typeof term === 'string' ? term : f.q.trim() }); setRequested(true); toast('Pedido enviado, de forma anônima') }
  const usedCats = theme.categories.filter((c) => places.some((p) => catsOf(p).includes(c.id))).sort((a, b) => a.name.localeCompare(b.name))
  const fichaMatch = rel.match(/^\/lugar\/(\d+)$/)
  // paradas que só existem em um roteiro também abrem a ficha
  const fichaPlace = fichaMatch && [...places, ...data.routes.flatMap((r) => r.extraPlaces || [])].find((p) => p.id === Number(fichaMatch[1]))
  const routeMatch = rel.match(/^\/roteiros\/(\d+)$/)
  const route = routeMatch && data.routes.find((r) => r.id === Number(routeMatch[1]))
  const videoPlace = places.find((p) => p.id === videoId)
  const shareUrl = overlay?.place ? `${url}/lugar/${overlay.place.id}` : url
  const overlays = (
    <>
      {overlay?.kind === 'share' && <ShareSheet url={shareUrl} title={overlay.place ? overlay.place.name : creator.displayName} onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'report' && <ReportSheet slug={slug} place={overlay.place} creator={creator} onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'filters' && <FiltersSheet data={data} f={f} onClose={() => setOverlay(null)} />}
      {videoPlace && <VideoFull place={videoPlace} creator={creator} onClose={() => setVideoId(null)} onFicha={() => { setVideoId(null); go(`/lugar/${videoPlace.id}`) }} />}
    </>
  )
  const wrapStyle = pubVars(theme)

  // Incorporar em outro site: só o mapa
  if (embed || rel === '/incorporar') return (
    <div className="pub embed" style={wrapStyle}><MapCanvas places={places} theme={theme} symbols={creator.symbols} selectedId={selectedId} onSelect={(id) => pickPlace(id)} style={{ height: '100dvh' }} />
      {sel && <div className="sheetfull"><PlaceRow p={sel} theme={theme} onClick={() => window.open(url, '_blank')} right={<a className="pb sm" href={`https://www.google.com/maps/dir/?api=1&destination=${sel.lat},${sel.lon}`} target="_blank" rel="noopener noreferrer">Rota</a>} /></div>}</div>
  )

  // ?visual=antigo continua abrindo o mapa anterior (vale até fechar a aba); ?visual=novo volta
  const visual = search.get('visual')
  if (visual) try { sessionStorage.setItem('joymap:mapa', visual) } catch { /* sem armazenamento */ }
  let keep = visual
  try { keep = visual || sessionStorage.getItem('joymap:mapa') } catch { /* sem armazenamento */ }
  if (keep !== 'antigo') return <div className="pub" style={{ ...wrapStyle, width: '100%' }}><DeskAscend mobile={!desk} f={f} onRequest={request} requested={requested} onShare={() => setOverlay({ kind: 'share' })} data={data} slug={slug} ctx={ctx} initialPlace={fichaPlace ? fichaPlace.id : null} initialRoute={route ? route.id : null} initialTab={rel.startsWith('/salvos') ? 'salvos' : ['roteiros', 'sobre', 'salvos'].includes(search.get('p')) ? search.get('p') : 'lugares'} />{overlays}</div>

  // E12 · computador: painel largo à esquerda e mapa à direita (organização de guia), com o design do celular
  if (desk) {
    const initialView = rel.startsWith('/salvos') ? 'salvos' : rel.startsWith('/roteiros') ? 'roteiros' : ['bairros', 'categorias', 'busca', 'roteiros', 'salvos'].includes(search.get('p')) ? (['roteiros', 'salvos'].includes(search.get('p')) ? search.get('p') : 'home') : 'home'
    return (
      <div className="pub" style={{ ...wrapStyle, width: '100%' }}>
        <DeskMap data={data} f={f} shown={f.shown} openFicha={openFicha} go={go} saved={saved} ctx={ctx} fichaPlace={fichaPlace} onShare={() => setOverlay({ kind: 'share' })} onRequest={request} requested={requested} initialView={initialView} initialRouteId={route ? route.id : null} />
        {overlays}
      </div>
    )
  }

  // celular
  const page = (inner, tabCur) => <div className="stage" style={{ background: `color-mix(in srgb, ${theme.bg} 90%, #888)` }}><div className="pub" style={{ ...wrapStyle, width: '100%', maxWidth: 460, minHeight: '100dvh', display: 'flex', flexDirection: 'column', boxShadow: '0 0 0 1px var(--line)' }}>{inner}{tabCur && <PubTabs cityNav={byCity(data.places)} cur={tabCur} href={href} />}{overlays}</div></div>

  if (fichaMatch) {
    if (!fichaPlace) return page(<><Header title="Lugar não encontrado" back={href('/')} /><div className="pbody"><p className="mut">Este lugar não está mais no mapa.</p></div></>)
    return page(<><Header back={href('/mapa')} title="Voltar ao mapa" right={<button className="picon" aria-label="Salvar" style={{ border: 0 }} onClick={() => saved.toggle(fichaPlace.id)}><Icon n="heart" s={22} c={saved.ids.includes(fichaPlace.id) ? '#d93a1c' : 'currentColor'} /></button>} /><div style={{ flex: 1 }}><Ficha place={fichaPlace} data={data} ctx={ctx} /></div></>)
  }
  if (route) {
    const all = withExtras(places, route)
    const list = route ? route.placeIds.map((id) => all.find((p) => p.id === id)).filter(Boolean) : f.shown
    return page(<>
      <Header back={route ? href('/roteiros') : undefined} title={route ? route.name : `${list.length} lugares`} right={!route && <><Link to={href('/lista')} className="tag2 acc">Lista</Link><Link to={href('/mapa')} className="tag2">Mapa</Link></>} />
      <div className="pbody" style={{ flex: 1 }}>
        {!route && <label className="psearch"><Icon n="search" s={18} c="currentColor" /><input value={f.q} onChange={(e) => f.setQ(e.target.value)} placeholder="Buscar neste mapa" aria-label="Buscar neste mapa" /></label>}
        {route ? <RouteBody creator={data.creator} route={route} places={all} theme={theme} openFicha={openFicha} renderList={() => <div className="pgrid">{list.map((p) => <button key={p.id} className="pcard" onClick={() => openFicha(p.id)}><PlacePhoto place={p} theme={theme} /><b className="pt" style={{ '--fs': '17px' }}>{p.name}</b><span className="xs mut">{p.neighborhood || p.municipality || 'São Paulo'}</span></button>)}</div>} />
        : list.length === 0 ? <NoResult term={f.q.trim()} cats={usedCats.slice(0, 4)} onPick={(id) => { f.clear(); f.setCats([id]) }} onRequest={f.q.trim() ? request : null} requested={requested} />
          : <div className="pgrid">{list.map((p) => <button key={p.id} className="pcard" onClick={() => openFicha(p.id)}><PlacePhoto place={p} theme={theme} /><b className="pt" style={{ '--fs': '17px' }}>{p.name}</b><span className="xs mut">{p.neighborhood || p.municipality || 'São Paulo'}</span></button>)}</div>}
      </div></>, '/lista')
  }
  if (rel === '/roteiros') {
    return page(<><Header title="Roteiros" /><div className="pbody" style={{ flex: 1 }}>
      {data.routes.map((r) => { const rp = r.placeIds.map((id) => withExtras(places, r).find((p) => p.id === id)).filter(Boolean); return (
        <Link key={r.id} to={href(`/roteiros/${r.id}`)} className="box" style={{ padding: 0, overflow: 'hidden', gap: 0 }}>
          <div style={{ height: 120, pointerEvents: 'none' }}><MapCanvas places={rp} theme={{ ...theme, cluster: false, mapLabels: false }} symbols={creator.symbols} interactive={false} style={{ height: 120 }} /></div>
          <div className="prow" style={{ padding: '12px 14px' }}><div className="sp"><b className="pt" style={{ '--fs': '24px' }}>{r.name}</b><div className="xs mut" style={{ marginTop: 4 }}>{r.placeIds.length} lugares{r.note ? ` · ${r.note}` : ''}</div></div><Icon n="next" s={20} c="currentColor" /></div></Link>) })}
      {!data.routes.length && <div className="pstate"><div className="pcircle"><Icon n="route" s={30} c="currentColor" /></div><h2 className="pt" style={{ '--fs': '26px' }}>Sem roteiros ainda</h2><p className="mut sm">Este criador ainda não montou roteiros.</p></div>}
    </div></>, '/roteiros')
  }
  if (rel === '/salvos') {
    const mine = places.filter((p) => saved.ids.includes(p.id))
    return page(<><Header title="Salvos" right={<span className="tag2">{mine.length} lugares</span>} /><div className="pbody" style={{ flex: 1 }}>
      <SavedNote saved={saved} slug={creator.slug} />
      {mine.map((p) => <PlaceRow key={p.id} p={p} theme={theme} onClick={() => openFicha(p.id)} right={<button className="picon" style={{ border: 0 }} aria-label="Remover dos salvos" onClick={(e) => { e.stopPropagation(); saved.toggle(p.id) }}><Icon n="heart" s={22} c="#d93a1c" /></button>} />)}
      {!mine.length && <p className="mut sm c">Nada salvo ainda. Toque no coração de um lugar.</p>}
    </div></>, '/salvos')
  }
  // E1 · mapa do criador no celular: mapa em tela cheia + folha inferior (padrão do Viver SP)
  return (
    <div className="stage" style={{ background: `color-mix(in srgb, ${theme.bg} 90%, #888)` }}>
      <div className="pub msroot" style={{ ...wrapStyle, width: '100%', maxWidth: 460, height: '100dvh', boxShadow: '0 0 0 1px var(--line)' }}>
        <MapSheet data={data} shown={f.shown} f={f} selectedId={selectedId} onSelect={pickPlace} openFicha={openFicha} href={href} saved={saved} onShare={() => setOverlay({ kind: 'share' })} onRequest={request} requested={requested} near={f.near} snap={rel === '/lista' || ['sobre', 'lugares'].includes(search.get('p')) ? 'full' : 'half'} openPanel={['bairros', 'categorias', 'busca', 'roteiros', 'salvos'].includes(search.get('p')) ? search.get('p') : null} />
        {overlays}
      </div>
    </div>
  )
}
