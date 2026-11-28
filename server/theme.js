// Tema visual do criador: validação de tudo que vem do cliente + saneamento de SVG enviado.
import { CATEGORIES } from './categories.js'
export { CATEGORIES }
export const ICONS = ['rest', 'cafe', 'bar', 'bread', 'cake', 'pizza', 'fish', 'burger', 'heart', 'star', 'flag', 'store', 'clock', 'spark']
export const BLOCKS = ['header', 'filters', 'map', 'list', 'routes']
const FONTS = ['sans', 'disp', 'serif', 'fraunces', 'playfair', 'mono']
const TONES = ['light', 'bright', 'fiord', 'dark']
const TONE_LEGACY = { sepia: 'bright', liberty: 'bright', mint: 'bright', blue: 'fiord' } // estilos antigos (Snazzy) viram os equivalentes do OpenFreeMap
const SHAPES = ['drop', 'circle', 'square', 'hex']
const SELECTED = ['outline', 'pulse', 'color']
const LINK_STYLES = ['fill', 'line', 'soft']
const HEIGHTS = ['sm', 'md', 'lg']
const LISTS = ['grid', 'rows']
const HEX = /^#[0-9a-fA-F]{6}$/
// o Sobre sempre mostra o texto, os últimos lugares, onde mais vai e o "Fique por dentro"; só estes podem sair
export const ABOUT_OPTIONAL = ['agenda', 'brands']

// Categorias fixas do wagli: o criador não adiciona, remove nem renomeia; só escolhe cor e símbolo de cada uma.

export const DEFAULT_LAYOUT = {
  blocks: [{ id: 'header', on: true }, { id: 'filters', on: true }, { id: 'map', on: true }, { id: 'list', on: true }, { id: 'routes', on: false }],
  mapHeight: 'md', listStyle: 'grid', cover: false,
}

export const DEFAULT_THEME = {
  accent: '#ff4b2b', bg: '#ffffff', fg: '#171717', font: 'sans', radius: 14, contrastAuto: true,
  tone: 'light', shape: 'drop', pinSize: 55, pinBorder: true, cluster: true, selected: 'outline',
  mapLabels: true, labelDensity: 40, start: 'all', startView: null,
  hide: [], // blocos opcionais do Sobre que o criador escondeu
  linkStyle: 'fill', social: { instagram: true, tiktok: false }, bio: '', layout: DEFAULT_LAYOUT,
  categories: CATEGORIES.map((c) => ({ ...c })),
}

// Contraste (WCAG): a cor do texto nunca é escolhida pelo criador, sai do fundo (escuro sobre claro, branco sobre escuro).
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255) }
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
export const textOn = (bg) => {
  const best = contrast('#ffffff', bg) >= contrast('#171717', bg) ? '#ffffff' : '#171717'
  if (contrast(best, bg) >= 4.5) return best
  return contrast('#ffffff', bg) >= contrast('#000000', bg) ? '#ffffff' : '#000000' // tons médios: só preto ou branco puros chegam a 4,5:1
}
// a cor principal não pode quase sumir no fundo (botões e destaques ficariam invisíveis)
export const accentProblem = (t) => (contrast(t.accent, t.bg) < 1.25 ? 'cor_principal_igual_ao_fundo' : null)

const pick = (list, v, fb) => (list.includes(v) ? v : fb)
const num = (v, lo, hi, fb) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fb }

function sanitizeLayout(input, legacy) {
  const l = input && typeof input === 'object' ? input : {}
  const given = Array.isArray(l.blocks) ? l.blocks : []
  const seen = new Set()
  const blocks = []
  for (const b of given) { // respeita a ordem escolhida; ignora ids desconhecidos
    if (BLOCKS.includes(b?.id) && !seen.has(b.id)) { seen.add(b.id); blocks.push({ id: b.id, on: !!b.on }) }
  }
  for (const d of DEFAULT_LAYOUT.blocks) if (!seen.has(d.id)) blocks.push({ ...d })
  if (!given.length) { // temas antigos: showLinks/showFilters
    if (legacy.showLinks === false) blocks.find((b) => b.id === 'links').on = false
    if (legacy.showFilters === false) blocks.find((b) => b.id === 'filters').on = false
  }
  const hdr = blocks.find((b) => b.id === 'header')
  hdr.on = true // cabeçalho (nome e foto) é obrigatório: é a identificação do criador
  return { blocks, mapHeight: pick(HEIGHTS, l.mapHeight, 'md'), listStyle: pick(LISTS, l.listStyle, 'grid'), cover: !!l.cover }
}

