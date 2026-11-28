import React, { useMemo, useState } from 'react'
import { Link } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { Top, SiteFooter } from '../lib/ui.jsx'
import { Accordion, FinalCta } from './trust.jsx'
import { Floaters, DoodleDefs } from './doodles.jsx'
import { FAQ } from './faq.js'

// Tema de cada pergunta, na ordem de faq.js
const CAT = ['Começar', 'Conexão', 'Conexão', 'Mapa', 'Mapa', 'Mapa', 'Seguidores', 'Seguidores', 'Seguidores', 'Seguidores', 'Insights', 'Privacidade', 'Privacidade', 'Privacidade', 'Privacidade', 'Planos', 'Planos', 'Planos', 'Planos']
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function FaqPage() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Todas')
  const all = useMemo(() => FAQ.map(([qq, a], i) => ({ q: qq, a, c: CAT[i] || 'Geral' })), [])
  const cats = useMemo(() => ['Todas', ...Array.from(new Set(all.map((x) => x.c)))], [all])
  const list = all.filter((x) => (cat === 'Todas' || x.c === cat) && (!q.trim() || norm(x.q + ' ' + x.a).includes(norm(q.trim()))))
  return (
    <div className="page lp fqp">
      <DoodleDefs />
      <Top active={4} overlay dark />
      <header className="fqp-hero fl-host">
        <Floaters set="q" />
        <div className="w fqp-in">
          <span className="tag">Perguntas frequentes</span>
          <h1 className="d h-hero">Tudo o que um criador quer saber antes de começar.</h1>
          <p className="lead">Integrações, privacidade, personalização e planos, sem letras miúdas. Busque pelo que você precisa.</p>
          <label className="fqp-search"><Icon n="search" s={20} c="currentColor" /><span className="sr">Buscar uma pergunta</span>
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setCat('Todas') }} placeholder="Buscar uma pergunta" autoComplete="off" />
            {q && <button type="button" className="fqp-x" aria-label="Limpar busca" onClick={() => setQ('')}><Icon n="close" s={16} c="currentColor" /></button>}
          </label>
          <div className="fqp-chips" role="group" aria-label="Filtrar por tema">
            {cats.map((c) => <button key={c} type="button" aria-pressed={cat === c} className={cat === c ? 'on' : ''} onClick={() => { setCat(c); setQ('') }}>{c}<i>{c === 'Todas' ? all.length : all.filter((x) => x.c === c).length}</i></button>)}
          </div>
        </div>
      </header>

      <section className="fqp-body" aria-label="Perguntas e respostas">
        <div className="w fqp-grid">
          <aside className="fqp-side">
            <div className="fqp-card">
              <span className="gd-ex">Fale com a gente</span>
              <h2 className="d s32">Não achou a sua resposta?</h2>
              <hr />
              <p>Peça o seu mapa e a gente responde na análise do perfil. Ou explore um mapa de demonstração agora.</p>
              <div className="fqp-cta"><Link className="btn dk" to="/entrar?criar=1">Pedir convite</Link><Link className="link sm" to="/@demo">Ver um mapa de exemplo</Link></div>
            </div>
            <Link className="fqp-back" to="/"><Icon n="back" s={16} c="currentColor" />Voltar ao início</Link>
          </aside>
          <div className="fqp-list">
            <p className="fqp-count" role="status" aria-live="polite">{list.length === all.length ? `${all.length} perguntas` : `${list.length} de ${all.length} perguntas`}{cat !== 'Todas' ? ` · ${cat}` : ''}{q.trim() ? ` · “${q.trim()}”` : ''}</p>
            {list.length
              ? <Accordion key={cat + '|' + q} items={list.map((x) => [x.q, x.a])} />
              : <div className="fqp-empty"><b className="d s26">Nenhuma pergunta encontrada.</b><p>Tente outra palavra ou limpe os filtros.</p><button type="button" className="btn ln" onClick={() => { setQ(''); setCat('Todas') }}>Limpar filtros</button></div>}
          </div>
        </div>
      </section>
      <FinalCta />
      <SiteFooter />
    </div>
  )
}
