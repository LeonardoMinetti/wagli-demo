import React, { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Link, useLocation } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { Top, SiteFooter, Toggle, useTitle } from '../lib/ui.jsx'
import { Phone, Native } from '../landing/device.jsx'
import { PubPreview, makeTheme, DEMO_THEME, PLACES, withView } from '../landing/pubpreview.jsx'
import BgMap from '../BgMap.jsx'
import { Hero } from '../landing/hero.jsx'
import { FeedVsMap } from '../landing/story.jsx'
import { HowItWorks } from '../landing/flow.jsx'
import { Gallery } from '../landing/showcase.jsx'
import { Insights } from '../landing/insights.jsx'
import { Monetize, PlansBlock, FaqTeaser, FinalCta } from '../landing/trust.jsx'
import { FaqPage } from '../landing/faqpage.jsx'
import { PauseCtx } from '../landing/motion.jsx'
import { InsightsControl } from '../landing/panel.jsx'
import { Floaters, DoodleDefs } from '../landing/doodles.jsx'
const Deco = ({ set, children }) => <div className="fl-host">{children}<Floaters set={set} /></div>
import { SHAPES, TONES, num } from '../theme.jsx'
import { SAMPLE_ICON, EMOJI } from '../iconcat.js'

const useMin = () => { const [n, setN] = useState(null); useEffect(() => { api('/config').then((c) => setN(c.minFollowers)).catch(() => {}) }, []); return n }
const Soon = ({ children }) => <span className="xs mut">{children}</span>

// A1 · Página inicial
// Carrossel infinito de emojis (duas fileiras em sentidos opostos)
const ROW_A = ['pizza', 'hamburger', 'sushi', 'taco', 'hot-beverage', 'cocktail-glass', 'birthday-cake', 'croissant', 'ice-cream', 'green-salad', 'beer-mug', 'doughnut', 'spaghetti', 'bubble-tea']
const ROW_B = ['steaming-bowl', 'cooked-rice', 'french-fries', 'wine-glass', 'cupcake', 'bread', 'tropical-drink', 'fish', 'pancakes', 'cut-of-meat', 'shaved-ice', 'bento-box', 'cookie', 'mate']
function Marquee({ names, pack, rev }) {
  const items = [...names, ...names]
  return (
    <div className={'marq' + (rev ? ' rev' : '')} aria-hidden="true"><div className="marq-track">
      {items.map((n, i) => <span key={i} className="marq-i"><Icon s={88} sym={{ lib: `lib:${pack}:${n}` }} /></span>)}
    </div></div>
  )
}
export function Landing() {
  const min = useMin()
  const [paused, setPaused] = useState(false)
  const { hash } = useLocation()
  useEffect(() => { if (!hash) return; const h = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 120); return () => clearTimeout(h) }, [hash])
  useTitle('')
  return (
    <PauseCtx.Provider value={{ paused, setPaused }}>
      <div className={'page lp' + (paused ? ' nomo' : '')}>
        <Top active={-1} overlay dark />
        <DoodleDefs />
        <Deco set="hero"><Hero /></Deco>
        <Deco set="a"><FeedVsMap /></Deco>
        <Deco set="b"><HowItWorks /></Deco>
        <Deco set="c"><Gallery /></Deco>
        <Deco set="d"><InsightsControl /></Deco>
        <Monetize />
        <Deco set="f"><PlansBlock min={min} /></Deco>
        <FaqTeaser />
        <FinalCta />
        <SiteFooter />
      </div>
    </PauseCtx.Provider>
  )
}

// A2 · Planos e preços (mesmo bloco da landing)
export function Plans() {
  useTitle('Planos')
  const min = useMin()
  return (
    <div className="page lp">
      <Top active={3} />
      <PlansBlock min={min} />
      <SiteFooter />
    </div>
  )
}

