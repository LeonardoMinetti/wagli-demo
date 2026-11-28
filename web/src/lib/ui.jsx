import React, { useEffect, useState } from 'react'
import { Link, Redirect, navigate } from './router.jsx'
import { Icon } from './icons.jsx'
import { useMe, homeFor } from './me.jsx'
import { api } from '../api.js'
import { initial } from '../theme.jsx'
import logoUrl from '../brand/logo.svg'
import LogoWrite from './LogoWrite.jsx'
import FakeMap from '../FakeMap.jsx'
import { withBase } from './base.js'

// Para onde o botão do topo leva quem já entrou, conforme o tipo de conta
export const homeLink = (me) => me.user.role === 'admin' ? null : me.user.role === 'restaurant' ? ['Meu painel', '/restaurante'] : me.user.role === 'viewer' && !me.creator ? ['Meus salvos', '/salvos'] : ['Meu painel', '/painel']
export const Logo = ({ size = 44, to = '/', write = false }) => <Link className="logo" to={to} aria-label="JoyMap">{write ? <LogoWrite height={size} /> : <img src={logoUrl} alt="JoyMap" style={{ height: size }} />}</Link>

// Barra do site: flutuante, transparente sobre o hero e cápsula ao rolar
const NAV = [['Como funciona', '/#como-funciona'], ['Exemplos', '/#exemplos'], ['RoteirosJoy', '/roteirosjoy'], ['Insights', '/#insights'], ['Planos', '/#planos'], ['Perguntas', '/perguntas']]
export function Top({ active = -1, overlay = false, dark = false }) {
  const { me } = useMe()
  const [sc, setSc] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => { const f = () => setSc(window.scrollY > 24); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])
  useEffect(() => { if (!open) return; const k = (e) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [open])
  const go = () => setOpen(false)
  return (
    <>
      {!overlay && <div style={{ height: 84 }} />}
      <header className={'topbar' + (sc || open ? ' sc' : '') + (dark ? ' dk' : '')}>
        <Logo write />
        <nav className="l" aria-label="Principal">{NAV.map(([l, to], i) => <Link key={l} className={i === active ? 'it on' : 'it'} to={to}>{l}</Link>)}</nav>
        <Link className="it tb-ex" to="/@demo">Explorar mapas</Link>
        {me?.user ? (homeLink(me) && <Link className="btn sm" to={homeLink(me)[1]}>{homeLink(me)[0]}</Link>) : <>
          <Link className="btn ln sm tb-in" to="/entrar">Entrar</Link>
          <Link className="btn sm" to="/entrar?criar=1">Pedir convite</Link></>}
        <button type="button" className="tb-burger" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="tb-menu" onClick={() => setOpen(!open)}><i /><i /><i /></button>
        {open && <div id="tb-menu" className="tb-menu">{NAV.map(([l, to]) => <Link key={l} to={to} onClick={go}>{l}</Link>)}<Link to="/@demo" onClick={go}>Explorar mapas</Link>{me?.user ? (homeLink(me) && <Link to={homeLink(me)[1]} onClick={go}>{homeLink(me)[0]}</Link>) : <Link to="/entrar" onClick={go}>Entrar</Link>}</div>}
      </header>
    </>
  )
}
export function SiteFooter() {
  const { me } = useMe()
  // quem não tem mapa e só quer guardar lugares entra por aqui (ou pelo mapa de um criador)
  const exp = me?.user ? (homeLink(me) && <Link className="sf-in" to={homeLink(me)[1]}><Icon n="user" s={16} c="currentColor" />{homeLink(me)[0]}</Link>) : <Link className="sf-in" to="/entrar?como=explorador"><Icon n="user" s={16} c="currentColor" />Entrar como explorador</Link>
  return (
    <footer className="w sf">
      <Logo size={26} />
      <nav className="sf-l" aria-label="Rodapé">{exp}<Link to="/roteirosjoy">RoteirosJoy</Link><Link to="/termos">Termos</Link><Link to="/termos">Privacidade</Link><Link to="/perguntas">Contato</Link><Link to="/para-restaurantes">Para restaurantes</Link><Link to="/voo">Meu voo</Link></nav>
    </footer>
  )
}

