import React, { useMemo } from 'react'
import DeskAscend from '../pub/DeskAscend.jsx'
import { pubVars, useFilters } from '../pub/shared.jsx'
import { applyTemplate, TEMPLATES } from '../theme.jsx'
import { DEMO_IDENTITIES, DEMO_ROUTES, demoArrival, demoPlaces } from '../demoData.js'

// A mesma tela pública que os seguidores abrem no celular (mapa + folha inferior, componente real do app), alimentada com dados de demonstração.
const LAYOUT = { blocks: [{ id: 'header', on: true }, { id: 'links', on: false }, { id: 'filters', on: true }, { id: 'map', on: true }, { id: 'list', on: true }, { id: 'routes', on: false }], mapHeight: 'lg', listStyle: 'grid', cover: false }
const BASE = { accent: '#FFC400', bg: '#FFFFFF', fg: '#171713', font: 'sans', radius: 16, contrastAuto: true, tone: 'light', shape: 'circle', pinSize: 90, pinBorder: true, cluster: false, selected: 'pulse', mapLabels: false, labelDensity: 40, start: 'pick', startView: { lat: -23.5614, lon: -46.6559, zoom: 12.5 }, linkStyle: 'fill', social: { instagram: false, tiktok: false }, bio: '', layout: LAYOUT, categories: [] }
export const makeTheme = (p) => ({ ...BASE, ...p, layout: { ...LAYOUT, ...(p.layout || {}) } })
export const DEMO_CATS = [
  { id: 'rest', name: 'Restaurantes', color: '#FF4B2B', icon: 'lib:fluent3d:fork-and-knife-with-plate' }, { id: 'cafe', name: 'Cafés', color: '#A16207', icon: 'lib:fluent3d:hot-beverage' }, { id: 'bar', name: 'Drinks', color: '#7C3AED', icon: 'lib:fluent3d:cocktail-glass' },
  { id: 'bread', name: 'Padarias', color: '#F59E0B', icon: 'lib:fluent3d:croissant' }, { id: 'cake', name: 'Doces', color: '#EC4899', icon: 'lib:fluent3d:birthday-cake' }, { id: 'pizza', name: 'Pizza', color: '#DC2626', icon: 'lib:fluent3d:pizza' },
  { id: 'fish', name: 'Japonês', color: '#2D7FF9', icon: 'lib:fluent3d:sushi' }, { id: 'burger', name: 'Lanches', color: '#EA580C', icon: 'lib:fluent3d:hamburger' },
]
export const DEMO_THEME = makeTheme({ categories: DEMO_CATS, bio: 'Restaurantes, cafés e achados de São Paulo.' })
// tema de cada identidade de demonstração
// Modelo do estúdio + o que o criador edita (bio e, se quiser, a cor principal). Nada fora do que o painel oferece.
export const identityTheme = (id) => makeTheme({ ...applyTemplate(DEMO_THEME, TEMPLATES.find((x) => x.id === id.tpl)), bio: id.tagline, ...(id.accent ? { accent: id.accent } : {}) })
export const PLACES = demoPlaces()

const NONE = { ids: [], toggle: () => {} }
const CTX = { saved: NONE, track: () => {}, video: () => {}, share: () => {}, report: () => {} }
// view: 'list' (cartões), 'map' (mapa com os pins) ou 'sobre'
export function PubPreview({ name = 'Sabor da Cidade', handle = 'sabordacidade.demo', avatarUrl, theme = DEMO_THEME, places = PLACES, shown, view = 'list' }) {
  const visible = shown || places
  // como no mapa publicado: o cartão mostra o recorte do mapa e a capa do post no canto, sem foto grande
  const list = useMemo(() => visible.map((p) => ({ ...p, cover: p.cover || p.photo, photo: null, about: p.about || 'Indicação de exemplo: o que pedir, quando ir e por que vale a visita.' })), [visible])
  const data = useMemo(() => ({ creator: { displayName: name, handle, avatarUrl, slug: 'demo', theme, links: [], symbols: {}, cover: false, tiktok: null, demo: true, ...demoArrival() }, places: list, routes: DEMO_ROUTES, fixedView: theme.startView }), [name, handle, avatarUrl, theme, list])
  const f = useFilters(list, { preview: true })
  return <div className="lpv lpv-new"><div className="pub preview" style={pubVars(theme)}><DeskAscend key={view} data={data} slug="demo" ctx={CTX} f={f} mobile preview initialTab={view === 'sobre' ? 'sobre' : 'lugares'} initialShowMap={view === 'map'} initialRoute={view === 'rota' ? DEMO_ROUTES[0].id : null} /></div></div>
}
export { DEMO_IDENTITIES }

export const PLACES6 = [9, 5, 3, 6, 7, 1].map((id) => PLACES.find((q) => q.id === id))
const VIEW = { lat: -23.572, lon: -46.65, zoom: 12.6 }
export const MAP_THEME = makeTheme({ ...DEMO_THEME, start: 'pick', startView: VIEW, pinSize: 100 })
export const withView = (t) => makeTheme({ ...t, start: 'pick', startView: VIEW, pinSize: 100 })