// Categorias próprias (só no plano Pro): id "x…", nome curto sem links, e um "tipo de base" (uma das 9 fixas) que define o símbolo nos pacotes.
export const EXTRA_MAX = 6
const EXTRA_ID = /^x[a-z0-9]{4,8}$/
const EXTRA_NAME = /^[\p{L}\p{N}][\p{L}\p{N} &'’.,+-]{0,22}[\p{L}\p{N}.]$/u
export const cleanCatName = (v) => String(v || '').normalize('NFC').replace(/\s+/g, ' ').trim()
export const catNameOk = (v) => EXTRA_NAME.test(v) && !/https?|www\.|\.com|@/i.test(v)

// opts.extraMax: quantas categorias próprias cabem; opts.only: se dado, só aceita ids que já existiam (plano acabou: mantém, não cria)
export function sanitizeTheme(input = {}, opts = {}) {
  const extraMax = opts.extraMax ?? EXTRA_MAX
  const t = { ...DEFAULT_THEME, ...(input || {}) }
  const out = {
    accent: HEX.test(t.accent) ? t.accent : DEFAULT_THEME.accent, bg: HEX.test(t.bg) ? t.bg : DEFAULT_THEME.bg, fg: DEFAULT_THEME.fg,
    font: pick(FONTS, t.font, 'sans'), radius: Math.max(0, Math.min(32, parseInt(t.radius, 10) || 0)), contrastAuto: t.contrastAuto !== false,
    tone: pick(TONES, TONE_LEGACY[t.tone] || t.tone, 'light'), shape: pick(SHAPES, t.shape, 'drop'), pinSize: 55, pinBorder: t.pinBorder !== false,
    cluster: t.cluster !== false, selected: pick(SELECTED, t.selected, 'outline'), mapLabels: t.mapLabels !== false, labelDensity: num(t.labelDensity, 0, 100, 40),
    start: 'all', startView: null, // o ponto inicial do mapa não é mais configurável: sempre enquadra todos os lugares
    linkStyle: pick(LINK_STYLES, t.linkStyle, 'fill'),
    social: { instagram: t.social?.instagram !== false, tiktok: !!t.social?.tiktok },
    bio: String(t.bio || '').slice(0, 600),
    hide: ABOUT_OPTIONAL.filter((k) => Array.isArray(t.hide) && t.hide.includes(k)),
    layout: { ...DEFAULT_LAYOUT, blocks: DEFAULT_LAYOUT.blocks.map((b) => ({ ...b })) }, // o layout da página é fixo: o criador não o edita
  }
  const given = new Map((Array.isArray(t.categories) ? t.categories : []).map((c) => [String(c?.id), c || {}]))
  const okIcon = (i) => ICONS.includes(i) || /^custom:\d{1,9}$/.test(String(i)) || /^lib:(fluent3d|noto|lucide):[a-z0-9-]{1,48}$/.test(String(i))
  out.categories = CATEGORIES.map((d) => { const g = given.get(d.id) || {}; return { ...d, color: HEX.test(g.color) ? g.color : d.color, icon: okIcon(g.icon) ? g.icon : d.icon } })
  const fixed = new Set(CATEGORIES.map((d) => d.id))
  const names = new Set(CATEGORIES.map((d) => d.name.toLowerCase()))
  for (const g of (Array.isArray(t.categories) ? t.categories : [])) {
    if (out.categories.length >= CATEGORIES.length + extraMax) break
    const id = String(g?.id || '')
    const name = cleanCatName(g?.name)
    if (!EXTRA_ID.test(id) || fixed.has(id) || out.categories.some((x) => x.id === id)) continue
    if (opts.only && !opts.only.has(id)) continue
    if (!catNameOk(name) || names.has(name.toLowerCase())) continue
    names.add(name.toLowerCase())
    const base = CATEGORIES.find((d) => d.id === g.base) || CATEGORIES.find((d) => d.id === 'rest')
    out.categories.push({ id, name, base: base.id, custom: true, color: HEX.test(g.color) ? g.color : base.color, icon: okIcon(g.icon) ? g.icon : base.icon })
  }
  out.fg = textOn(out.bg) // texto sempre legível sobre o fundo escolhido
  return out
}

// SVG enviado pelo criador: aceitamos só <path d="..."> (sem script, estilo, imagem ou link) e guardamos apenas o desenho.
export function sanitizeSvg(src) {
  const s = String(src || '')
  if (s.length > 50 * 1024) throw new Error('svg_grande')
  if (!/<svg[\s>]/i.test(s)) throw new Error('svg_invalido')
  if (/<\s*(script|foreignObject|image|style|use|a|animate|set)\b|\son\w+\s*=|javascript:|href\s*=|<!ENTITY|<!DOCTYPE/i.test(s)) throw new Error('svg_inseguro')
  const vbm = s.match(/viewBox\s*=\s*["']([\d.\s,-]+)["']/i)
  const vb = vbm ? vbm[1].trim().replace(/,/g, ' ').replace(/\s+/g, ' ') : '0 0 24 24'
  const p = vb.split(' ').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isFinite(n)) || p[2] <= 0 || p[3] <= 0) throw new Error('svg_invalido')
  const ds = [...s.matchAll(/<path\b[^>]*?\sd\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1])
  if (!ds.length) throw new Error('svg_sem_path')
  const d = ds.join(' ')
  if (d.length > 20000 || !/^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/.test(d)) throw new Error('svg_invalido')
  const mode = /fill\s*=\s*["']none["']/i.test(s) && /stroke\s*=\s*["']/i.test(s) ? 'stroke' : 'fill'
  return { d, vb, mode }
}

// Plano Grátis: sem Estúdio. O mapa usa o tema Solar com cor principal preta; só a bio é mantida. O estilo salvo volta se o plano subir.
export const FREE_ACCENT = '#171717'
export const freeTheme = (theme) => ({ ...sanitizeTheme({ ...DEFAULT_THEME, accent: FREE_ACCENT }), bio: theme?.bio || '', social: theme?.social || DEFAULT_THEME.social })