// Menu lateral do painel do criador (F)
const SIDE = [['visao', 'Visão geral', 'home', '/painel'], ['buscas', 'Buscas', 'search', '/painel/buscas'], ['lugares', 'Lugares', 'pin', '/painel/lugares'],
  ['divulgar', 'Divulgar', 'share', '/painel/divulgar'], ['roteiros', 'Roteiros', 'route', '/painel/roteiros'], ['estudio', 'Estúdio de estilo', 'palette', '/estudio'], ['conta', 'Minha conta', 'gear', '/painel/conta']]
const TABS = ['visao', 'buscas', 'lugares', 'divulgar']
export function Side({ active }) {
  const { me, reload } = useMe()
  const [more, setMore] = React.useState(false)
  const [pending, setPending] = React.useState(0)
  React.useEffect(() => {
    let on = true
    const load = () => api('/creator/places').then((d) => on && setPending(d.places.filter((p) => p.status === 'pending' || p.status === 'unresolved').length)).catch(() => {})
    load(); window.addEventListener('wagli:places', load)
    return () => { on = false; window.removeEventListener('wagli:places', load) }
  }, [active])
  const dot = (k) => k === 'lugares' && pending > 0 ? <i className="nd" role="img" aria-label={`${pending} lugar${pending === 1 ? '' : 'es'} para revisar`} title={`${pending} para revisar`} /> : null
  const c = me?.creator
  const out = async () => { await api('/auth/logout', { method: 'POST' }); await reload(); navigate('/') }
  React.useEffect(() => { setMore(false) }, [active])
  const items = SIDE.map(([k, l, i, to]) => ({ k, l, i, to }))
  return (
    <>
      <div className="side">
        <span style={{ padding: '4px 12px 14px' }}><Logo /></span>
        <div className="row" style={{ padding: '0 12px 14px' }}><div className="av">{initial(c?.displayName)}</div><div><div className="b sm">@{c?.handle}</div><div className="xs mut">{c?.plan?.trialEnds ? 'Teste grátis' : 'Sem plano ativo'}</div></div></div>
        {items.map(({ k, l, i, to }) => <Link key={k} className={'it' + (k === active ? ' on' : '')} to={to}><span className="it-ic"><Icon n={i} s={18} c={k === active ? '#fff' : '#171713'} /></span>{l}{dot(k)}</Link>)}
        {c?.slug && c.published !== false && (
          <a className="mapbn" href={withBase(`/@${c.slug}`)} target="_blank" rel="noopener noreferrer" style={{ marginTop: 'auto' }} aria-label="Ver meu mapa como um seguidor (abre em outra aba)">
            <span className="mapbn-pv"><FakeMap h={104} tone={c.theme?.tone || 'light'} shape={c.theme?.shape || 'drop'} acc={c.theme?.accent || '#ff4b2b'} n={6} lab={false} /></span>
            <span className="mapbn-tx"><b className="sm">Ver meu mapa</b><span className="xs">Como um seguidor vê</span></span>
            <Icon n="next" s={16} c="currentColor" />
          </a>
        )}
        <button className="it" style={{ background: 'none', border: 0, textAlign: 'left', marginTop: c?.slug ? 0 : 'auto' }} onClick={out}><Icon n="back" s={18} c="#404040" />Sair</button>
      </div>
      {/* celular: barra superior enxuta + abas fixas embaixo + folha "Mais" */}
      <div className="mtop"><Logo /><span className="sp" /><div className="row" style={{ gap: 8 }}><div className="b xs">@{c?.handle}</div><div className="av">{initial(c?.displayName)}</div></div></div>
      <nav className="mtabs" aria-label="Painel">
        {items.filter((t) => TABS.includes(t.k)).map(({ k, l, i, to }) => <Link key={k} className={k === active ? 'on' : ''} to={to}><Icon n={i} s={22} c={k === active ? '#171713' : '#6b6b6b'} /><span>{k === 'visao' ? 'Início' : l}</span>{dot(k)}</Link>)}
        <button type="button" className={!TABS.includes(active) ? 'on' : ''} onClick={() => setMore(true)} aria-haspopup="dialog"><Icon n="menu" s={22} c={!TABS.includes(active) ? '#171713' : '#6b6b6b'} /><span>Mais</span></button>
      </nav>
      {more && (
        <div className="mmore" role="dialog" aria-label="Mais opções" onClick={() => setMore(false)}>
          <div className="mmore-sh" onClick={(e) => e.stopPropagation()}>
            <i className="mmore-grab" />
            <div className="mmore-g">{items.filter((t) => !TABS.includes(t.k)).map(({ k, l, i, to }) => <Link key={k} className={k === active ? 'on' : ''} to={to}><Icon n={i} s={22} c="#171713" /><span>{l}</span></Link>)}
</div>
            <button type="button" className="btn ln blk" onClick={out}>Sair</button>
          </div>
        </div>
      )}
    </>
  )
}

