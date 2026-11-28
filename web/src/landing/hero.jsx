import React, { useEffect, useRef, useState } from 'react'
import { Link } from '../lib/router.jsx'
import { Phone, Native, S } from './device.jsx'
import { PostCard, ph } from './social.jsx'
import { DEMO_IDENTITIES, DEMO_THEME, PLACES, PubPreview, identityTheme, makeTheme } from './pubpreview.jsx'
import { Scene, useFit, useMedia, usePause, useReducedMotion } from './motion.jsx'

// Motion 01 · Content to Map. As publicações viajam até a tela pública (o mesmo componente do app) e viram pins.
const W = 640, H = 700, PX = 177, PY = 44, PH = 590
const CARDS = [
  { kind: 'reel', photo: 'pizza', user: '@sabordacidade', caption: 'A melhor pizza do bairro', x: 6, y: 24, w: 106 },
  { kind: 'post', photo: 'burger', user: '@fome.sp', caption: 'Smash burger de sexta', x: 0, y: 250, w: 134, age: '2 d' },
  { kind: 'reel', photo: 'tacos', user: '@rolê.gastro', caption: 'Tacos al pastor', x: 12, y: 480, w: 106 },
  { kind: 'post', photo: 'bolo', user: '@docesdesp', caption: 'Tiramisù que vale a fila', x: 498, y: 40, w: 134, age: '1 sem' },
  { kind: 'reel', photo: 'drink', user: '@drinks.sp', caption: 'Drink autoral', x: 520, y: 300, w: 106 },
  { kind: 'post', photo: 'sushi', user: '@comida.japa', caption: 'Combinado na Liberdade', x: 498, y: 500, w: 134, age: '3 sem' },
]
const ORDER = [9, 5, 3, 6, 7, 1]
const ch = (c) => (c.kind === 'reel' ? (c.w * 16) / 9 : c.w + 84)
const HERO_VIEW = { lat: -23.575, lon: -46.655, zoom: 12.5 }
const proj = (lat, lon, z) => { const sc = 256 * 2 ** z, sin = Math.sin((lat * Math.PI) / 180); return [((lon + 180) / 360) * sc, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * sc] }
const RUA = DEMO_IDENTITIES[1] // Grão & Pausa: modelo Doce do estúdio, com nome e foto de perfil do criador

function useHeroSeq({ on, rm, paused }) {
  const [s, setS] = useState({ cards: rm, lines: false, placed: rm ? 6 : 0, flown: -1, ident: 0, big: false })
  useEffect(() => {
    if (rm) { setS({ cards: true, lines: false, placed: 6, flown: -1, ident: 0, big: false }); return }
    if (!on || paused) return
    let dead = false
    const hs = []
    const at = (ms, f) => hs.push(setTimeout(() => !dead && f(), ms))
    const run = () => {
      setS({ cards: false, lines: false, placed: 0, flown: -1, ident: 0, big: false })
      at(400, () => setS((x) => ({ ...x, cards: true })))
      for (let i = 0; i < 6; i++) { at(2600 + i * 760, () => setS((x) => ({ ...x, flown: i }))); at(2600 + i * 760 + 640, () => setS((x) => ({ ...x, placed: i + 1 }))) }
      at(9000, () => setS((x) => ({ ...x, ident: 1 })))
      at(10200, () => setS((x) => ({ ...x, big: true }))) // o celular cresce para mostrar o mapa
      at(13800, () => setS((x) => ({ ...x, big: false }))) // e volta ao tamanho inicial antes de recomeçar
      at(15000, run)
    }
    run()
    return () => { dead = true; hs.forEach(clearTimeout) }
  }, [on, rm, paused])
  return s
}

const PLACES6 = ORDER.map((id) => PLACES.find((p) => p.id === id))
const T0 = makeTheme({ ...DEMO_THEME, start: 'pick', startView: HERO_VIEW, pinSize: 100, bio: 'Restaurantes, cafés e achados de São Paulo.' })
const T1 = makeTheme({ ...identityTheme(RUA), start: 'pick', startView: HERO_VIEW, pinSize: 100 })

