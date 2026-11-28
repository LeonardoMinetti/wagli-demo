import React from 'react'
import { Link } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { Phone, Native, S } from './device.jsx'
import { PubPreview, DEMO_IDENTITIES, MAP_THEME, PLACES6, identityTheme, withView } from './pubpreview.jsx'
import { SocialProfile, ph } from './social.jsx'
import { MIXED_POOL, profileGrid } from '../demoData.js'
import { Scene, useCycle, useEver, useScene } from './motion.jsx'

const PH = 470
// Passo 1 · autorização (tela de demonstração com os componentes do app)
function StepConnect() {
  const { on, rm, paused } = useScene()
  const f = useCycle([1900, 800, 3200], { on, rm, paused })
  return (
    <Phone h={PH} cut label="Demonstração ilustrativa da tela de autorização da conta">
      <Native h={PH}>
        <div className="phone" style={{ height: PH / S - 34 }}>
          <div className="hd"><Icon n="back" s={22} />Conectar conta</div>
          <div className="bd" style={{ gap: 12 }}>
            <span className="tag wn" style={{ alignSelf: 'flex-start' }}>Demonstração ilustrativa</span>
            <h2 className="d s32">Autorize a leitura das suas publicações</h2>
            <p className="mut sm">Você entra pela tela oficial da plataforma. A senha nunca passa pelo JoyMap.</p>
            <div className="card soft col" style={{ gap: 4 }}><b className="sm">O JoyMap analisa</b><span className="sm mut">Publicações autorizadas: legenda, localização e data.</span></div>
            <div className="card col" style={{ gap: 4 }}><b className="sm">O JoyMap não lê</b><span className="sm mut">Mensagens, lista de seguidores e comentários.</span></div>
          </div>
          <div className="ft"><button type="button" tabIndex={-1} className={'btn blk' + (f === 1 ? ' press' : '') + (f === 2 ? ' ok' : '')}>{f === 2 ? '✓ Conectado' : 'Autorizar'}</button></div>
        </div>
      </Native>
    </Phone>
  )
}
// Passo 2 · os lugares viram pins (tela pública real)
function StepMap() {
  const { on, rm, paused } = useScene()
  const ever = useEver(on)
  const f = useCycle([900, 520, 520, 520, 520, 520, 520, 3200], { on, rm, paused })
  const n = Math.min(f, 6)
  return (
    <Phone h={PH} cut label="Pins aparecendo na tela pública conforme os lugares são identificados">
      <Native h={PH}>{ever && <PubPreview theme={MAP_THEME} places={PLACES6} shown={PLACES6.slice(0, n)} view="map" />}</Native>
      <div className="mk-toast2"><i className={f >= 7 ? 'ok' : ''} />{f >= 7 ? 'Mapa pronto' : 'Lendo suas publicações…'}<b>{n} {n === 1 ? 'lugar' : 'lugares'}</b></div>
    </Phone>
  )
}
// Passo 3 · identidade (tema, símbolos e formato trocando na tela real)
const STYLES = [['Sabor da Cidade', 'sabordacidade.demo', MAP_THEME, 'Modelo padrão'], ...DEMO_IDENTITIES.map((id, i) => [id.name, id.handle, withView(identityTheme(id)), ['Modelo Solar', 'Modelo Doce', 'Modelo Noite'][i]])]
const STYLE_AV = [undefined, ...DEMO_IDENTITIES.map((id) => ph(id.avatar))]
function StepStyle() {
  const { on, rm, paused } = useScene()
  const ever = useEver(on)
  const f = useCycle([2700, 2700, 2700, 2700], { on, rm, paused, rmFrame: 1 })
  const [name, handle, theme, label] = STYLES[f]
  return (
    <Phone h={PH} cut label="A mesma tela pública assumindo estilos de mapa, cores e símbolos diferentes">
      <Native h={PH} theme={theme}>{ever && <PubPreview name={name} handle={handle} avatarUrl={STYLE_AV[f]} theme={theme} places={PLACES6} view="map" />}</Native>
      <div className="mk-toast2"><i className="ok" />Estilo<b>{label}</b></div>
    </Phone>
  )
}
// Passo 4 · link na bio abre o mapa
const PROFILE = { name: 'Sabor Paulista', handle: 'saborpaulista', lines: ['Restaurantes, cafés e achados de São Paulo', 'Pauta nova toda semana', 'Mapa dos lugares que eu indico'], avatar: 'latte', grid: profileGrid(MIXED_POOL, 36), highlights: ['Pizza', 'Japa', 'Cafés', 'Doces', 'Bares'] }
function StepBio() {
  const { on, rm, paused } = useScene()
  const ever = useEver(on)
  const f = useCycle([2000, 900, 3800], { on, rm, paused, rmFrame: 2 })
  return (
    <Phone h={PH} cut label="Toque no link da bio abrindo o mapa público no navegador">
      <Native h={PH}><SocialProfile {...PROFILE} tap={f === 1} /></Native>
      <div className={'sheet-up' + (f === 2 ? ' open' : '')}><Native h={PH} top={34}>{ever && <PubPreview theme={MAP_THEME} places={PLACES6} />}</Native></div>
    </Phone>
  )
}
const STEPS = [
  ['Conecte sua conta.', 'Autorize a análise das suas publicações por meio das integrações oficiais, quando disponíveis, sem compartilhar sua senha.', <StepConnect />, { background: '#E4E4E4' }],
  ['A gente conecta os pontos.', 'Identificamos os lugares mencionados nas publicações autorizadas e os organizamos em um mapa.', <StepMap />, { background: '#FF5C8A' }],
  ['Deixe tudo com a sua cara.', 'Revise suas recomendações, ajuste o que precisar e personalize a identidade visual do seu mapa. Blocos como agenda e marcas podem ficar ocultos.', <StepStyle />, { background: 'var(--ink)', color: '#F1F1F1' }],
  ['Seu mapa, na sua bio.', 'Compartilhe um único link com sua audiência. Sem aplicativo, sem cadastro e sem complicação para quem acessa.', <StepBio />, { background: '#fff' }],
]
export function HowItWorks() {
  const [cur, setCur] = React.useState(0)
  // o passo que ocupa o meio da tela fica marcado na lista fixa da esquerda
  React.useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCur(Number(e.target.dataset.i)) }), { rootMargin: '-45% 0px -45% 0px' })
    document.querySelectorAll('.hwt-r .hw-p').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <section id="como-funciona" className="sec" aria-labelledby="como" style={{ background: 'var(--cream)' }}>
      <div className="w hwt">
        <div className="hwt-l">
          <div className="sec-h"><span className="eb">Como funciona</span><h2 id="como" className="d h-sec">Do seu conteúdo ao seu mapa, em quatro passos.</h2></div>
          <ol className="hwt-n" aria-label="Passos">{STEPS.map(([t], i) => (
            <li key={t} className={i === cur ? 'on' : i < cur ? 'done' : ''}><a href={`#passo-${i + 1}`} onClick={(e) => { e.preventDefault(); document.getElementById(`passo-${i + 1}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }) }}><b>{i + 1}</b><span>{t.replace(/\.$/, '')}</span></a></li>))}</ol>
        </div>
        <div className="hwt-r">
          {STEPS.map(([t, d, scr, st], i) => (
            <Scene as="article" key={t} id={`passo-${i + 1}`} className="hw-p" threshold={0.5} style={st} data-i={i}>
              <div className="tx"><span className="eb" style={{ color: 'inherit', opacity: 0.7 }}>Passo {i + 1}</span><h3 className="d s32">{t}</h3><p className="s16" style={{ opacity: 0.85, maxWidth: 420 }}>{d}</p></div>
              {scr}
            </Scene>))}
        </div>
      </div>
    </section>
  )
}

