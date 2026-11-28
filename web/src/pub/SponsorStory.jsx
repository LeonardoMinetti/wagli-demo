// Roteiro patrocinado no visual novo: tela inteira, com a cara da marca. Cada dia é um capítulo com o seu mapa e as paradas.
import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '../lib/icons.jsx'
import { toast } from '../lib/router.jsx'
import { withBase, BASE } from '../lib/base.js'
import { libIcon, libHtml, useLibVersion } from '../iconlib.js'
import { PlacePhoto } from './shared.jsx'
import { gmapsRoute, withExtras, routePath } from './extras.js'
import './sponsorStory.css'

// cores de teste: não são as oficiais da marca
const BRAND_LOOKS = {
  areia: ['Areia', { tone: 'bright' }],
  floresta: ['Floresta', { tone: 'dark' }],
  noite: ['Noite', { tone: 'dark' }],
}
const photo = (file, credit) => ({ url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1280`, page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`, credit: `${credit}, CC BY-SA 4.0` })
const HERO = photo('Vale do Corisco com a Cachoeira do Corisco ao fundo.jpg', 'Washeik')
const PHOTOS = {
  901: photo('Barreira2.jpg', 'Lecalmeida'),
  81: photo('Cachoeira do Postinho.jpg', 'Lucas Matheus Gonçalves'),
  905: photo('Cachoeira do Corisco vista de mirante nas redondezas.jpg', 'Washeik'),
  906: photo('Parque Estadual do Cerrado.12.jpg', 'Simplus Menegati'),
  907: photo('Parque Municipal do Lago Azul.1.jpg', 'Simplus Menegati'),
}
const Credit = ({ p }) => <a className="ss-credit" href={p.page} target="_blank" rel="noopener noreferrer">Foto: {p.credit}</a>
function Emoji({ id }) {
  useLibVersion()
  const ic = libIcon(`lib:fluent3d:${id || 'round-pushpin'}`)
  return ic ? <i aria-hidden="true" dangerouslySetInnerHTML={{ __html: libHtml(ic, 84) }} /> : null
}
// onde a pessoa parou, para voltar ao mesmo ponto depois de abrir um lugar
const stoppedAt = new Map()

