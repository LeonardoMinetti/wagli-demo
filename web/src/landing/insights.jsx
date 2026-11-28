import React, { useState } from 'react'
import { Icon } from '../lib/icons.jsx'
import { NoResult, pubVars } from '../pub/shared.jsx'
import { Phone, Native, Browser } from './device.jsx'
import { PubPreview, DEMO_CATS, DEMO_THEME } from './pubpreview.jsx'
import { useEver, useInView, usePause, useReducedMotion, useSteps } from './motion.jsx'

const em = (n) => ({ lib: `lib:fluent3d:${n}` })
const hl = { background: 'linear-gradient(transparent 60%, var(--hl, var(--acc)) 60%)', padding: '0 4px' }
const TERM = 'ramen na Liberdade'

export const NORES = [['Restaurantes japoneses na Liberdade', 87], ['Brunch em Pinheiros', 64], ['Restaurantes italianos românticos', 48], ['Cafés pet friendly', 32], ['Trilhas perto de São Paulo', 24]]
export const REL = {
  cat: [['Japonês', 100], ['Cafés', 82], ['Italiano', 61], ['Hambúrguer', 44], ['Doces', 30]],
  hood: [['Liberdade', 100], ['Pinheiros', 86], ['Vila Madalena', 64], ['Itaim Bibi', 47], ['Moema', 33]],
  top: [['Izakaya Exemplo', 100], ['Cantina Exemplo', 78], ['Café Exemplo', 63], ['Pizza Exemplo', 41], ['Doceria Exemplo', 28]],
}
const TABS = [['nores', 'Sem resultado'], ['cat', 'Categorias'], ['hood', 'Bairros'], ['top', 'Mais abertos']]
const TAB_NOTE = { cat: 'Interesse relativo por categoria.', hood: 'Interesse relativo por bairro e região.', top: 'Lugares das suas indicações que mais receberam interesse.' }

export function Bars({ rows, abs, hot }) {
  return (
    <ul className="ib">{rows.map(([t, v], i) => (
      <li key={t} className={hot === i ? 'hot' : ''}>
        <span className="ib-t">{t}</span>
        <span className="ib-bar"><i style={{ '--w': `${abs ? Math.round((v / 87) * 100) : v}%`, '--i': i }} /></span>
        <b className="ib-v">{abs ? v : ''}</b>
      </li>))}</ul>
  )
}

export function Insights() {
  const [tab, setTab] = useState('nores')
  const [ref, on] = useInView(0.3)
  const rm = useReducedMotion()
  const { paused } = usePause()
  const ever = useEver(on)
  const step = useSteps(5, { on: on && tab === 'nores', rm, paused, ms: 1700, hold: 3800 })
  const cls = [1, 2, 3, 4].filter((n) => step >= n).map((n) => 'a' + n).join(' ')
  const count = step >= 3 ? 87 : 86
  return (
    <section id="insights" className="sec" aria-labelledby="ins" style={{ background: '#fff' }}>
      <div className="w col" style={{ gap: 44 }}>
        <div className="sec-h"><span className="tag" style={{ alignSelf: 'flex-start', background: 'var(--acc)' }}>JOYMAP INSIGHTS</span>
          <h2 id="ins" className="d h-sec">Seu próximo conteúdo pode estar <span style={hl}>na busca da sua audiência.</span></h2>
          <p className="lead">Descubra o que seus seguidores procuram no seu mapa, inclusive aquilo que você ainda não recomendou.</p></div>
        <div ref={ref} className={`ins ${on ? 'on' : ''} ${rm ? 'rm' : ''} ${paused ? 'paused' : ''} ${cls}`}>
          <div className="ins-ph">
            <Phone h={590} label="Tela pública do mapa: uma busca sem resultado e o pedido de indicação, contado de forma anônima">
              <Native h={590}>
                {ever && <div className="ins-l ins-l1"><PubPreview theme={DEMO_THEME} /></div>}
                <div className="ins-l ins-l2"><div className="pub preview lpv" style={pubVars(DEMO_THEME)}><div className="pbody" style={{ paddingTop: 70 }}><NoResult term={TERM} cats={DEMO_CATS.slice(0, 4)} onRequest={() => {}} requested={step >= 2} /></div></div></div>
              </Native>
              <div className="ins-sr"><Icon n="search" s={15} /><span className="ins-ty">{TERM}</span></div>
            </Phone>
            <p className="ins-cap ins-cap1"><b>1</b>Alguém busca no seu mapa.</p>
            <p className="ins-cap ins-cap2"><b>2</b>Nenhuma indicação corresponde e a pessoa pede uma.</p>
          </div>
          <div className="ins-mid" aria-hidden="true"><span className="ins-chip">+1 busca sem resultado</span><i className="ins-dot" /><span className="ins-anon">contada de forma agregada, sem identificar pessoas</span></div>
          <Browser url="JoyMap · painel do criador · Buscas">
          <div className="ins-db">
            <div className="ins-dbh"><div><b className="d s20" style={{ display: 'block' }}>Buscas e oportunidades</b><span className="xs mut">O que sua audiência procura no seu mapa</span></div><span className="tag wn">Dados ilustrativos</span></div>
            <div className="ins-tabs" role="tablist" aria-label="Visualizações do painel">{TABS.map(([k, l]) => <button key={k} role="tab" id={'tb-' + k} aria-selected={tab === k} aria-controls="ins-panel" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
            <div id="ins-panel" role="tabpanel" aria-labelledby={'tb-' + tab} key={tab} className="ins-pn">
              {tab === 'nores' ? <>
                <div className="ins-sub"><span>Sem resultado · últimos 30 dias</span><span className="ins-count" key={count}><b>{count}</b> <em>buscas</em>{step === 3 && <i className="ins-plus">+1</i>}</span></div>
                <Bars rows={NORES} abs hot={step >= 3 ? 0 : -1} />
                <div className="ins-idea"><span className="ins-ie"><Icon s={34} sym={em('light-bulb')} /></span><div><b>Ideia de conteúdo</b><p>Um roteiro de restaurantes japoneses na Liberdade pode atender a uma demanda que já existe entre sua audiência.</p></div></div>
              </> : <>
                <div className="ins-sub"><span>{TAB_NOTE[tab]}</span></div>
                <Bars rows={REL[tab]} />
              </>}
            </div>
          </div>
          </Browser>
        </div>
        <ul className="ins-kp">
          {[['bar-chart', 'Categorias que despertam interesse'], ['round-pushpin', 'Bairros e regiões procurados'], ['star', 'Recomendações com mais interesse'], ['magnifying-glass-tilted-left', 'Buscas que não encontraram resultado'], ['light-bulb', 'Demandas que podem inspirar novos conteúdos']].map(([e, t]) => <li key={t}><Icon s={30} sym={em(e)} />{t}</li>)}
        </ul>
        <p className="d s26 c" style={{ maxWidth: 820, margin: '0 auto' }}>As redes mostram como um conteúdo performou. O JoyMap pode mostrar <span style={hl}>o que as pessoas tentam encontrar</span> no seu mapa.</p>
      </div>
    </section>
  )
}
