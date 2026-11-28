import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api.js'
import { Link, navigate, toast } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { Logo, Guard, Loading, Note, Switch, Side, Tabs, Field, useTitle } from '../lib/ui.jsx'
import { useMe } from '../lib/me.jsx'
import FakeMap from '../FakeMap.jsx'
import MapCanvas from '../MapCanvas.jsx'
import DeskAscend from '../pub/DeskAscend.jsx'
import { newMap } from '../lib/skin.jsx'
import MapSheet from '../pub/MapSheet.jsx'
import { pubVars } from '../pub/shared.jsx'
import { LIBS, SAMPLE_ICON } from '../iconcat.js'
import { CATEGORIES, EXTRA_MAX, catNameOk, cleanCatName } from '../../../server/theme.js'
import { demoPlaces } from '../demoData.js'
import { Phone, Native } from '../landing/device.jsx'
import { ACCENTS, CAT_COLORS, FONTS, RADIUS_MODES, SHAPES, SYMBOL_LIBRARY, TEMPLATES, TONES, applyTemplate, catOf, contrast, onAccent, onColor, radiusMode, symOf } from '../theme.jsx'

// Lugares de exemplo com foto (as mesmas fotos livres usadas na demonstração), só até o criador confirmar os dele
const SAMPLE_CATS = ['rest', 'cafe', 'bread', 'pizza', 'bar', 'burger', 'cake']
const SAMPLE = demoPlaces().slice(0, 9).map((p, i) => ({ ...p, id: -(i + 1), category: SAMPLE_CATS.includes(p.category) ? p.category : 'rest', postedOn: '2026-09-12', ad: false }))

const Ctx = createContext(null)
const useStudio = () => useContext(Ctx)

// Rascunho do estúdio: tudo muda na prévia na hora e só vai ao ar quando o criador publica as alterações.
function StudioProvider({ children }) {
  const { me, reload } = useMe()
  const c = me.creator
  const [theme, setT] = useState(c.theme)
  const [snap, setSnap] = useState(() => JSON.stringify(c.theme))
  const [places, setPlaces] = useState(null)
  const [routes, setRoutes] = useState([])
  const [coverVer, setCoverVer] = useState(0)
  const loadPlaces = useCallback(() => { api('/creator/places').then((d) => setPlaces(d.places)); api('/creator/routes').then((d) => setRoutes(d.routes)) }, [])
  useEffect(() => { loadPlaces() }, [loadPlaces])
  // a cor do texto sempre sai do fundo: o criador não a escolhe, então nunca fica ilegível
  const setTheme = (patch) => setT((t) => { const n = { ...t, ...(typeof patch === 'function' ? patch(t) : patch) }; return { ...n, fg: onColor(n.bg) } })
  const dirty = JSON.stringify(theme) !== snap
  const blocked = contrast(theme.accent, theme.bg) < 1.25
  const publish = async () => {
    let r
    try { r = await api('/creator/theme', { method: 'PUT', body: theme }) } catch { toast('A cor principal está igual ao fundo. Escolha outra para publicar.'); return }
    setT(r.theme); setSnap(JSON.stringify(r.theme))
    await reload(); toast('Alterações publicadas')
  }
  const undo = () => setT(JSON.parse(snap))
  const real = (places || []).filter((p) => p.status === 'confirmed' && p.lat != null)
  const data = useMemo(() => ({
    creator: { handle: c.handle, tiktok: c.tiktok, slug: c.slug, displayName: c.displayName, theme, links: [], cover: theme.layout.cover && c.hasCover, coverUrl: '/api/creator/cover', symbols: c.symbols },
    places: real.length ? real : SAMPLE, routes: routes.filter((r) => r.placeIds.length).map((r) => ({ ...r, placeIds: r.placeIds })),
  }), [theme, places, routes, c])
  return <Ctx.Provider value={{ c, theme, setTheme, dirty, blocked, publish, undo, places: places || [], real, data, usingSample: !real.length, loadPlaces, coverVer, bumpCover: () => setCoverVer((v) => v + 1), routes, setRoutes, reload }}>{children}</Ctx.Provider>
}
export function StudioRoute({ children }) { return <Guard need="approved" finished><StudioProvider>{children}</StudioProvider></Guard> }