function HeroStage() {
  const compact = useMedia('(max-width: 760px)')
  const [fitRef, s] = useFit(W)
  const rm = useReducedMotion()
  const { paused } = usePause()
  return (
    <div ref={fitRef} className="hs-wrap" style={compact ? undefined : { height: H * s }}>
      <Scene className={'hs' + (compact ? ' hs-c' : '')} threshold={0.2} style={compact ? undefined : { width: W, height: H, transform: `scale(${s})`, transformOrigin: 'top left' }}>
        <HeroInner compact={compact} rm={rm} paused={paused} />
      </Scene>
    </div>
  )
}
function HeroInner({ compact, rm, paused }) {
  // `on` vem da própria cena: lemos a classe via estado simples
  const [on, setOn] = useState(false)
  const ref = React.useRef(null)
  useEffect(() => {
    const el = ref.current?.closest('.scene'); if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 }); io.observe(el); return () => io.disconnect()
  }, [])
  const q = useHeroSeq({ on, rm, paused })
  // destino de cada cartão = posição real do pin na tela pública (mesma projeção do mapa)
  const [tg, setTg] = useState([])
  useEffect(() => {
    if (compact) return
    const calc = () => {
      const root = ref.current, mm = root?.querySelector('.as-map')
      if (!root || !mm) return
      const rr = root.getBoundingClientRect(), mr = mm.getBoundingClientRect(), k = rr.width / W
      const cx = (mr.left - rr.left + mr.width / 2) / k
      const cy = (mr.top - rr.top + mr.height / 2) / k // centro do mapa
      const c = proj(HERO_VIEW.lat, HERO_VIEW.lon, HERO_VIEW.zoom)
      setTg(PLACES6.map((p) => { const q2 = proj(p.lat, p.lon, HERO_VIEW.zoom); return [cx + (q2[0] - c[0]) * S, cy + (q2[1] - c[1]) * S - 12] }))
    }
    const h = setTimeout(calc, 900)
    const ro = new ResizeObserver(calc); ro.observe(ref.current)
    return () => { clearTimeout(h); ro.disconnect() }
  }, [compact])
  const shown = PLACES6.slice(0, q.placed)
  const ident = q.ident === 1
  return (
    <div ref={ref} className="hs-in" style={compact ? undefined : { width: W, height: H }}>
      <div className={'hs-ph' + (q.big ? ' big' : '')} style={compact ? undefined : { left: PX, top: PY }}>
        <Phone h={PH} label="Tela pública do mapa de um criador, com pins aparecendo conforme as publicações são identificadas">
          <Native h={PH} theme={ident ? T1 : T0}><PubPreview name={ident ? RUA.name : 'Sabor da Cidade'} handle={ident ? RUA.handle : 'sabordacidade.demo'} avatarUrl={ident ? ph(RUA.avatar) : undefined} theme={ident ? T1 : T0} places={PLACES6} shown={shown} view="map" /></Native>
          <div className={'hs-badge' + (ident ? ' on' : '')} aria-hidden="true"><i />Identidade do criador</div>
        </Phone>
      </div>
      {!compact && CARDS.map((c, i) => {
        const cx = c.x + c.w / 2, cy = c.y + ch(c) / 2, [tx, ty] = tg[i] || [320, 380]
        return (
          <div key={i} className={'hc' + (q.cards ? ' show' : '') + (q.flown >= i ? ' go' : '')} style={{ left: c.x, top: c.y, '--i': i, '--dx': `${tx - cx}px`, '--dy': `${ty - cy}px` }} aria-hidden="true">
            <PostCard {...c} />
          </div>)
      })}
    </div>
  )
}

export function Hero() {
  return (
    <div className="hero2">
      <div className="hero2-mark" aria-hidden="true" />
      <div className="w split hero2-in">
        <div className="col hero2-tx">
          <span className="tag hero2-eb">Feito para criadores</span>
          <h1 className="d h-hero">Suas indicações <span className="h-nl">merecem um mapa.</span></h1>
          <p className="s20" style={{ maxWidth: 520, fontWeight: 500 }}>Transforme suas indicações de lugares em um mapa com a sua identidade e descubra o que sua audiência quer ver a seguir.</p>
          <div className="row wrap" style={{ gap: 12 }}>
            <Link className="btn dk btn-lg" to="/entrar?criar=1">Pedir convite</Link>
            <Link className="btn ln btn-lg" to="/@demo">Ver um mapa de exemplo</Link>
          </div>
          <p className="xs hero2-mc">Entrada por convite, com plano grátis.</p>
          <ul className="hero2-kinds" aria-label="Para quem indica">{['Restaurantes e cafés', 'Viagens', 'Passeios', 'Esportes e clubes'].map((k) => <li key={k}>{k}</li>)}</ul>
        </div>
        <HeroStage />
      </div>
    </div>
  )
}
