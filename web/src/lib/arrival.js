// Regras puras da tela de chegada: o que o criador mais indica, marcas e próximo evento. Os dados vêm do arquivo do mapa.
export const latest = (places, n = 4) => [...places].sort((a, b) => String(b.postedOn || '').localeCompare(String(a.postedOn || '')) || b.id - a.id).slice(0, n)

const top = (places, key, n) => Object.entries(places.reduce((m, p) => { const k = key(p); if (k) m[k] = (m[k] || 0) + 1; return m }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)
export const highlights = (places, categories) => ({
  cats: top(places, (p) => p.category, 4).map(([id, n]) => ({ ...categories.find((c) => c.id === id), n })).filter((c) => c.id),
  hoods: top(places, (p) => p.neighborhood, 3).map(([name, n]) => ({ name, n })),
})

export const safeLink = (u) => (/^https:\/\/[^\s"'<>]+$/i.test(String(u || '')) ? u : null)
// logo de marca: SVG (ou PNG já salvo antes), sempre embutido; é pintado de uma cor só na tela
// além do embutido, aceitamos um logo SVG do Wikimedia Commons ou um arquivo de marca do próprio site
export const safeLogo = (u) => (/^data:image\/(svg\+xml|png);base64,[A-Za-z0-9+/=]+$|^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[A-Za-z0-9_%./-]+\.svg$|^(\/[A-Za-z0-9-]+)?\/sponsors\/[a-z0-9-]+\.(png|svg)$/.test(String(u || '')) ? u : null)
const hidden = (creator, block) => !!creator.theme?.hide?.includes(block)
export const brandsOf = (creator) => (hidden(creator, 'brands') ? [] : creator.brands || []).filter((b) => b && b.name).map((b) => ({ name: String(b.name).slice(0, 40), logo: safeLogo(b.logo), url: safeLink(b.url), ...(b.plate ? { plate: true } : {}) }))
// agenda do criador em ordem de data; o que já passou some sozinho (`event` é o formato antigo, de um só)
export const agendaOf = (creator, today = new Date().toISOString().slice(0, 10)) => (hidden(creator, 'agenda') ? [] : [...(creator.agenda || []), ...(creator.event ? [creator.event] : [])])
  .filter((e) => e && e.title && /^\d{4}-\d{2}-\d{2}$/.test(e.date || '') && e.date >= today)
  .map((e) => ({ title: String(e.title).slice(0, 80), date: e.date, place: String(e.place || '').slice(0, 80), url: safeLink(e.url) }))
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 20)
export const nextEvent = (creator, today) => agendaOf(creator, today)[0] || null