// Prévia ao vivo: a própria página pública dentro de um celular
export function PhonePreview({ fake, themeOverride, width = 300, height = 620, interactive }) {
  const s = useStudio()
  const data = themeOverride ? { ...s.data, creator: { ...s.data.creator, theme: themeOverride }, places: SAMPLE } : s.data
  const theme = data.creator.theme
  const [cat, setCat] = useState([])
  const f = useMemo(() => ({ cats: cat, setCats: setCat, q: '', clear: () => setCat([]) }), [cat])
  const shown = cat.length ? data.places.filter((p) => cat.includes(p.category)) : data.places
  return (
    <div style={{ width, height, borderRadius: 34, border: '8px solid #171717', overflow: 'hidden', background: theme.bg, boxShadow: '0 18px 40px rgba(0,0,0,.22)', flex: 'none' }}>
      <div className="pub preview" style={{ ...pubVars(theme), height: '100%' }}><MapSheet data={data} shown={shown} f={f} selectedId={null} preview fake={fake || s.usingSample || !!themeOverride} snap="low" /></div>
    </div>
  )
}

// Prévia principal do Estúdio: iPhone com a tela real que o seguidor vê. Cada aba do Estúdio abre a tela em que a edição aparece.
const VIEWS = [['map', 'Mapa', 'Pins, cores, símbolos e o estilo do mapa.'], ['place', 'Lugar', 'O pin selecionado e o cartão do lugar.'], ['list', 'Lista', 'A lista de lugares.']]
const VIEW_FOR = { modelos: 'map', cores: 'map', categorias: 'map', mapa: 'map', pins: 'place' }
// Nas abas de pins e categorias a prévia foca em poucos lugares próximos, para a mudança aparecer bem grande no mapa
const FOCUS = { pins: 'dense', categorias: 'cats' }
function focusPlaces(places, mode) {
  const ok = places.filter((p) => p.lat != null && p.lon != null)
  if (ok.length < 4) return null
  const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
  const c = [med(ok.map((p) => p.lat)), med(ok.map((p) => p.lon))]
  const d = (p) => (p.lat - c[0]) ** 2 + (p.lon - c[1]) ** 2
  const near = [...ok].sort((a, b) => d(a) - d(b))
  if (mode === 'dense') return near.slice(0, 7)
  const seen = new Set(); const out = []
  for (const p of near) if (!seen.has(p.category)) { seen.add(p.category); out.push(p) }
  return out.length >= 3 ? out.slice(0, 9) : near.slice(0, 9)
}
// a prévia no visual novo: a mesma tela do seguidor, com o tema que está sendo editado
const NO_SAVED = { ids: [], toggle: () => {}, logged: false }
function NewPreview({ data, view }) {
  const first = data.places.find((p) => p.lat != null)
  const ctx = useMemo(() => ({ saved: NO_SAVED, track: () => {}, video: () => {}, share: () => {}, report: () => {} }), [])
  return <div className="sk-preview"><div className="sk-scroll"><div className="pub" style={pubVars(data.creator.theme)}><DeskAscend key={view} data={data} slug={data.creator.slug} ctx={ctx} mobile preview initialShowMap={view === 'map'} initialPlace={view === 'place' ? first?.id : null} /></div></div></div>
}
function StudioPhone({ active, fake }) {
  const fresh = newMap()
  const s = useStudio()
  const theme = s.data.creator.theme
  const [pick, setPick] = useState(null) // escolha manual do visitante; some ao trocar de aba do Estúdio
  useEffect(() => { setPick(null) }, [active])
  const view = pick || VIEW_FOR[active] || 'map'
  const mode = FOCUS[active]
  const focus = useMemo(() => (mode ? focusPlaces(s.data.places, mode) : null), [s.data.places, mode])
  const places = focus || s.data.places
  // categorias: sem agrupamento, para as cores aparecerem; os dados continuam os do criador
  const data = focus ? { ...s.data, creator: { ...s.data.creator, theme: { ...theme, pinSize: 100, cluster: mode === 'cats' ? false : theme.cluster } } } : s.data
  // mexer em "agrupar" leva ao mapa (onde o agrupamento aparece); mexer no "pin selecionado" leva ao lugar
  const t0 = useRef({ c: theme.cluster, s: theme.selected })
  useEffect(() => { if (active !== 'pins') return; if (t0.current.c !== theme.cluster) setPick('map'); t0.current.c = theme.cluster }, [theme.cluster, active])
  useEffect(() => { if (active !== 'pins') return; if (t0.current.s !== theme.selected) setPick('place'); t0.current.s = theme.selected }, [theme.selected, active])
  const f = useMemo(() => ({ cats: [], setCats: () => {}, q: '', clear: () => {} }), [])
  // pulso suave quando uma edição muda a prévia
  const [flash, setFlash] = useState(false)
  const sig = JSON.stringify(theme)
  const first = useRef(true)
  useEffect(() => { if (first.current) { first.current = false; return } setFlash(true); const t = setTimeout(() => setFlash(false), 800); return () => clearTimeout(t) }, [sig])
  const cap = VIEWS.find((v) => v[0] === view)[2]
  if (fresh) return (
    <div className="stp">
      <div className="stp-seg" role="tablist" aria-label="Tela da prévia">
        {VIEWS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setPick(k)}>{l}</button>)}
      </div>
      <NewPreview data={{ ...data, places, routes: s.data.routes || [] }} view={view} />
      <p className="stp-cap"><b>{VIEWS.find((v) => v[0] === view)[1]}</b> · {cap}</p>
    </div>
  )
  return (
    <div className="stp">
      <div className="stp-seg" role="tablist" aria-label="Tela da prévia">
        {VIEWS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={view === k} className={view === k ? 'on' : ''} onClick={() => setPick(k)}>{l}</button>)}
      </div>
      <div className={'stp-ph' + (flash ? ' flash' : '')}>
        <Phone h={600} label="Prévia do seu mapa público, como o seguidor vê no celular">
          <Native h={600} theme={theme}>
            <div className="pub preview" style={{ ...pubVars(theme), height: '100%' }}>
              <MapSheet key={view + ':' + (mode || '')} data={data} shown={places} f={f} selectedId={view === 'place' ? places[0]?.id : null} preview fake={fake || s.usingSample} snap={view === 'list' ? 'full' : focus ? 'peek' : view === 'place' ? 'half' : 'low'} />
            </div>
          </Native>
        </Phone>
      </div>
      <p className="stp-cap"><b>{VIEWS.find((v) => v[0] === view)[1]}</b> · {cap}{focus && ' A prévia aproxima alguns lugares e aumenta os pins, para destacar o que você está mudando.'}</p>
    </div>
  )
}