// Layout de painel para qualquer tipo de conta (mesmo visual do painel do criador): menu lateral no computador; barra superior e abas fixas no celular
function RolePanel({ items, active, label, banner, children, loginTo }) {
  const { me, reload } = useMe()
  const u = me?.user
  const out = async () => { await api('/auth/logout', { method: 'POST' }); await reload(); navigate('/') }
  const name = u ? u.email : 'Visitante'
  return (
    <div className="page"><div className="app">
      <div className="side">
        <span style={{ padding: '4px 12px 14px' }}><Logo /></span>
        <div className="row" style={{ padding: '0 12px 14px' }}><div className="av">{initial(name)}</div><div style={{ minWidth: 0 }}><div className="b sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{name}</div><div className="xs mut">{label}</div></div></div>
        {items.map(([k, l, i, to]) => <Link key={k} className={'it' + (k === active ? ' on' : '')} to={to}><span className="it-ic"><Icon n={i} s={18} c={k === active ? '#fff' : '#171713'} /></span>{l}</Link>)}
        <div style={{ marginTop: 'auto', display: 'grid', gap: 4 }}>
          {banner}
          {u ? <button className="it" style={{ background: 'none', border: 0, textAlign: 'left' }} onClick={out}><Icon n="back" s={18} c="#404040" />Sair</button> : <Link className="it" to={loginTo}><Icon n="user" s={18} c="#404040" />Entrar</Link>}
        </div>
      </div>
      <div className="mtop"><Logo /><span className="sp" /><div className="row" style={{ gap: 8 }}>{u ? <button type="button" className="link xs" onClick={out}>Sair</button> : <Link className="link xs" to={loginTo}>Entrar</Link>}<div className="av">{initial(name)}</div></div></div>
      <nav className="mtabs" aria-label={label}>
        {items.map(([k, l, i, to]) => <Link key={k} className={k === active ? 'on' : ''} to={to}><Icon n={i} s={22} c={k === active ? '#171713' : '#6b6b6b'} /><span>{l}</span></Link>)}
      </nav>
      <div className="main">{children}</div>
    </div></div>
  )
}
const EXP = [['salvos', 'Salvos', 'heart', '/salvos'], ['criadores', 'Criadores', 'map', '/salvos/criadores'], ['conta', 'Conta', 'user', '/salvos/conta']]
export const ExplorerPage = ({ active, children }) => (
  <RolePanel items={EXP} active={active} label="Explorador" loginTo="/entrar?como=explorador&voltar=%2Fsalvos">{children}</RolePanel>
)
// Cabeçalho de página dos painéis: título, resumo e ações à direita. Padrão único.
export const PageHead = ({ title, sub, right }) => <div className="row jb wrap pg-h"><div><h1 className="d s44">{title}</h1>{sub && <p className="sm mut">{sub}</p>}</div>{right}</div>

// Administração: o menu segue o trabalho (pendências, quem entra, o que está no mapa, o que dá errado)
const ADM = [['inicio', 'Início', 'home', '/admin'], ['criadores', 'Criadores', 'user', '/admin/criadores'], ['lugares', 'Lugares', 'pin', '/admin/lugares'], ['denuncias', 'Denúncias', 'shield', '/admin/denuncias'], ['miniguias', 'Vitrine', 'route', '/admin/miniguias'], ['metricas', 'Métricas', 'chart', '/admin/metricas']]
export const AdminPage = ({ active, children }) => (
  <Guard need="admin"><RolePanel items={ADM} active={active} label="Administração" loginTo="/entrar"
    banner={<a className="link xs mut" style={{ padding: '4px 12px' }} href={withBase('/painel')}>Ir ao painel de criador</a>}>{children}</RolePanel></Guard>
)
// Restaurante: tipo de conta próprio (sem plano definido ainda)
const RST = [['visao', 'Visão geral', 'home', '/restaurante'], ['percepcao', 'Percepção', 'shield', '/restaurante/percepcao'], ['lugar', 'Reivindicar', 'pin', '/restaurantes'], ['conta', 'Conta', 'user', '/restaurante/conta']]
export const RestaurantPage = ({ active, children }) => (
  <Guard to="/entrar?como=restaurante"><RolePanel items={RST} active={active} label="Restaurante" loginTo="/entrar?como=restaurante">{children}</RolePanel></Guard>
)