// mesma paleta dos cartões de roteiros: amarelo, preto, cinza, menta, lilás e rosa
const EX_COL = [['var(--acc)', 'var(--ink)'], ['var(--ink)', '#fff'], ['#E4E4E4', 'var(--ink)'], ['#A5DFCA', 'var(--ink)'], ['#C9B0E9', 'var(--ink)'], ['#FF8FB1', 'var(--ink)']]
const EX_TONE = { light: 'claro', bright: 'vivo', fiord: 'azul-noite', dark: 'escuro' }
const EX_SHAPE = { drop: 'em gota', circle: 'redondos', square: 'quadrados', hex: 'hexagonais' }
const EXAMPLES = [
  { n: 'Duda Come SP', h: '@dudacomesp', k: 24, tone: 'bright', pal: 'candy', shape: 'circle', pins: 9, cat: 'Doces', av: {} },
  { n: 'Noite Boa', h: '@noiteboa', k: 18, tone: 'dark', pal: 'cool', shape: 'square', pins: 10, cat: 'Bares', av: { background: '#262626', color: '#fff' } },
  { n: 'Padoca Lab', h: '@padocalab', k: 12, tone: 'bright', pal: 'warm', shape: 'drop', pins: 7, cat: 'Cafés', av: { background: '#f1e7d3', color: '#8a5a14' } },
  { n: 'Mar e Mesa', h: '@maremesa', k: 31, tone: 'fiord', pal: 'mono', acc: '#2d7ff9', shape: 'hex', pins: 11, cat: 'Restaurantes', av: { background: '#e4ebf7', color: '#1d4ed8' } },
  { n: 'Café com Roteiro', h: '@cafecomroteiro', k: 15, tone: 'light', pal: 'warm', shape: 'circle', pins: 12, cat: 'Cafés', av: {} },
  { n: 'Verde Prato', h: '@verdeprato', k: 9, tone: 'bright', pal: 'cool', shape: 'drop', pins: 6, cat: 'Viagem', av: { background: '#cde8da', color: '#0b6b4d' } },
]
const EX_ACC = { candy: '#FF8FB1', cool: '#7FB0FF', warm: '#FFC400', mono: '#2d7ff9' }
const exTheme = (e) => withView(makeTheme({ ...DEMO_THEME, tone: e.tone, shape: e.shape, accent: e.acc || EX_ACC[e.pal], ...(e.tone === 'dark' ? { bg: '#171713', fg: '#ffffff' } : {}) }))
export function Examples() {
  useTitle('Exemplos')
  const [f, setF] = useState('Todos')
  const list = EXAMPLES.filter((e) => f === 'Todos' || e.cat === f)
  return (
    <div className="page lp">
      <Top active={1} />
      <div className="w col" style={{ paddingTop: 48, paddingBottom: 56, gap: 28 }}>
        <div className="col" style={{ gap: 10 }}><h1 className="d s56">Mapas de criadores</h1><p className="mut" style={{ maxWidth: 560 }}>Cada criador escolhe o próprio visual. Exemplos fictícios para mostrar a variedade de estilos.</p><Link className="link sm" to="/@demo">Abrir o mapa de demonstração</Link></div>
        <div className="row wrap">{['Todos', 'Restaurantes', 'Cafés', 'Bares', 'Doces', 'Viagem'].map((c) => <button key={c} className={'chip' + (f === c ? ' on' : '')} onClick={() => setF(c)}>{c}</button>)}</div>
        <div className="g3" style={{ gap: 24 }}>
          {list.map((e, i) => {
            const c = EX_COL[i % EX_COL.length]
            return (
              <article key={e.n} className="ex-c" style={{ background: c[0], color: c[1] }}>
                <span className="gd-ex">Exemplo · {e.cat}</span>
                <div className="ex-top"><h3>{e.n}</h3><span className="ex-n">{e.k} lugares</span></div>
                <div className="ex-ph"><Phone h={380} cut label={`Mapa de exemplo de ${e.n}`}><Native h={380} theme={exTheme(e)}><PubPreview name={e.n} handle={e.h.slice(1)} theme={exTheme(e)} places={PLACES.slice(i, i + 8)} view="map" /></Native></Phone></div>
                <hr />
                <p>{e.h} · mapa de demonstração com visual {EX_TONE[e.tone]} e pins {EX_SHAPE[e.shape]}.</p>
              </article>)
          })}
          {!list.length && <p className="mut">Sem exemplos nesta categoria.</p>}
        </div>
        <div className="hero row jb wrap" style={{ padding: '32px 40px' }}><div><h2 className="d s32">O seu pode ser diferente de todos</h2><p className="mut sm">Veja o Estúdio de estilo em ação.</p></div><Link className="btn" to="/entrar?criar=1">Quero meu mapa</Link></div>
      </div>
      <SiteFooter />
    </div>
  )
}

