import L from 'leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maplibre/maplibre-gl-leaflet'
import './basemap.css'

// Base vetorial gratuita e sem chave (OpenFreeMap, dados © OpenStreetMap), usando os estilos nativos como foram desenhados.
const STYLES = { light: 'positron', bright: 'bright', fiord: 'fiord', dark: 'dark' }
const LEGACY = { sepia: 'bright', liberty: 'bright', mint: 'bright', blue: 'fiord' } // tons antigos (Snazzy) dos mapas já salvos
export const styleName = (tone) => STYLES[tone] || STYLES[LEGACY[tone]] || 'positron'
const cache = {}
const load = (name) => (cache[name] ||= fetch(`https://tiles.openfreemap.org/styles/${name}`).then((r) => { if (!r.ok) throw new Error('style'); return r.json() }).catch((e) => { delete cache[name]; throw e }))

export const ATTRIBUTION = '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://openmaptiles.org" target="_blank" rel="noopener">OpenMapTiles</a> · dados © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">colaboradores do OpenStreetMap</a>'

// O crédito é obrigatório pela licença dos dados, mas não precisa ficar sempre aberto: aparece ao abrir o mapa,
// recolhe num botão "i" depois de 5 segundos (ou ao primeiro toque no mapa) e volta ao tocar no botão.
const credited = new WeakSet()
function foldCredit(map) {
  const box = map.attributionControl?.getContainer()
  if (!box || credited.has(map)) return
  credited.add(map)
  let timer
  const fold = (on) => {
    clearTimeout(timer)
    box.classList.toggle('folded', on)
    for (const [k, v] of [['role', 'button'], ['tabindex', '0'], ['aria-label', 'Créditos do mapa'], ['title', 'Créditos do mapa']]) on ? box.setAttribute(k, v) : box.removeAttribute(k)
  }
  const open = (e) => {
    if (!box.classList.contains('folded')) return
    e.preventDefault(); e.stopPropagation()
    fold(false); timer = setTimeout(() => fold(true), 5000)
  }
  L.DomEvent.disableClickPropagation(box)
  box.addEventListener('click', open)
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(e) })
  timer = setTimeout(() => fold(true), 5000)
  map.once('mousedown dragstart click', () => fold(true))
  map.once('unload', () => clearTimeout(timer))
}

// Adiciona ao mapa Leaflet uma camada vetorial com o estilo `tone`; devolve uma função que remove a camada.
export function addBasemap(map, tone, { labels = true, labelOpacity = 1, attribution = true } = {}) {
  let layer = null, dead = false
  load(styleName(tone)).then((st) => {
    if (dead) return
    const style = JSON.parse(JSON.stringify(st))
    if (!labels) style.layers = style.layers.filter((l) => l.type !== 'symbol')
    else if (labelOpacity < 1) for (const l of style.layers) if (l.type === 'symbol') { l.paint = l.paint || {}; l.paint['text-opacity'] = labelOpacity; l.paint['icon-opacity'] = labelOpacity }
    layer = L.maplibreGL({ style, attribution: attribution ? ATTRIBUTION : '', interactive: false, padding: 0.2 })
    layer.addTo(map)
    if (attribution) foldCredit(map)
  }).catch(() => {})
  return () => { dead = true; if (layer) map.removeLayer(layer) }
}