// Abas de navegação entre seções de uma mesma área (Estúdio, Minha conta). Padrão único do painel.
export function Tabs({ items, active, label }) {
  const ref = React.useRef(null)
  // no celular as abas rolam na horizontal: mantém a ativa à vista
  React.useEffect(() => { const e = ref.current?.querySelector('.on'); if (e && ref.current.scrollWidth > ref.current.clientWidth) ref.current.scrollTo({ left: e.offsetLeft - 48, behavior: 'auto' }) }, [active])
  return (
    <nav className="tabs" ref={ref} aria-label={label}>
      {items.map(([k, l, i, to]) => <Link key={k} className={'tab' + (k === active ? ' on' : '')} to={to} aria-current={k === active ? 'page' : undefined}><Icon n={i} s={16} c="currentColor" />{l}</Link>)}
    </nav>
  )
}

// Cabeçalho das telas de celular
export function Hd({ back, title, right, close }) {
  return (
    <div className="hd">
      {back && <Link to={back} aria-label="Voltar"><Icon n="back" s={22} /></Link>}
      {close && <Link to={close} aria-label="Fechar"><Icon n="close" s={22} /></Link>}
      <span className="sp">{title}</span>{right}
    </div>
  )
}
export const Stage = ({ children, className = '', dark }) => <div className="stage" style={dark ? { background: '#000' } : undefined}><div className={`phone ${className}`} style={dark ? { background: '#171717', color: '#fff' } : undefined}>{children}</div></div>
export const Step = ({ n, of }) => <div className="step">{Array.from({ length: of }, (_, i) => <i key={i} className={i < n ? 'on' : ''} />)}</div>
export const Note = ({ children, style }) => <div className="note" style={style}>{children}</div>
export const Tag = ({ k = '', children, style }) => <span className={`tag ${k}`} style={style}>{children}</span>
export const Switch = ({ on, onChange, disabled, label }) => <button type="button" role="switch" aria-checked={!!on} aria-label={label} disabled={disabled} className={'sw' + (on ? ' on' : '')} onClick={() => onChange?.(!on)} />
export const Check = ({ on, onChange, children }) => (
  <label className="row as" style={{ gap: 10, cursor: 'pointer' }}>
    <button type="button" role="checkbox" aria-checked={!!on} className={'checkbox' + (on ? ' on' : '')} onClick={() => onChange(!on)}>{on && <Icon n="check" s={14} c="#fff" />}</button>
    <span className="sm">{children}</span>
  </label>
)
export const Field = ({ label, id, children }) => <div><label className="lb" htmlFor={id}>{label}</label>{children}</div>
export const Toggle = ({ children }) => <div className="row" style={{ background: 'var(--soft)', padding: 4, borderRadius: 99, alignSelf: 'flex-start' }}>{children}</div>
export const Avatar = ({ name, color, bg, size = 44, font = 20 }) => <div className="av" style={{ width: size, height: size, fontSize: font, background: bg, color }}>{initial(name)}</div>
export const Loading = () => <div className="pad" style={{ padding: 32 }}>Carregando…</div>

// Guarda de rotas: exige login, criador aprovado ou admin.
export function Guard({ need = 'user', finished, to = '/entrar?como=criador', children }) {
  const { me } = useMe()
  if (me === undefined) return <Loading />
  if (!me.user) return <Redirect to={to} />
  if (need === 'admin') return me.user.role === 'admin' ? children : <Restricted />
  if (need === 'approved') {
    if (!me.creator || me.creator.status !== 'approved') return <Redirect to={homeFor(me)} />
    if (finished && me.creator.onboarding !== 'done') return <Redirect to={homeFor(me)} />
  }
  return children
}
export function Restricted() {
  return <div className="stage"><div className="phone"><div className="bd" style={{ justifyContent: 'center' }}><h1 className="d s44">Área restrita</h1><p className="mut">Esta área é só da equipe.</p><Link className="btn" to="/">Voltar ao início</Link></div></div></div>
}
// Layout do painel (menu lateral + conteúdo)
export function PanelPage({ active, children }) {
  return <Guard need="approved" finished><div className="page"><div className="app"><Side active={active} /><div className="main">{children}</div></div></div></Guard>
}
export function useTitle(t) { useEffect(() => { document.title = t ? `${t} · JoyMap` : 'JoyMap' }, [t]) }
