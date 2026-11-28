import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../lib/icons.jsx'
import { Phone, Native } from './device.jsx'
import { PubPreview, DEMO_IDENTITIES, PLACES, identityTheme, withView } from './pubpreview.jsx'
import { profileGrid } from '../demoData.js'
import { SocialProfile, ph } from './social.jsx'
import { useMedia, useInView, usePause, useReducedMotion } from './motion.jsx'
import { TEMPLATES } from '../theme.jsx'

const hl = { background: 'linear-gradient(transparent 60%, var(--hl, var(--acc)) 60%)', padding: '0 4px' }

// Seção 06 · Map Identity: perfis de demonstração; ao passar o mouse (ou tocar), o link da bio abre o mapa do criador.
const PICK = { rua: [3, 5, 6, 7, 9, 10, 8], cafe: [2, 4, 12, 8, 6], noir: [1, 3, 7, 6, 11] }
const COUNTS = { rua: ['312', '38,4 mil', '521'], cafe: ['489', '61,2 mil', '384'], noir: ['164', '22,7 mil', '298'] }
const GRIDS = Object.fromEntries(DEMO_IDENTITIES.map((i) => [i.key, profileGrid(i.pool, 36)]))
const NICHE = { rua: 'Casal · rua e boteco', cafe: 'Casal · cafeterias e doces', noir: 'Solo · alta gastronomia' }
// Palco da seção: o fundo inteiro assume a cor do modelo do criador (Solar, Doce, Noite).
const STAGE = {
  rua: { bg: '#FF6A4D', fg: '#171713', hl: '#ffffff' },
  cafe: { bg: '#FF8FB1', fg: '#171713', hl: '#ffffff' },
  noir: { bg: '#171713', fg: '#ffffff', hl: '#a78bfa' },
}
const SHAPE = { drop: 'Pins em gota', circle: 'Pins redondos', hex: 'Pins hexagonais', square: 'Pins quadrados' }
const TONE = { light: 'Claro', bright: 'Vivo', liberty: 'Clássico', fiord: 'Azul-noite', dark: 'Escuro' }
const edited = (id) => { const t = TEMPLATES.find((x) => x.id === id.tpl); return ['Nome e foto de perfil', `Modelo ${t.name}`, SHAPE[t.t.shape], `Mapa ${TONE[t.t.tone]}`, 'Bio e cor principal'] }
const STEPS = { profile: 3200, tap: 520, map: 5200 }

function CreatorStage({ id, phase, view }) {
  const [ever, setEver] = useState(false)
  const theme = useMemo(() => withView(identityTheme(id)), [id])
  const places = useMemo(() => PLACES.filter((p) => PICK[id.key].includes(p.id)), [id.key])
  useEffect(() => { if (phase) setEver(true) }, [phase])
  return (
    <div className="gx-ph" key={id.key}>
      <Phone h={560} label={`Perfil de demonstração de ${id.name}; o link da bio abre o mapa do criador`}>
        <Native h={560}><SocialProfile name={id.name} handle={id.handle.replace('.demo', '')} bio={id.tagline} lines={id.bio} avatar={id.avatar} grid={GRIDS[id.key]} highlights={id.hl} counts={COUNTS[id.key]} link={`Mapa de lugares · ${id.name}`} tap={phase === 1} /></Native>
        <div className={'sheet-up full' + (phase === 2 ? ' open' : '')} style={{ background: theme.bg }}><Native h={560} theme={theme}>{ever && <PubPreview name={id.name} handle={id.handle} avatarUrl={ph(id.avatar)} theme={theme} places={places} view={view} />}</Native></div>
      </Phone>
    </div>
  )
}