const NAV = [['modelos', 'Modelos', 'layers', '/estudio'], ['cores', 'Cores e tema', 'palette', '/estudio/cores'], ['categorias', 'Categorias', 'grid', '/estudio/categorias'], ['pins', 'Pins e símbolos', 'flag', '/estudio/pins'],
  ['mapa', 'Mapa', 'pin', '/estudio/mapa']]
// O Estúdio vive dentro do painel original: mesma barra lateral, cabeçalho com o estado de publicação e abas das seções.
function StudioHead({ active }) {
  const s = useStudio()
  return (
    <div className="stm-h">
      <div className="stm-t">
        <div className="pg-h"><h1 className="d s44">Estúdio de estilo</h1><p className="sm mut">Personalize como o seu mapa aparece para os seguidores.</p></div>
        <div className="stm-act">
          <span className={'stm-st' + (s.dirty ? ' dirty' : '')} role="status"><i />{s.dirty ? 'Alterações não publicadas' : 'Tudo publicado'}</span>
          {s.dirty && <button type="button" className="link xs" onClick={s.undo}>Desfazer</button>}
          <button type="button" className="btn sm" disabled={!s.dirty || s.blocked} title={s.blocked ? 'A cor principal está igual ao fundo' : undefined} onClick={s.publish}>Publicar</button>
        </div>
      </div>
      <Tabs items={NAV} active={active} label="Seções do estúdio" />
    </div>
  )
}
// layout: 'side' e 'main' = controles + prévia lateral; 'full' = sem prévia
function Shell({ active, layout = 'side', previewWidth = 460, title, children, fake, tpl }) {
  useTitle(`Estúdio · ${title}`)
  const s = useStudio()
  const locked = !s.c.plan?.can?.studioFull
  return (
    <div className="page"><div className="app">
      <Side active="estudio" />
      <div className="main stm">
        <StudioHead active={active} />
        <div className={'stbody' + (layout === 'full' ? ' full' : '')}>
          <div className="ctl">{locked ? <div className="card col" style={{ gap: 12, alignItems: 'flex-start' }}><div className="row" style={{ gap: 10 }}><Icon n="lock" s={18} /><b>Disponível a partir do plano Criador</b></div><span className="sm">No plano Grátis, o mapa usa o tema Solar com a cor principal preta. Cores, fonte, categorias, pins, símbolos e estilo do mapa ficam liberados no Criador.</span><Link to="/painel/plano" className="btn sm">Ver planos</Link></div> : children}</div>
          {layout !== 'full' && <div className="prev"><div><StudioPhone active={active} fake={fake} />{s.usingSample && <div className="xs mut c" style={{ marginTop: 10, maxWidth: 300 }}>Prévia com lugares de exemplo. Confirme lugares para ver os seus.</div>}</div></div>}
        </div>
      </div>
    </div></div>
  )
}
const BG_PRESETS = [['#ffffff', 'Branco'], ['#faf7f2', 'Creme'], ['#fff8e1', 'Manteiga'], ['#fff5fb', 'Rosé'], ['#f4f8ff', 'Gelo'], ['#f1f1f1', 'Cinza claro'], ['#343843', 'Noite'], ['#171717', 'Preto']]
const Lb = ({ children }) => <span className="lb">{children}</span>
const Slider = ({ value, onChange, label }) => <input type="range" min="0" max="100" value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--acc)' }} />
const ColorBox = ({ value, onChange, label, wide }) => <label className={wide ? 'in' : 'swatch'} style={wide ? { cursor: 'pointer' } : { background: value, position: 'relative', display: 'block' }} aria-label={label}>{wide && <><i style={{ width: 22, height: 22, borderRadius: 6, background: value, border: '1px solid var(--line)' }} /><span>{value.toUpperCase()}</span></>}<input type="color" className="sr" value={value} onChange={(e) => onChange(e.target.value)} /></label>