export default function SponsorStory({ route, data, look = 'areia', Map, onBack, onPlace }) {
  const { creator } = data
  const places = withExtras(data.places, route)
  const [day, setDay] = useState(0)
  const root = useRef(null)
  const days = []
  route.stops.forEach((s, i) => {
    const [label, title] = String(s.when || 'Roteiro').split(' · ')
    if (days.at(-1)?.label !== label) days.push({ label, title, stops: [] })
    days.at(-1).stops.push({ ...s, n: i + 1, place: places.find((p) => p.id === s.placeId) })
  })
  const mapTheme = { ...creator.theme, ...BRAND_LOOKS[look][1], accent: '#171713', pinSize: 45, cluster: false }
  const brand = <img className="ss-logo" src={withBase(route.sponsor.logo)} alt={route.sponsor.brand} />
  const gm = gmapsRoute(route, places)
  const onScroll = () => {
    const el = root.current
    stoppedAt.set(route.id, el.scrollTop)
    const marks = [...el.querySelectorAll('[data-day]')]
    const now = Math.max(0, marks.filter((m) => m.getBoundingClientRect().top < innerHeight * 0.55).length - 1)
    setDay(now)
  }
  useEffect(() => { root.current.scrollTop = stoppedAt.get(route.id) || 0; onScroll() }, [route.id])
  const go = (i) => root.current.querySelector(`[data-day="${i}"]`)?.scrollIntoView({ behavior: 'smooth' })
  const share = () => { const url = `${location.origin}${BASE}/@${creator.slug}/roteiros/${route.id}`; navigator.clipboard?.writeText(url).then(() => toast('Link copiado')).catch(() => toast(url)) }
  const slide = (e, dir) => { const row = e.currentTarget.closest('.ss-stops').querySelector('ol'); row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: 'smooth' }) }
  return (
    <div className={`ss ss-${look}`} ref={root} onScroll={onScroll}>
      <header className="ss-bar">
        <button type="button" className="ss-ib" aria-label="Voltar" onClick={() => { stoppedAt.delete(route.id); onBack() }}><Icon n="back" s={20} c="currentColor" /></button>
        <span className="ss-by"><span>Em parceria com</span>{brand}</span>
        <button type="button" className="ss-ib" aria-label="Compartilhar" onClick={share}><Icon n="share" s={20} c="currentColor" /></button>
        <nav className="ss-days" aria-label="Dias">{days.map((d, i) => <button key={d.label} type="button" className={(i === day ? 'on' : '') + (i < day ? ' done' : '')} aria-current={i === day ? 'step' : undefined} onClick={() => go(i)}><span>{d.label}</span></button>)}</nav>
      </header>

      <section className="ss-hero">
        <img src={HERO.url} alt="Vale com paredões de arenito e cachoeira ao fundo" />
        <div className="ss-hero-tx">
          <h1>{route.name}</h1>
          <p>De São Paulo aos Campos Gerais do Paraná</p>
          <button type="button" className="ss-start" onClick={() => go(0)}>Começar a viagem ↓</button>
        </div>
        <Credit p={HERO} />
      </section>

      <section className="ss-intro">
        <p>Cachoeiras escondidas, cânions e trilhas para quem gosta de sair do asfalto.</p>
        <dl><div><dt>Duração</dt><dd>{days.length} dias</dd></div><div><dt>Paradas</dt><dd>{route.stops.length}</dd></div><div><dt>Saída</dt><dd>São Paulo</dd></div></dl>
        <div className="ss-who">{creator.avatarUrl && <img src={creator.avatarUrl} alt="" />}<span>Roteiro de <b>{creator.displayName}</b></span></div>
        <small>Demonstração de produto, sem parceria comercial contratada. A divisão dos dias é ilustrativa.</small>
      </section>

      {days.map((d, i) => {
        const here = d.stops.filter((s) => s.place)
        const pins = here.map((s) => s.place)
        const dayGm = gmapsRoute({ stops: here.map((s) => ({ placeId: s.place.id })) }, places)
        return (
          <section key={d.label} className="ss-day" data-day={i}>
            <header><b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b><div><span>{d.label} de {days.length}</span><h2>{d.title}</h2></div></header>
            <div className="ss-cols">
              <div className="ss-map">
                {pins.length > 0 && <Map places={pins} theme={mapTheme} symbols={creator.symbols} path={routePath({ stops: here.map((s) => ({ placeId: s.place.id })) }).map((x, k) => ({ ...x, n: here[k].n }))} onPick={onPlace} />}
                {dayGm && <a className="ss-btn ss-dir" href={dayGm.url} target="_blank" rel="noopener noreferrer">Abrir o dia no Google Maps</a>}
              </div>
              <div className="ss-stops">
                <ol>{d.stops.map((s) => <li key={s.n} className={s.place ? '' : 'pass'}>
                  <figure>
                    {!s.place ? <div className="ss-emo"><Emoji id={s.emoji} /></div>
                      : PHOTOS[s.place.id] ? <><img src={PHOTOS[s.place.id].url} alt={s.title} loading="lazy" /><Credit p={PHOTOS[s.place.id]} /></>
                        : <PlacePhoto place={s.place} theme={mapTheme} aspect="4/5" style={{ width: '100%', height: '100%' }} />}
                    <em>{String(s.n).padStart(2, '0')}</em>
                  </figure>
                  <h3>{s.title}</h3>
                  {s.text && <p>{s.text}</p>}
                  {s.place && <button type="button" className="ss-link" onClick={() => onPlace(s.place.id)}>Ver o lugar →</button>}
                </li>)}</ol>
                {d.stops.length > 1 && <div className="ss-arrows"><button type="button" aria-label="Parada anterior" onClick={(e) => slide(e, -1)}><Icon n="back" s={18} c="currentColor" /></button><span>deslize para ver as paradas</span><button type="button" aria-label="Próxima parada" onClick={(e) => slide(e, 1)}><Icon n="next" s={18} c="currentColor" /></button></div>}
              </div>
            </div>
          </section>)
      })}

      <footer className="ss-end">
        <span>Este roteiro é um oferecimento de</span>
        {brand}
        <span className="ss-pending">Site e equipamentos da marca: a definir</span>
        {gm && <a className="ss-btn" href={gm.url} target="_blank" rel="noopener noreferrer">Levar o roteiro para o Google Maps</a>}
        <button type="button" className="ss-btn ghost" onClick={() => { stoppedAt.delete(route.id); onBack() }}>Voltar ao mapa de {creator.displayName.split(' ')[0]}</button>
      </footer>
    </div>
  )
}