export function Gallery() {
  const [cur, setCur] = useState(0)
  const [phase, setPhase] = useState(0) // 0 perfil, 1 toque no link, 2 mapa aberto
  const [auto, setAuto] = useState(true)
  const [view, setView] = useState('map') // tela do mapa aberto: mapa, lugares ou sobre
  const [ref, on] = useInView(0.3)
  const rm = useReducedMotion()
  const { paused } = usePause()
  const hov = useMedia('(hover: hover)')
  const id = DEMO_IDENTITIES[cur], st = STAGE[id.key]
  const run = auto && on && !rm && !paused
  // roteiro automático: perfil, toque no link, mapa; depois o próximo criador (o visitante assume o controle ao interagir)
  useEffect(() => {
    if (!run) return
    const t = setTimeout(() => {
      if (phase === 0) setPhase(1)
      else if (phase === 1) setPhase(2)
      else { setPhase(0); setCur((c) => (c + 1) % DEMO_IDENTITIES.length) }
    }, phase === 0 ? STEPS.profile : phase === 1 ? STEPS.tap : STEPS.map)
    return () => clearTimeout(t)
  }, [run, phase, cur])
  const pick = (i) => { setAuto(false); setCur(i); setPhase(0) }
  const open = () => { if (phase) return; setPhase(1); setTimeout(() => setPhase((p) => (p === 1 ? 2 : p)), STEPS.tap) }
  const close = () => setPhase(0)
  return (
    <section id="exemplos" ref={ref} className="sec gx" aria-labelledby="galeria" style={{ '--gbg': st.bg, '--gfg': st.fg }}>
      <div className="w gx-g">
        <div className="gx-l">
          <span className="eb">Mapas de criadores</span>
          <h2 id="galeria" className="d h-sec">Nenhum criador é igual. <span style={{ ...hl, '--hl': st.hl }}>Nenhum mapa precisa ser.</span></h2>
          <p className="lead">Cada criador escolhe um modelo, o nome, a foto, as cores e o formato dos pins. A audiência abre tudo por um único link, sem aplicativo e sem cadastro.</p>
          <div className="gx-tabs" role="tablist" aria-label="Criadores de demonstração">
            {DEMO_IDENTITIES.map((x, i) => (
              <button key={x.key} type="button" role="tab" aria-selected={i === cur} className={i === cur ? 'on' : ''} onClick={() => pick(i)}>
                <img src={ph(x.avatar)} alt="" loading="lazy" decoding="async" /><span>{x.name}</span>
              </button>))}
          </div>
          <div className="gx-ed" key={id.key}>
            <span className="gx-edh">O que {id.name} editou</span>
            <ul>{edited(id).map((t, i) => <li key={t} style={{ '--k': i }}><Icon n="check" s={14} c="currentColor" />{t}</li>)}</ul>
          </div>
        </div>
        <div className="gx-r">
          <div className="gx-disc" aria-hidden="true" />
          <div onMouseEnter={() => { if (hov) { setAuto(false); open() } }} onMouseLeave={() => { if (hov && !auto) close() }}>
            <CreatorStage id={id} phase={phase} view={view} />
          </div>
          <div className="gx-views" role="group" aria-label="Tela do mapa">
            {[['map', 'Mapa'], ['list', 'Lugares'], ['sobre', 'Sobre']].map(([k, l]) => <button key={k} type="button" aria-pressed={phase === 2 && view === k} onClick={() => { setAuto(false); setView(k); setPhase(2) }}>{l}</button>)}
          </div>
          <div className="gx-cap">
            <div><b className="d s20">{id.name}</b><span>{NICHE[id.key]} · perfil de demonstração</span></div>
            <button type="button" className="gx-btn" aria-pressed={phase === 2} onClick={() => { setAuto(false); phase ? close() : open() }}>{phase === 2 ? 'Voltar ao perfil' : 'Abrir pelo link da bio'}</button>
          </div>
        </div>
      </div>
      <p className="xs gx-note c">Criadores, nomes, números e lugares fictícios, só para demonstrar a personalização. Nenhum deles é cliente real: as fotos de pessoas e de comida vêm de bancos de imagens livres (Pexels e Wikimedia Commons, créditos em /creditos-fotos.txt), e as pessoas retratadas não têm relação com estes perfis.</p>
    </section>
  )
}