// A4 · Termos e privacidade (estrutura; redação final depende de revisão jurídica)
const TERMS = ['Aceitação e escopo', 'Conta e acesso', 'Conteúdo e publicação', 'Dados de terceiros', 'Consentimentos opcionais', 'Planos e cobrança', 'Encerramento']
export function Terms() {
  useTitle('Termos e privacidade')
  return (
    <div className="page lp">
      <Top active={-1} />
      <div className="w split" style={{ paddingTop: 40, paddingBottom: 48, alignItems: 'flex-start' }}>
        <div className="col" style={{ width: 260, gap: 4, position: 'sticky', top: 90 }}><span className="eb" style={{ marginBottom: 6 }}>Nesta página</span>
          {TERMS.map((t, i) => <a key={t} className="ix" href={`#s${i + 1}`}><b>{String(i + 1).padStart(2, '0')}</b><span>{t}</span></a>)}</div>
        <div className="col" style={{ flex: 1, gap: 18, maxWidth: 700 }}>
          <div className="row"><span className="tag">Versão 0.1</span><span className="tag">Em revisão jurídica</span></div>
          <h1 className="d s56">Termos de uso e privacidade</h1>
          <div className="g3 tm3"><div className="card soft col" style={{ gap: 4 }}><b>Seu conteúdo é seu</b><span className="sm mut">Licença só para hospedar e exibir o mapa.</span></div><div className="card soft col" style={{ gap: 4 }}><b>Sem senha</b><span className="sm mut">Acesso por autorização oficial da plataforma.</span></div><div className="card soft col" style={{ gap: 4 }}><b>Você decide</b><span className="sm mut">Usos extras são opcionais e revogáveis.</span></div></div>
          {TERMS.map((t, i) => (
            <div key={t} id={`s${i + 1}`} className="col" style={{ gap: 10, scrollMarginTop: 90 }}>
              <h2 className="d s26">{String(i + 1).padStart(2, '0')} · {t}</h2>
              {i === 4 ? (
                <div className="card col"><div className="row"><div className="sp"><b>Aparecer no mapa geral</b><div className="sm mut">Seu mapa pode entrar na descoberta em rede.</div></div><span className="sw" /></div><div className="sep" /><div className="row"><div className="sp"><b>Dados agregados para restaurantes</b><div className="sm mut">Contagens sem dados de pessoas.</div></div><span className="sw" /></div></div>
              ) : <p className="mut">Redação em revisão jurídica.</p>}
            </div>))}
          <p className="xs mut">Estes termos ainda não estão em vigor. A redação final depende de revisão jurídica (LGPD e termos das plataformas).</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

// A5 · Perguntas frequentes
export function Faq() {
  useTitle('Perguntas')
  return <FaqPage />
}

// Versão estática de demonstração (GitHub Pages): telas que dependem do servidor mostram este aviso.
export function StaticNotice() {
  useTitle('Versão de demonstração')
  return (
    <div className="page">
      <Top active={-1} />
      <div className="w col" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 96, gap: 18, maxWidth: 560 }}>
        <div className="sq" style={{ width: 72, height: 72, background: 'var(--soft)', display: 'grid', placeItems: 'center' }}><Icon n="pin" s={32} c="#6b6b6b" /></div>
        <h1 className="d s56">Esta tela ainda não está aberta</h1>
        <p className="mut">Esta é uma versão de demonstração para testar a experiência no celular: a página inicial, os planos, as perguntas e o mapa de exemplo funcionam. Candidatura, login, painel e estúdio dependem do servidor da JoyMap e ainda não estão abertos ao público.</p>
        <Link className="btn" to="/@demo">Abrir o mapa de exemplo</Link>
        <Link className="btn sec" to="/">Voltar ao início</Link>
      </div>
    </div>
  )
}

export function Unavailable() {
  useTitle('Mapa indisponível')
  return (
    <div className="page">
      <Top active={-1} />
      <div className="w col" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 96, gap: 18, maxWidth: 560 }}>
        <div className="sq" style={{ width: 72, height: 72, background: 'var(--soft)', display: 'grid', placeItems: 'center' }}><Icon n="pin" s={32} c="#6b6b6b" /></div>
        <h1 className="d s56">Este mapa não está disponível</h1>
        <p className="mut">O criador pausou ou retirou o mapa. Se você acha que é um engano, avise o criador.</p>
        <Link className="btn" to="/exemplos">Ver outros mapas</Link>
      </div>
    </div>
  )
}