// arrastar para reordenar (com setas do teclado no cabeçalho de arraste)
function useSortable(list, set) {
  const from = useRef(null)
  const move = (a, b) => { if (b < 0 || b >= list.length || a === b) return; const n = [...list]; const [x] = n.splice(a, 1); n.splice(b, 0, x); set(n) }
  const props = (i) => ({ onDragOver: (e) => e.preventDefault(), onDrop: (e) => { e.preventDefault(); if (from.current != null) move(from.current, i); from.current = null } })
  const handle = (i) => <span draggable tabIndex={0} role="button" aria-label="Arrastar para reordenar (ou use as setas)" style={{ cursor: 'grab', display: 'inline-flex' }} onDragStart={(e) => { from.current = i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)) }} onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); move(i, i - 1) } if (e.key === 'ArrowDown') { e.preventDefault(); move(i, i + 1) } }}><Icon n="drag" s={18} c="#a3a3a3" /></span>
  return { props, handle }
}
const upload = (file, max) => new Promise((res, rej) => { if (!file || file.size > max) return rej(new Error('size')); const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file) })

const Sec = ({ title, hint, children, right }) => <section className="card col" style={{ gap: 14 }}>{(title || right) && <div className="row jb wrap" style={{ gap: 8 }}><div><b>{title}</b>{hint && <div className="xs mut">{hint}</div>}</div>{right}</div>}{children}</section>

// D1 · visão geral
export function StudioHome() {
  const s = useStudio()
  const T = s.theme
  const apply = (tpl) => { s.setTheme(applyTemplate(T, tpl)); toast(`Modelo ${tpl.name} aplicado ao rascunho`) }
  // o modelo está "selecionado" quando tudo o que ele define é exatamente o que está configurado
  const same = (tpl) => { const n = applyTemplate(T, tpl); const low = (v) => String(v).toLowerCase(); return ['accent', 'bg', 'tone', 'shape', 'font', 'radius'].every((k) => low(n[k]) === low(T[k])) && n.categories.every((c, i) => low(c.color) === low(T.categories[i].color)) }
  const current = TEMPLATES.find(same)
  const dot = (c, k) => <i key={k} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: k ? -8 : 0, boxShadow: '0 0 0 1px rgba(0,0,0,.08)', display: 'inline-block' }} />
  return (
    <Shell active="modelos" layout="main" previewWidth={460} title="Modelos">
      <div><h1 className="d s32">Modelos</h1><p className="sm mut">Aplica cores, fonte e pins de uma vez. Dá para ajustar tudo depois nas outras abas.</p></div>
      <div className="g2" style={{ gap: 12 }}>{TEMPLATES.map((t) => { const on = current?.id === t.id; return (
        <button key={t.id} type="button" className={'card col' + (on ? ' sel' : '')} style={{ gap: 10, padding: 16, textAlign: 'left' }} aria-pressed={on} onClick={() => apply(t)}>
          <div className="row jb"><span className="row" style={{ gap: 0 }}>{[t.t.accent, t.t.bg, t.t.fg].map((c, k) => dot(c, k))}</span>{on && <span className="tag ok">Selecionado</span>}</div>
          <div><b>{t.name}</b><div className="xs mut">{FONTS[t.t.font].label} · pin {SHAPES[t.t.shape].toLowerCase()} · mapa {TONES[t.t.tone].label.toLowerCase()}</div></div>
        </button>) })}</div>
      {!current && <p className="xs mut" style={{ margin: 0 }}>Seu estilo está personalizado: nenhum modelo corresponde exatamente ao que está configurado.</p>}
      <button className="btn ln sm" style={{ alignSelf: 'flex-start' }} onClick={() => { if (confirm('Voltar ao visual padrão? As categorias mantêm o símbolo.')) s.setTheme((t) => applyTemplate(t, { t: { accent: '#ff4b2b', bg: '#ffffff', fg: '#171717', tone: 'light', shape: 'drop', font: 'sans', radius: 14 }, pal: 'warm' })) }}>Começar do zero</button>
    </Shell>
  )
}

