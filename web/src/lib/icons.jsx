import { libHtml, libIcon, useLibVersion } from '../iconlib.js'
import React from 'react'

// Conjunto de ícones do protótipo (traço 2px, 24x24).
const android = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
export const ICON_PATHS = {
  pin: 'M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  rest: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10',
  cafe: 'M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8zM17 9h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2',
  bar: 'M4 4h16l-8 9-8-9zM12 13v7M8 20h8',
  bread: 'M5 10a4 4 0 0 1 0-6h14a4 4 0 0 1 0 6v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z',
  cake: 'M4 20h16M5 20v-7h14v7M12 13V8M12 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  pizza: 'M12 3 3 19a14 14 0 0 0 18 0L12 3zM9 12h.01M14 14h.01M12 8h.01',
  fish: 'M3 12c3-5 8-6 12-3l6-2-1 5 1 5-6-2c-4 3-9 2-12-3zM16 11h.01',
  burger: 'M4 11a8 8 0 0 1 16 0H4zM3 15h18M5 15c0 3 1 4 3 4h8c2 0 3-1 3-4',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',
  search: 'M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z',
  check: 'M20 6 9 17l-5-5',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  // cada aparelho vê o compartilhar que já conhece: três pontos ligados no Android, seta saindo da caixa no resto
  share: android ? 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4' : 'M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5',
  play: 'M8 5v14l11-7z',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12h2M3 12h2M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-5-4-11-8-11zM7.5 11h.01M10 7h.01M15 7h.01',
  layers: 'M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6',
  ext: 'M14 4h6v6M20 4 10 14M18 14v5H5V6h5',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  flag: 'M5 21V4h12l-2 4 2 4H5',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2M14 18h2v2h4v-2',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  back: 'M15 18l-6-6 6-6',
  next: 'M9 6l6 6-6 6',
  down: 'M6 9l6 6 6-6',
  caretup: 'M6 15l6-6 6 6',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  insta: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 6.5h.01',
  tiktok: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  card: 'M3 6h18v12H3zM3 10h18',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  down2: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  up: 'M12 15V3M7 8l5-5 5 5M5 21h14',
  copy: 'M9 9h11v11H9zM5 15V4h11',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4',
  drag: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  home: 'M4 11l8-7 8 7v9H4z',
  store: 'M4 9l1-5h14l1 5M4 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 4 0M5 12v8h14v-8',
  alert: 'M12 4l9 16H3L12 4zM12 10v4M12 17h.01',
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zM9 3v15M15 6v15',
}
export const FLAGX = ICON_PATHS.alert

// `sym` = símbolo próprio aprovado { d, vb, mode }. Sem `sym`, usa o ícone `n` do conjunto.
export function Icon({ n = 'pin', s = 24, c = '#171717', sym: sym0 }) {
  useLibVersion()
  const lib = sym0 && sym0.lib ? libIcon(sym0.lib) : null
  const sym = sym0 && sym0.d ? sym0 : null
  if (lib) return <span style={{ display: 'inline-flex', lineHeight: 0 }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: libHtml(lib, s, c, 2) }} />
  const fill = sym && sym.mode === 'fill'
  return (
    <span style={{ display: 'inline-flex', lineHeight: 0 }}>
      <svg width={s} height={s} viewBox={sym ? sym.vb : '0 0 24 24'} aria-hidden="true" style={{ display: 'block', fill: fill ? c : 'none', stroke: fill ? 'none' : c, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
        <path d={sym ? sym.d : ICON_PATHS[n] || ICON_PATHS.pin} />
      </svg>
    </span>
  )
}
