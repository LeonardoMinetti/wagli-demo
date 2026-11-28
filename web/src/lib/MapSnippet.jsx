// Recorte do mapa no lugar da foto: mostra onde o lugar fica, sem depender de imagem de terceiros.
// Desenhado aqui mesmo (canvas 2D) a partir dos blocos vetoriais do OpenFreeMap, dados © colaboradores do OpenStreetMap.
import React, { useEffect, useRef, useState } from 'react'
import { VectorTile } from '@mapbox/vector-tile'
import Pbf from 'pbf'
import { catOf, symOf, pinHtml } from '../theme.jsx'
import { useLibVersion } from '../iconlib.js'

const W = 320, Z = 14, SCALE = 4.2 // 4,2× o bloco de zoom 14 ≈ três quarteirões de largura em 320 px
let template = null
const tiles = new Map()
const cache = new Map()

const source = () => (template ||= fetch('https://tiles.openfreemap.org/planet').then((r) => r.json()).then((j) => j.tiles[0]).catch((e) => { template = null; throw e }))
function tile(x, y) {
  const k = `${x}/${y}`
  if (!tiles.has(k)) {
    tiles.set(k, source().then((t) => fetch(t.replace('{z}', Z).replace('{x}', x).replace('{y}', y)))
      .then((r) => { if (!r.ok) throw new Error('bloco'); return r.arrayBuffer() })
      .then((b) => new VectorTile(new Pbf(b)))
      .catch((e) => { tiles.delete(k); throw e }))
  }
  return tiles.get(k)
}

const LIGHT = { land: '#f2f0ea', park: '#dcebd3', water: '#c4dcee', building: '#e7e3d8', road: '#ffffff', edge: '#d6d8e0', text: '#6b6b6b', halo: '#f2f0ea' }
const DARK = { land: '#22211f', park: '#24301f', water: '#17283a', building: '#2d2c29', road: '#45443f', edge: '#33322f', text: '#b4b2ab', halo: '#22211f' }
const ROAD = { motorway: 15, trunk: 13, primary: 12, secondary: 11, tertiary: 9, minor: 6.5, service: 3, path: 1.5 }

async function draw(lat, lon, dark) {
  const c = dark ? DARK : LIGHT
  const n = 2 ** Z
  const wx = ((lon + 180) / 360) * n
  const rad = (lat * Math.PI) / 180
  const wy = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
  const side = 256 * SCALE // largura de um bloco na imagem
  const x0 = wx * side - W / 2, y0 = wy * side - W / 2
  const wanted = []
  for (let x = Math.floor(x0 / side); x <= Math.floor((x0 + W) / side); x++) for (let y = Math.floor(y0 / side); y <= Math.floor((y0 + W) / side); y++) wanted.push([x, y])
  const got = await Promise.all(wanted.map(([x, y]) => tile(x, y).then((t) => ({ t, x, y }))))

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = W * 2
  const g = canvas.getContext('2d')
  g.scale(2, 2)
  g.fillStyle = c.land
  g.fillRect(0, 0, W, W)
  g.lineJoin = g.lineCap = 'round'

  const each = (name, fn) => {
    for (const { t, x, y } of got) {
      const layer = t.layers[name]
      if (!layer) continue
      const k = side / layer.extent, dx = x * side - x0, dy = y * side - y0
      for (let i = 0; i < layer.length; i++) {
        const f = layer.feature(i)
        fn(f, () => f.loadGeometry().map((ring) => ring.map((p) => [p.x * k + dx, p.y * k + dy])))
      }
    }
  }
  const trace = (rings) => { g.beginPath(); for (const r of rings) r.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))) }
  const area = (name, color) => each(name, (f, geo) => { if (f.type === 3) { trace(geo()); g.fillStyle = color; g.fill('evenodd') } })
  area('park', c.park)
  area('water', c.water)
  area('building', c.building)
  for (const [extra, color] of [[2, c.edge], [0, c.road]]) {
    each('transportation', (f, geo) => {
      const w = ROAD[f.properties.class]
      if (f.type !== 2 || !w || f.properties.brunnel === 'tunnel') return
      trace(geo()); g.strokeStyle = color; g.lineWidth = w + extra; g.stroke()
    })
  }

  // nomes de rua ao longo do trecho mais longo visível
  g.font = '600 12px Archivo, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const best = new Map()
  each('transportation_name', (f, geo) => {
    const name = f.properties.name
    if (!name || f.type !== 2) return
    for (const line of geo()) {
      for (let i = 1; i < line.length; i++) {
        const [ax, ay] = line[i - 1], [bx, by] = line[i]
        const mx = (ax + bx) / 2, my = (ay + by) / 2, len = Math.hypot(bx - ax, by - ay)
        if (mx < 30 || mx > W - 30 || my < 20 || my > W - 20 || Math.hypot(mx - W / 2, my - W / 2) < 34) continue
        if (!best.has(name) || len > best.get(name).len) best.set(name, { len, mx, my, angle: Math.atan2(by - ay, bx - ax) })
      }
    }
  })
  const placed = []
  for (const [name, s] of [...best].sort((a, b) => b[1].len - a[1].len)) {
    if (placed.length >= 4 || placed.some((p) => Math.hypot(p.mx - s.mx, p.my - s.my) < 70)) continue
    placed.push(s)
    g.save()
    g.translate(s.mx, s.my)
    g.rotate(s.angle > Math.PI / 2 ? s.angle - Math.PI : s.angle < -Math.PI / 2 ? s.angle + Math.PI : s.angle)
    const text = name.replace(/^Avenida /, 'Av. ').replace(/^Rua /, 'R. ').toUpperCase()
    g.lineWidth = 3; g.strokeStyle = c.halo; g.strokeText(text, 0, 0)
    g.fillStyle = c.text; g.fillText(text, 0, 0)
    g.restore()
  }
  return canvas.toDataURL('image/jpeg', 0.86)
}