// D2 · cores e tema
export function StudioColors() {
  const { theme: T, setTheme } = useStudio()
  const ratio = contrast(onAccent(T), T.accent)
  const textRatio = contrast(T.fg, T.bg)
  const blocked = contrast(T.accent, T.bg) < 1.25
  return (
    <Shell active="cores" title="Cores e tema">
      <h1 className="d s32">Cores e tema</h1>
      <Sec title="Cor principal" hint="Botões, destaques e o cartão dos roteiros">
        <div className="row wrap" style={{ gap: 10 }}>{ACCENTS.map((a) => <button key={a} aria-label={`Cor ${a}`} aria-pressed={T.accent.toLowerCase() === a} className={'swatch big' + (T.accent.toLowerCase() === a ? ' on' : '')} style={{ background: a }} onClick={() => setTheme({ accent: a })}>{T.accent.toLowerCase() === a && <Icon n="check" s={18} c={onColor(a)} />}</button>)}<label className="chip" style={{ position: 'relative' }}>Outra cor<input type="color" className="sr" value={T.accent} onChange={(e) => setTheme({ accent: e.target.value })} aria-label="Outra cor" /></label></div>
      </Sec>
      <Sec title="Fundo" hint="O texto se ajusta sozinho (escuro ou branco) para ficar sempre legível">
        <div className="row wrap" style={{ gap: 10 }}>{BG_PRESETS.map(([c, l]) => <button key={c} type="button" aria-label={`Fundo ${l}`} aria-pressed={T.bg.toLowerCase() === c} title={l} className={'swatch big' + (T.bg.toLowerCase() === c ? ' on' : '')} style={{ background: c, boxShadow: T.bg.toLowerCase() === c ? undefined : 'inset 0 0 0 1px rgba(0,0,0,.12)' }} onClick={() => setTheme({ bg: c })}>{T.bg.toLowerCase() === c && <Icon n="check" s={18} c={onColor(c)} />}</button>)}<label className="chip" style={{ position: 'relative' }}>Outra cor<input type="color" className="sr" value={T.bg} onChange={(e) => setTheme({ bg: e.target.value })} aria-label="Outra cor de fundo" /></label></div>
        <div className="row" style={{ background: T.bg, color: T.fg, borderRadius: T.radius, padding: 14, gap: 12, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)', fontFamily: (FONTS[T.font] || FONTS.sans).css }}>
          <div className="sp"><b style={{ fontSize: 16 }}>Cafeteria Exemplo</b><div style={{ fontSize: 12, opacity: .7 }}>Pinheiros · aberto até as 18h</div></div>
          <span style={{ background: T.accent, color: onAccent(T), borderRadius: Math.min(T.radius, 22), padding: '8px 14px', fontWeight: 700, fontSize: 13 }}>Abrir rota</span></div>
        <div className="row wrap" style={{ gap: 6 }}><span className="tag ok">Texto {textRatio.toFixed(1)}:1</span><span className={'tag ' + (ratio >= 4.5 ? 'ok' : 'bd2')}>Botão {ratio.toFixed(1)}:1</span><span className="xs mut">Texto automático: {T.fg === '#ffffff' ? 'branco' : 'escuro'}. O mínimo recomendado é 4,5:1.</span></div>
        {blocked && <Note style={{ background: 'var(--bads)', color: 'var(--bad)' }}>A cor principal está quase igual ao fundo: botões e destaques ficariam invisíveis. Escolha outra cor principal ou outro fundo para poder publicar.</Note>}
      </Sec>
      <Sec title="Fonte dos títulos">
        <div className="g2" style={{ gap: 10 }}>{Object.entries(FONTS).map(([k, f]) => <button key={k} className={'card col' + (T.font === k ? ' sel' : '')} style={{ padding: 14, textAlign: 'left', gap: 2, fontFamily: f.css, textTransform: f.upper ? 'uppercase' : 'none', fontWeight: 700 }} aria-pressed={T.font === k} onClick={() => setTheme({ font: k })}><span style={{ fontSize: 30, lineHeight: 1 }}>Aa</span><span style={{ fontSize: f.size }}>{f.label}</span></button>)}</div>
      </Sec>
      <Sec title="Cantos dos botões e cartões">
        <div className="row" style={{ gap: 10 }}>{Object.entries(RADIUS_MODES).map(([k, m]) => <button key={k} className={'card col' + (radiusMode(T.radius) === k ? ' sel' : '')} style={{ padding: 12, alignItems: 'center', gap: 8, flex: 1 }} aria-pressed={radiusMode(T.radius) === k} onClick={() => setTheme({ radius: m.r })}><span style={{ width: 52, height: 36, background: 'var(--ink)', borderRadius: m.r }} /><span className="xs">{m.label}</span></button>)}</div>
      </Sec>
      <Sec><div className="row"><div className="sp"><b className="sm">Contraste automático</b><div className="xs mut">Ajusta o texto dos botões para ficar legível sobre a cor principal</div></div><Switch on={T.contrastAuto} onChange={(v) => setTheme({ contrastAuto: v })} label="Contraste automático" /></div>
        {ratio < 4.5 && <Note style={{ background: 'var(--bads)', color: 'var(--bad)' }}>Atenção: o texto sobre a cor principal tem contraste {ratio.toFixed(1)}:1.{T.contrastAuto ? '' : ' Ligue o contraste automático.'}</Note>}</Sec>
    </Shell>
  )
}

// D3 · categorias (lista fixa do wagli: só a cor muda)
export function StudioCategories() {
  const { theme: T, setTheme, places, c: cr } = useStudio()
  const count = (id) => places.filter((p) => p.category === id && (p.status === 'confirmed' || p.status === 'pending')).length
  const setCat = (i, patch) => setTheme((t) => ({ categories: t.categories.map((x, j) => (j === i ? { ...x, ...patch } : x)) }))
  const can = !!cr.plan?.can?.customCategories
  const extras = T.categories.filter((k) => k.custom).length
  const full = extras >= EXTRA_MAX
  const [nn, setNn] = useState(''); const [nb, setNb] = useState('rest')
  const nameBad = nn.trim().length < 2 || !catNameOk(cleanCatName(nn)) || T.categories.some((k) => k.name.toLowerCase() === cleanCatName(nn).toLowerCase())
  const addCat = () => {
    const base = CATEGORIES.find((d) => d.id === nb)
    const id = 'x' + Math.random().toString(36).slice(2, 8)
    setTheme((t) => ({ categories: [...t.categories, { id, name: cleanCatName(nn), base: base.id, custom: true, color: base.color, icon: t.categories.find((k) => k.id === base.id)?.icon || base.icon }] }))
    setNn(''); toast('Categoria criada. Publique as alterações para ela ir ao ar.')
  }
  const removeCat = (i) => { const k = T.categories[i]; if (count(k.id) && !confirm(`${count(k.id)} lugar(es) voltam para ${CATEGORIES.find((d) => d.id === k.base)?.name || 'Restaurante'}. Remover?`)) return; setTheme((t) => ({ categories: t.categories.filter((_, j) => j !== i) })) }
  const palette = [...new Set([...CAT_COLORS, ...ACCENTS, '#a16207', '#7c3aed', '#0e9f8e'])].slice(0, 10)
  return (
    <Shell active="categorias" title="Categorias">
      <div><h1 className="d s32">Categorias</h1><p className="sm mut">As {CATEGORIES.length} categorias fixas são as mesmas em todos os mapas, para os seguidores acharem tudo do mesmo jeito. Você escolhe a cor de cada uma; os símbolos vêm do pacote em Pins e símbolos.</p></div>
      <div className="g2" style={{ gap: 12 }}>{T.categories.map((cat, i) => {
        const { n, sym } = symOf(cat, cr.symbols)
        return (
          <div key={cat.id} className="card col" style={{ gap: 12, padding: 14 }}>
            <div className="row"><span className="catico" style={{ background: cat.color }}><Icon n={n} sym={sym} s={18} c="#fff" /></span><div className="sp"><b className="sm">{cat.name}</b><div className="xs mut">{count(cat.id)} lugar{count(cat.id) === 1 ? '' : 'es'}{cat.custom ? ' · própria · ' : ''}{cat.custom && <button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }} aria-label={`Remover ${cat.name}`} onClick={() => removeCat(i)}>Remover</button>}</div></div></div>
            <div className="row wrap" style={{ gap: 6 }}>{[cat.color, ...palette.filter((x) => x.toLowerCase() !== cat.color.toLowerCase())].slice(0, 7).map((col, k) => <button key={col} aria-label={`Cor ${col} em ${cat.name}`} aria-pressed={k === 0} className={'dotsw sm' + (k === 0 ? ' on' : '')} style={{ background: col }} onClick={() => setCat(i, { color: col })} />)}
              <label className="dotsw sm" style={{ position: 'relative', background: 'conic-gradient(#ff4b2b,#ffc400,#12b76a,#2d7ff9,#9b5cff,#ff4b2b)', display: 'block' }} title="Outra cor"><input type="color" className="sr" value={cat.color} onChange={(e) => setCat(i, { color: e.target.value })} aria-label={`Outra cor para ${cat.name}`} /></label></div>
          </div>)
      })}</div>
      {can ? (
        <Sec title="Nova categoria" hint={`Plano Pro. Até ${EXTRA_MAX} categorias próprias, além das ${CATEGORIES.length} fixas. O tipo de base define o símbolo nos pacotes.`}>
          <div className="col" style={{ gap: 12 }}>
            <Field label="Nome" id="ncn"><div className="in"><input id="ncn" maxLength={24} placeholder="Ex.: Comida de rua" value={nn} onChange={(e) => setNn(e.target.value)} disabled={full} /></div></Field>
            <Field label="Tipo de base" id="ncb"><select id="ncb" className="selbox" style={{ width: '100%' }} value={nb} onChange={(e) => setNb(e.target.value)} disabled={full}>{CATEGORIES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          </div>
          <div className="row jb wrap"><span className="xs mut">{full ? `Você usou as ${EXTRA_MAX} categorias próprias.` : 'Nomes curtos, sem links. Depois de criar, mude a cor e mova os lugares para ela em Lugares.'}</span><button type="button" className="btn sm" disabled={full || nameBad} onClick={addCat}><Icon n="plus" s={14} />Criar categoria</button></div>
        </Sec>
      ) : (
        <div className="card row" style={{ gap: 12, padding: 14 }}><span className="catico" style={{ background: '#e5e5e5' }}><Icon n="lock" s={18} c="#555" /></span><div className="sp"><b className="sm">Categorias próprias</b><div className="xs mut">Crie categorias além das {CATEGORIES.length} fixas. Disponível no plano Pro.</div></div><Link to="/planos" className="btn ghost sm">Ver planos</Link></div>
      )}
    </Shell>
  )
}

