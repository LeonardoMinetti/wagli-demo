// Chegada ao mapa (aba Sobre): quem é o criador, próximo evento, últimos lugares, onde mais vai, marcas e agenda.
import React from 'react'
import { PlacePhoto } from './shared.jsx'
import { Icon } from '../lib/icons.jsx'
import { withBase } from '../lib/base.js'
import { latest, highlights, brandsOf, agendaOf } from '../lib/arrival.js'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const DateBox = ({ date }) => <div className="arr-date"><b>{Number(date.slice(8))}</b><span>{MONTHS[Number(date.slice(5, 7)) - 1]}</span></div>

export default function Arrival({ data, theme, onOpen, onHood, onAll }) {
  const { creator, places } = data
  const h = highlights(places, theme.categories)
  const brands = brandsOf(creator)
  const [event, ...later] = agendaOf(creator)
  const first = String(creator.displayName || '').split(' ')[0]
  return (
    <div className="arr">
      <section aria-label={`Sobre ${creator.displayName}`}>
        <h2 className="arr-h">{creator.demo && !creator.realProfile ? 'Sobre este mapa' : `Sobre ${first}`}</h2>
        {theme.bio && <p className="arr-bio">{theme.bio}</p>}
      </section>

      {event && <section className="arr-event" aria-label="Próximo evento">
        <DateBox date={event.date} />
        <div className="sp"><span className="arr-sub">Próximo evento</span><b>{event.title}</b>{event.place && <span className="arr-where">{event.place}</span>}</div>
        {event.url && <a className="pb sm" href={event.url} target="_blank" rel="noopener noreferrer">Saber mais</a>}
      </section>}

      <section aria-label="Últimos lugares">
        <h2 className="arr-h">Últimos lugares</h2>
        <div className="arr-last">
          {latest(places, 3).map((p) => (
            <button key={p.id} type="button" className="arr-pl" onClick={() => onOpen(p.id)}>
              <PlacePhoto place={p} theme={theme} aspect="4/3" style={{ width: '100%', borderRadius: 'var(--r)' }} />
              <b>{p.name}</b><span>{p.neighborhood || p.municipality || 'São Paulo'}</span>
            </button>))}
        </div>
        <button type="button" className="pb arr-all" onClick={onAll}>Ver todos os {places.length} lugares<Icon n="next" s={16} c="currentColor" /></button>
      </section>

      {h.hoods.length > 1 && <section aria-label="Onde mais vai">
        <h2 className="arr-h">Onde mais vai</h2>
        <div className="arr-chips">{h.hoods.map((b) => <button key={b.name} type="button" className="arr-chip" onClick={() => onHood(b.name)}><Icon n="pin" s={13} c="currentColor" />{b.name}<em>{b.n}</em></button>)}</div>
      </section>}

      {brands.length > 0 && <section aria-label={creator.brandsTitle || 'Marcas que me apoiam'}>
        <h2 className="arr-h">{creator.brandsTitle || 'Marcas que me apoiam'}</h2>
        <ul className="arr-brands">{brands.map((b) => {
          const mask = b.logo && `url("${withBase(b.logo)}") center / contain no-repeat`
          const inner = b.logo && b.plate ? <img className="arr-plate" src={withBase(b.logo)} alt={b.name} /> : b.logo ? <i className="arr-logo" role="img" aria-label={b.name} style={{ WebkitMask: mask, mask }} /> : <b>{b.name}</b>
          return <li key={b.name}>{b.url ? <a href={b.url} target="_blank" rel="noopener noreferrer sponsored" title={b.name}>{inner}</a> : <span title={b.name}>{inner}</span>}</li>
        })}</ul>
      </section>}

      {later.length > 0 && <section aria-label="Agenda">
        <h2 className="arr-h">Agenda</h2>
        <ul className="arr-agenda">{later.map((e) => <li key={e.date + e.title}>
          <DateBox date={e.date} />
          <div className="sp"><b>{e.title}</b>{e.place && <span className="arr-where">{e.place}</span>}</div>
          {e.url && <a className="pb sec sm" href={e.url} target="_blank" rel="noopener noreferrer">Saber mais</a>}
        </li>)}</ul>
      </section>}

      {/* aviso do que vem: ainda não coleta nenhum e-mail, por isso o campo fica desligado */}
      <section className="arr-news" aria-label="Fique por dentro">
        <span className="arr-soon">Em breve</span>
        <h2 className="arr-h">Fique por dentro</h2>
        <p>Novidades, roteiros e promoções {creator.demo && !creator.realProfile ? 'deste mapa' : `de ${first}`} no seu e-mail.</p>
        <div className="arr-news-f"><input type="email" placeholder="seu@email.com" aria-label="Seu e-mail (em breve)" disabled /><button type="button" className="pb" disabled>Enviar</button></div>
      </section>
    </div>
  )
}