function snapshot(lat, lon, dark) {
  const key = `${dark}:${lat.toFixed(5)}:${lon.toFixed(5)}`
  if (!cache.has(key)) cache.set(key, draw(lat, lon, dark).catch(() => { cache.delete(key); return '' }))
  return cache.get(key)
}

export default function MapSnippet({ place, theme, symbols, size, style, aspect, onWatch }) {
  const showCover = place.cover && (!size || size >= 80)
  const ref = useRef(null)
  const [src, setSrc] = useState('')
  const [seen, setSeen] = useState(false)
  const [big, setBig] = useState(!size || size >= 120)
  const lat = Number(place.lat), lon = Number(place.lon)
  const dark = theme.tone === 'dark'

  useEffect(() => {
    const el = ref.current
    if (!('IntersectionObserver' in window)) return setSeen(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); setBig(el.offsetWidth >= 120); io.disconnect() } }, { rootMargin: '160px' })
    io.observe(el)
    // aba que quase não desenha (em segundo plano) pode atrasar o aviso: confere a posição depois de um instante
    const t = setTimeout(() => { const r = el.getBoundingClientRect(); if (r.width && r.top < innerHeight + 160 && r.bottom > -160) { setSeen(true); setBig(r.width >= 120) } }, 700)
    return () => { clearTimeout(t); io.disconnect() }
  }, [])
  useEffect(() => {
    let on = true
    setSrc('')
    if (seen) snapshot(lat, lon, dark).then((s) => on && setSrc(s))
    return () => { on = false }
  }, [seen, lat, lon, dark])

  useLibVersion() // redesenha o pino quando os ícones da categoria terminam de carregar
  const cat = catOf(theme, place.category)
  const { n, sym } = symOf(cat, symbols)
  const color = /^#[0-9a-f]{3,8}$/i.test(cat.color) ? cat.color : '#171713'
  const pin = big ? pinHtml({ color: cat.color, shape: theme.shape, n, sym, size: 70, border: true })
    : `<i style="display:block;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></i>`
  return (
    <div ref={ref} className="pph msnip" role={onWatch ? 'group' : 'img'} aria-label={`Localização de ${place.name} no mapa`} style={{ ...(size ? { width: size, height: size } : {}), ...(aspect ? { aspectRatio: aspect } : {}), ...style }}>
      {src && <img src={src} alt="" />}
      <span className="msnip-pin" dangerouslySetInnerHTML={{ __html: pin }} />
      {/* capa do post do criador, no canto, para reconhecer o lugar */}
      {showCover && (onWatch
        ? <button type="button" className="mcover" onClick={onWatch} aria-label={`Assistir ao post sobre ${place.name}`}><img src={place.cover} alt="" loading="lazy" /><i aria-hidden="true">▶</i></button>
        : <span className="mcover"><img src={place.cover} alt="" loading="lazy" /></span>)}
    </div>
  )
}