// D4 · biblioteca de símbolos
// Pacote de símbolos: vale para todas as categorias de uma vez (o criador não escolhe símbolo por categoria)
const PACKS = [['base', 'Básicos', 'Ícones simples do JoyMap'], ...Object.entries(LIBS).map(([k, v]) => [k, v.label, v.long])]
const packIcon = (pack, cat) => { const b = cat.base || cat.id; return pack === 'base' ? CATEGORIES.find((c) => c.id === b).icon : SAMPLE_ICON[pack][b] ? `lib:${pack}:${SAMPLE_ICON[pack][b]}` : cat.icon }
function SymbolPicker() {
  const { theme: T, setTheme, c: cr } = useStudio()
  const current = PACKS.find(([k]) => T.categories.every((c) => c.icon === packIcon(k, c)))?.[0] || null
  const apply = (k, label) => { setTheme((t) => ({ categories: t.categories.map((c) => ({ ...c, icon: packIcon(k, c) })) })); toast(`Pacote ${label} aplicado a todas as categorias`) }
  const show = (k, c) => { const id = packIcon(k, c); const lib = LIBS[k]; return <span key={c.id} title={c.name} style={{ width: 34, height: 34, borderRadius: '50%', background: lib?.color ? '#f1f1f4' : c.color, display: 'grid', placeItems: 'center' }}>{k === 'base' ? <Icon {...symOf({ icon: id }, cr.symbols)} s={18} c="#fff" /> : <Icon sym={{ lib: id }} s={lib.color ? 24 : 18} c="#fff" />}</span> }
  return (
    <>
      <div><h2 className="d s26">Pacote de símbolos</h2><p className="sm mut">O pacote vale para todas as categorias de uma vez, no mapa e nos pins.</p></div>
      <div className="col" style={{ gap: 10 }}>{PACKS.map(([k, label, desc]) => (
        <button key={k} type="button" className={'card col' + (current === k ? ' sel' : '')} style={{ gap: 10, textAlign: 'left' }} aria-pressed={current === k} onClick={() => apply(k, label)}>
          <div className="row jb"><div><b className="sm">{label}</b><div className="xs mut">{desc}{LIBS[k] ? `. Licença ${LIBS[k].license}.` : ''}</div></div>{current === k && <span className="tag ok">Em uso</span>}</div>
          <div className="row wrap" style={{ gap: 8 }}>{T.categories.map((c) => show(k, c))}</div>
        </button>))}</div>
    </>
  )
}

// D5 · estilo do mapa
export function StudioMap() {
  const { theme: T, setTheme } = useStudio()
  return (
    <Shell active="mapa" title="Mapa">
      <h1 className="d s32">Mapa</h1>
      <Sec title="Base do mapa" hint="O desenho das ruas e dos bairros por trás dos seus pins">
        <div className="g2" style={{ gap: 10 }}>
          {Object.entries(TONES).map(([k, t]) => <button key={k} aria-pressed={T.tone === k} className={'card col' + (T.tone === k ? ' sel' : '')} style={{ padding: 8, gap: 8, textAlign: 'left' }} onClick={() => setTheme({ tone: k })}><div style={{ borderRadius: 12, overflow: 'hidden', pointerEvents: 'none', position: 'relative' }}><FakeMap h={110} tone={k} n={5} lab={false} />{T.tone === k && <span style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)', display: 'grid', placeItems: 'center' }}><Icon n="check" s={14} c="#fff" /></span>}</div><b className="xs" style={{ paddingLeft: 4 }}>{t.label}</b></button>)}
        </div>
      </Sec>
      <Sec title="Nomes de bairros">
        <div className="row"><div className="sp"><b className="sm">Mostrar rótulos no mapa</b><div className="xs mut">Aparecem até o zoom 12</div></div><Switch on={T.mapLabels} onChange={(v) => setTheme({ mapLabels: v })} label="Nomes de bairros" /></div>
        <div style={{ opacity: T.mapLabels ? 1 : 0.45 }}><div className="row jb"><Lb>Quantidade de rótulos</Lb><b className="xs">{T.labelDensity}%</b></div><Slider value={T.labelDensity} onChange={(v) => setTheme({ labelDensity: v })} label="Quantidade de rótulos" /></div>
      </Sec>
      <Sec title="Blocos do Sobre" hint="Texto, últimos lugares, onde mais vai e “Fique por dentro” aparecem sempre">
        {[['agenda', 'Agenda e próximo evento', 'Seus encontros e eventos'], ['brands', 'Marcas', 'Os logos das marcas']].map(([k, l, d]) => { const off = T.hide?.includes(k); return (
          <div key={k} className="row"><div className="sp"><b className="sm">{l}</b><div className="xs mut">{d}</div></div><Switch on={!off} onChange={(v) => setTheme({ hide: v ? (T.hide || []).filter((x) => x !== k) : [...(T.hide || []), k] })} label={l} /></div>) })}
      </Sec>
      <Note>Os estilos de mapa são do OpenFreeMap (Positron, Bright, Fiord e Dark), sobre dados do OpenStreetMap. Revise o uso dos tiles antes do lançamento. Créditos dos símbolos: <a className="link" href="/licencas-simbolos.txt" target="_blank" rel="noopener">licenças</a>.</Note>
    </Shell>
  )
}

// D6 · pins e símbolos (juntos)
export function StudioPins() {
  const { theme: T, setTheme } = useStudio()
  const shapeBox = (k) => {
    const st = { width: 30, height: 30, background: '#ff4b2b', display: 'block', margin: 4 }
    if (k === 'drop') Object.assign(st, { borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' })
    if (k === 'circle') st.borderRadius = '50%'
    if (k === 'square') st.borderRadius = 8
    if (k === 'hex') st.clipPath = 'polygon(25% 4%,75% 4%,100% 50%,75% 96%,25% 96%,0 50%)'
    return <i style={st} />
  }
  return (
    <Shell active="pins" title="Pins e símbolos">
      <h1 className="d s32">Pins e símbolos</h1>
      <Sec title="Formato do pin">
        <div className="g4" style={{ gap: 8 }}>{Object.entries(SHAPES).map(([k, l]) => <button key={k} aria-pressed={T.shape === k} className={'card col' + (T.shape === k ? ' sel' : '')} style={{ alignItems: 'center', padding: 10, gap: 6 }} onClick={() => setTheme({ shape: k })}>{shapeBox(k)}<span className="xs">{l}</span></button>)}</div>
      </Sec>
      <Sec title="Detalhes">
        <div className="row"><div className="sp"><b className="sm">Borda branca</b><div className="xs mut">Melhora a leitura em mapas escuros</div></div><Switch on={T.pinBorder} onChange={(v) => setTheme({ pinBorder: v })} label="Borda branca" /></div>
        <div className="sep" />
        <div className="row"><div className="sp"><b className="sm">Agrupar pins próximos</b><div className="xs mut">Mostra o total quando o zoom é baixo</div></div><Switch on={T.cluster} onChange={(v) => setTheme({ cluster: v })} label="Agrupar pins próximos" /></div>
        {T.cluster && <div className="row" style={{ gap: 10 }}><span style={{ width: 38, height: 38, borderRadius: '50%', background: '#171717', color: '#fff', display: 'grid', placeItems: 'center', font: '700 15px Archivo' }}>12</span><span style={{ width: 30, height: 30, borderRadius: '50%', background: '#171717', color: '#fff', display: 'grid', placeItems: 'center', font: '700 13px Archivo' }}>5</span><span className="xs mut sp">Estilo do grupo: círculo escuro com a contagem</span></div>}
        <div className="sep" />
        <div><Lb>Pin selecionado</Lb><div className="row wrap">{[['outline', 'Maior com contorno'], ['pulse', 'Pulsando'], ['color', 'Só cor']].map(([k, l]) => <button key={k} className={'chip' + (T.selected === k ? ' on' : '')} aria-pressed={T.selected === k} onClick={() => setTheme({ selected: k })}>{l}</button>)}</div></div>
      </Sec>
      <SymbolPicker />
    </Shell>
  )
}
