// Dados de demonstração (fictícios): nomes inventados em bairros reais de São Paulo.
// Usados no mapa público /@demo e nas vitrines da landing. Não são recomendações nem clientes reais.
export const DEMO_SLUG = 'demo'
export const DEMO_PLACES = [
  { id: 1, name: 'Izakaya Exemplo', category: 'rest', neighborhood: 'Liberdade', lat: -23.5588, lon: -46.6354 },
  { id: 2, name: 'Brunch Exemplo', category: 'cafe', neighborhood: 'Pinheiros', lat: -23.5667, lon: -46.6917 },
  { id: 3, name: 'Cantina Exemplo', category: 'rest', neighborhood: 'Bela Vista', lat: -23.5578, lon: -46.6475 },
  { id: 4, name: 'Café Exemplo', category: 'cafe', neighborhood: 'Vila Madalena', lat: -23.5546, lon: -46.6911 },
  { id: 5, name: 'Burger Exemplo', category: 'burger', neighborhood: 'Itaim Bibi', lat: -23.5841, lon: -46.6788 },
  { id: 6, name: 'Doceria Exemplo', category: 'cake', neighborhood: 'Jardins', lat: -23.57, lon: -46.662 },
  { id: 7, name: 'Bar Exemplo', category: 'bar', neighborhood: 'Centro', lat: -23.5505, lon: -46.6333 },
  { id: 8, name: 'Padaria Exemplo', category: 'bread', neighborhood: 'Mooca', lat: -23.5604, lon: -46.5988 },
  { id: 9, name: 'Pizza Exemplo', category: 'pizza', neighborhood: 'Moema', lat: -23.5995, lon: -46.6665 },
  { id: 10, name: 'Tapioca Exemplo', category: 'rest', neighborhood: 'Santa Cecília', lat: -23.537, lon: -46.649 },
  { id: 11, name: 'Ramen Exemplo', category: 'rest', neighborhood: 'Liberdade', lat: -23.5615, lon: -46.6339 },
  { id: 12, name: 'Cafeteria Exemplo', category: 'cafe', neighborhood: 'Paulista', lat: -23.5614, lon: -46.6559 },
  // outras cidades: mostram o filtro de cidades (ids altos para não colidir com os lugares extras do painel de demonstração)
  { id: 21, name: 'Peixaria Exemplo', category: 'rest', neighborhood: 'Gonzaga', municipality: 'Santos', lat: -23.9655, lon: -46.3292 },
  { id: 22, name: 'Doceria da Praia Exemplo', category: 'cake', neighborhood: 'Boqueirão', municipality: 'Santos', lat: -23.9697, lon: -46.3258 },
  { id: 23, name: 'Cafeteria Cambuí Exemplo', category: 'cafe', neighborhood: 'Cambuí', municipality: 'Campinas', lat: -22.8985, lon: -47.0524 },
]
// Horário de funcionamento de exemplo (domingo primeiro). Alguns lugares abrem à noite.
const H = (o, c, ...off) => Array.from({ length: 7 }, (_, d) => (off.includes(d) ? null : [o, c]))
export const DEMO_HOURS = {
  1: H('11:30', '15:00', 1), 2: H('08:00', '17:00'), 3: H('11:00', '23:00'), 4: H('08:00', '19:00', 0), 5: H('11:00', '23:30'),
  6: H('10:00', '20:00'), 7: H('18:00', '02:00', 0, 1), 8: H('06:00', '20:00'), 9: H('18:00', '23:30', 1), 10: H('17:00', '01:00'),
  11: H('11:00', '22:00'), 12: H('07:00', '21:00'), 21: H('11:30', '22:00', 1), 22: H('10:00', '21:00'), 23: H('08:00', '19:00', 0),
}
const PHOTO = { 1: 'sushi', 2: 'brunch', 3: 'massa', 4: 'latte', 5: 'burger', 6: 'bolo', 7: 'drink', 8: 'croissant', 9: 'pizza', 10: 'petisco', 11: 'ramen', 12: 'espresso', 21: 'ostras', 22: 'sobremesa', 23: 'cafe' }
export const demoPlaces = () => DEMO_PLACES.map((p) => ({
  ...p, photo: `${(typeof globalThis !== 'undefined' && globalThis.__WAGLI_BASE__) || ''}/photos/${PHOTO[p.id]}.jpg`, address: 'Endereço ilustrativo (demonstração)', municipality: p.municipality || 'São Paulo', hours: DEMO_HOURS[p.id] || null, geoQuality: 'approx', postUrl: 'https://www.instagram.com/p/exemplo-ilustrativo/', postedOn: null, ad: false, tiktokId: null,
}))
// Mapa público /@demo: os lugares acima e mais os abaixo, com o mesmo visual dos mapas reais (recorte do mapa,
// quadro do vídeo no canto, descrição, categorias extras, nota e contato). Tudo fictício.
// Os ids vão de 24 a 99 para não colidir com o painel de demonstração (13 a 15 e 100 em diante).
const M = (id, name, category, neighborhood, lat, lon, municipality) => ({ id, name: `${name} Exemplo`, category, neighborhood, lat, lon, ...(municipality ? { municipality } : {}) })
export const DEMO_MORE = [
  M(24, 'Trattoria', 'ital', 'Pinheiros', -23.5655, -46.6852), M(25, 'Taqueria', 'mexi', 'Pinheiros', -23.5632, -46.6903),
  M(26, 'Bistrô', 'fren', 'Jardins', -23.5668, -46.6672), M(27, 'Empório Árabe', 'arab', 'Paulista', -23.5702, -46.6458),
  M(28, 'Parrilla', 'arge', 'Itaim Bibi', -23.5868, -46.6812), M(29, 'Sushi Bar', 'japa', 'Liberdade', -23.5572, -46.6348),
  M(30, 'Cozinha Coreana', 'kore', 'Bom Retiro', -23.5262, -46.6402), M(31, 'Dumplings', 'chin', 'Liberdade', -23.5601, -46.6331),
  M(32, 'Ceviche', 'peru', 'Vila Madalena', -23.5561, -46.6871), M(33, 'Feijoada', 'braz', 'Vila Mariana', -23.5893, -46.6346),
  M(34, 'Verde Cozinha', 'veg', 'Vila Mariana', -23.5841, -46.6381), M(35, 'Brunch da Praça', 'brunch', 'Santa Cecília', -23.5389, -46.6512),
  M(36, 'Boteco da Esquina', 'petisco', 'Santana', -23.5009, -46.6262), M(37, 'Padaria Fermento', 'bread', 'Santana', -23.4978, -46.6291),
  M(38, 'Pizzaria Forno', 'pizza', 'Santana', -23.5041, -46.6249), M(39, 'Sorveteria', 'ice', 'Pinheiros', -23.5641, -46.6934),
  M(40, 'Taproom', 'beer', 'Vila Madalena', -23.5538, -46.6932), M(41, 'Adega', 'wine', 'Jardins', -23.5651, -46.6706),
  M(42, 'Coquetelaria', 'drink', 'Centro', -23.5452, -46.6421), M(43, 'Café Livraria', 'books', 'Paulista', -23.5585, -46.6601),
  M(44, 'Galeria', 'art', 'Centro', -23.5468, -46.6376), M(45, 'Mercado', 'market', 'Mooca', -23.5562, -46.6012),
  M(46, 'Praça', 'park', 'Moema', -23.5972, -46.6612), M(47, 'Cantina da Mooca', 'ital', 'Mooca', -23.5581, -46.5951),
  M(48, 'Smash Burger', 'burger', 'Santana', -23.4992, -46.6233), M(49, 'Doceria Fina', 'cake', 'Moema', -23.6031, -46.6628),
  M(50, 'Churrasco', 'meat', 'Tatuapé', -23.5402, -46.5761), M(51, 'Padoca', 'bread', 'Tatuapé', -23.5431, -46.5724),
  M(52, 'Loja de Plantas', 'deco', 'Vila Madalena', -23.5529, -46.6889), M(53, 'Samba e Petisco', 'party', 'Bela Vista', -23.5551, -46.6442),
  M(54, 'Quiosque da Orla', 'sea', 'Gonzaga', -23.9684, -46.3351, 'Santos'), M(55, 'Café do Centro', 'cafe', 'Cambuí', -22.8949, -47.0551, 'Campinas'),
]
export const DEMO_ALL = [...DEMO_PLACES, ...DEMO_MORE]
// por lugar: [quadro do vídeo, categorias extras, descrição]
const DEMO_STORY = {
  1: ['sushi', ['japa'], 'Balcão pequeno, espetinhos na brasa e sushi feito na hora.'], 2: ['brunch', ['brunch'], 'Brunch sem pressa, com pão de fermentação longa.'],
  3: ['massa', ['ital'], 'Massa fresca e mesa grande para almoço de domingo.'], 4: ['latte', ['pet'], 'Latte bem tirado, tomada na mesa e quintal que aceita cachorro.'],
  5: ['burger', [], 'Burger alto, batata crocante e cozinha aberta até tarde.'], 6: ['bolo', ['cafe'], 'Vitrine de doces que muda toda semana.'],
  7: ['drink', ['drink'], 'Balcão antigo no centro, bom para a primeira rodada.'], 8: ['croissant', ['cafe'], 'Pão na chapa e croissant saindo do forno cedo.'],
  9: ['pizza', ['ital'], 'Forno a lenha, massa fina de borda alta.'], 10: ['petisco', ['braz'], 'Tapioca na chapa para fechar a noite.'],
  11: ['ramen', ['japa'], 'Caldo longo e ovo marinado: vale a fila.'], 12: ['espresso', [], 'Expresso de balcão no meio da avenida.'],
  21: ['ostras', ['sea'], 'Peixe do dia e vista para o canal.'], 22: ['sobremesa', ['ice'], 'Doce gelado depois da praia.'], 23: ['cafe', [], 'Café coado e bolo caseiro no Cambuí.'],
  24: ['massa', ['wine'], 'Nhoque às quintas e carta curta de vinhos.'], 25: ['tacos', ['drink'], 'Tacos al pastor e margarita na calçada.'],
  26: ['vieira', ['wine'], 'Menu curto de almoço, com clássicos franceses.'], 27: ['salada', ['veg'], 'Mezze para dividir e esfiha folhada.'],
  28: ['carne', ['meat'], 'Corte no ponto, chimichurri da casa.'], 29: ['sushi2', [], 'Omakase no balcão, com reserva.'],
  30: ['feijoada', [], 'Panelas na mesa e muitos acompanhamentos.'], 31: ['coxinha2', [], 'Guioza na chapa, feita à mão.'],
  32: ['ostras2', ['sea'], 'Ceviche fresco e pisco sour.'], 33: ['feijoada', [], 'Feijoada completa às quartas e sábados.'],
  34: ['salada', ['brunch'], 'Pratos do dia sem carne, bem servidos.'], 35: ['panqueca', ['cafe', 'pet'], 'Panqueca alta na calçada, aceita pet.'],
  36: ['pastel', ['bar'], 'Pastel de feira, cerveja gelada e mesa na rua.'], 37: ['paodequeijo', ['cafe'], 'Pão de queijo grande e sonho de creme.'],
  38: ['pizza2', [], 'Rodízio de bairro que lota na sexta.'], 39: ['sorvete', ['cake'], 'Sabores de fruta da estação.'],
  40: ['drink2', ['bar'], 'Doze torneiras e provinha antes de escolher.'], 41: ['vinho', ['bar'], 'Taça do dia e tábua para dividir.'],
  42: ['drink', ['party'], 'Coquetel autoral e som baixo para conversar.'], 43: ['matcha', ['cafe'], 'Matcha entre as estantes.'],
  44: ['cafe', ['tour'], 'Exposições curtas, entrada gratuita e café na saída.'], 45: ['rua2', ['tour'], 'Bancas para beliscar no sábado de manhã.'],
  46: ['acai', ['pet', 'sport'], 'Sombra, pista de caminhada e açaí na saída.'], 47: ['massa', [], 'Receita de família e porção para três.'],
  48: ['burger2', [], 'Smash com queijo derretido e pão macio.'], 49: ['confeitaria', ['cafe'], 'Torta por fatia e café passado na mesa.'],
  50: ['carne2', ['arge'], 'Costela lenta no fim de semana.'], 51: ['croissant2', [], 'Padaria de esquina com almoço rápido.'],
  52: ['matcha', ['shop'], 'Vasos, mudas e um café no fundo.'], 53: ['coxinha', ['bar', 'braz'], 'Roda de samba aos domingos.'],
  54: ['ostras', [], 'Isca de peixe de frente para o mar.'], 55: ['espresso', ['bread'], 'Parada rápida no caminho.'],
}
const WEEK = [['11:00', '23:00'], null, ['11:00', '23:00'], ['11:00', '23:00'], ['11:00', '23:00'], ['11:00', '00:00'], ['11:00', '00:00']]
const dayAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
export const demoMapPlaces = () => {
  const base = typeof globalThis !== 'undefined' && globalThis.__WAGLI_BASE__ || ''
  const known = new Map(demoPlaces().map((p) => [p.id, p]))
  return DEMO_ALL.map((p, i) => {
    const [frame, tags, about] = DEMO_STORY[p.id]
    const { photo, ...from } = known.get(p.id) || {}
    return {
      address: 'Endereço ilustrativo (demonstração)', municipality: 'São Paulo', geoQuality: 'approx', ad: false, tiktokId: null,
      ...p, ...from, hours: DEMO_HOURS[p.id] || WEEK, postUrl: 'https://www.instagram.com/p/exemplo-ilustrativo/', postedOn: dayAgo(3 + ((i * 11) % DEMO_ALL.length) * 4),
      cover: `${base}/photos/${frame}.jpg`, tags, about, aboutSource: 'editado',
      rating: 4.3 + (p.id % 7) / 10, reviews: 90 + ((p.id * 137) % 1900), ratingDate: dayAgo(10), phone: `(11) 5555-01${String(p.id).padStart(2, '0')}`, website: 'https://example.com',
      ...(p.id % 9 === 0 ? { couponNote: 'Sobremesa de cortesia (exemplo)', couponCode: 'DEMO10' } : {}),
    }
  })
}
// chegada do mapa de demonstração: marcas e evento fictícios (a data fica sempre no futuro)
// logos inventados, de uma cor, só para a demonstração
const logo = (mark, word) => `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40">${mark}<text x="38" y="26" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="700">${word}</text></svg>`)}`
const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
export const demoArrival = () => ({
  brands: [
    { name: 'Aurora (marca fictícia)', logo: logo('<circle cx="18" cy="20" r="13"/>', 'aurora') },
    { name: 'Monte (marca fictícia)', logo: logo('<path d="M4 33 18 7l14 26z"/>', 'MONTE') },
    { name: 'Grão (marca fictícia)', logo: logo('<rect x="6" y="8" width="24" height="24" rx="7"/>', 'grao.co') },
    { name: 'Onda (marca fictícia)', logo: logo('<path d="M3 26q7-16 15 0t15 0v8H3z"/>', 'onda') },
    { name: 'Faísca (marca fictícia)', logo: logo('<path d="M20 4 7 23h9l-3 13 16-21h-10z"/>', 'FAISCA') },
  ],
  agenda: [
    { title: 'Encontro de exemplo (fictício)', date: inDays(12), place: 'Praça Exemplo, São Paulo' },
    { title: 'Feira Gastronômica Exemplo', date: inDays(26), place: 'Pinheiros' },
    { title: 'Visita à Doceria Exemplo', date: inDays(40), place: 'Jardins' },
    { title: 'Festival de Café Exemplo', date: inDays(58), place: 'Santos' },
  ],
})
export const DEMO_BIO = 'Mapa de demonstração da JoyMap: comida, café e passeio em São Paulo. Lugares e nomes são fictícios.'

// Três identidades de demonstração (comida de rua, cafeterias e alta gastronomia).
const cat = (id, name, color, icon) => ({ id, name, color, icon })
// Criadores de demonstração (fictícios): dois casais e um criador solo. Cada um usa um MODELO do estúdio (tpl) e personaliza só o que o painel permite: nome, foto de perfil, bio e cor principal.
export const DEMO_IDENTITIES = [
  { key: 'rua', tpl: 'solar', avatar: 'bia-caio', pool: ['bia-caio-b', 'tacos', 'rua', 'burger2', 'pastel', 'rua2', 'coxinha', 'sorvete', 'tacos2', 'petisco', 'pizza2', 'coxinha2', 'drink2', 'burger', 'crumble', 'feijoada', 'acai'],
    hl: ['Boteco', 'Rua', 'Doces', 'Roteiros', 'Nós'],
    name: 'Bia & Caio', handle: 'biaecaio.come.demo', tagline: 'Casal que come (muito) em São Paulo. Rua, boteco e balcão, sempre a dois.', bio: ['Casal que come muito em São Paulo', 'Rua, boteco e balcão, sempre a dois', 'Parcerias: chama no direct'] },
  { key: 'cafe', tpl: 'doce', avatar: 'duda-lu', pool: ['duda-lu-b', 'latte', 'croissant', 'bolo', 'espresso', 'matcha', 'doce', 'brunch', 'confeitaria', 'paodequeijo', 'cafe', 'croissant2', 'panqueca', 'crumble', 'sorvete'],
    hl: ['Cafés', 'Brunch', 'Doces', 'Nós', 'Dicas'],
    name: 'Duda & Lu', handle: 'dudaelu.cafe.demo', tagline: 'Casal de cafeterias e confeitarias. Um café, uma sobremesa, duas colheres.', bio: ['Casal de cafeterias e confeitarias', 'Um café, uma sobremesa, duas colheres', 'Pauta nova todo fim de semana'] },
  { key: 'noir', tpl: 'noite', avatar: 'rafa', pool: ['rafa-b', 'ostras2', 'carne2', 'vieira', 'sobremesa', 'vinho', 'ostras', 'carne', 'drink', 'massa', 'salada', 'sushi2', 'drink2', 'confeitaria'],
    hl: ['Menus', 'Adegas', 'Omakase', 'Solo', 'Notas'],
    name: 'Rafa à Mesa', handle: 'rafaamesa.demo', tagline: 'Jantar sozinho também é programa. Alta gastronomia, poucas casas e muito critério.', bio: ['Jantar sozinho também é programa', 'Alta gastronomia em São Paulo', 'Reservas e notas de degustação'] },
]
// Grade de perfil realista: repete a seleção do criador em variações (espelhada e com outro enquadramento).
export const profileGrid = (pool, n = 36) => Array.from({ length: n }, (_, i) => { const k = pool[(i * 5 + Math.floor(i / pool.length)) % pool.length]; const v = Math.floor(i / pool.length) % 3; return v === 0 ? k : `${k}:${v === 1 ? 'f' : 'z'}` })
// Seleção ampla e variada para perfis genéricos
export const MIXED_POOL = ['pizza', 'sushi', 'burger', 'bolo', 'tacos', 'croissant', 'drink', 'ramen', 'sorvete', 'latte', 'massa', 'carne', 'salada', 'brunch', 'espresso', 'ostras', 'coxinha', 'panqueca', 'vinho', 'feijoada']

// Roteiros de demonstração (listas de lugares fictícios)
export const DEMO_ROUTES = [
  { id: 1, video: 'https://www.instagram.com/reel/exemplo-ilustrativo/', name: 'Liberdade a pé', note: 'Uma tarde inteira no bairro mais japonês de São Paulo, sem pegar o carro: começa num izakaya pequeno, passa por ruas cheias de lojinhas e termina num ramen de caldo longo. Dá para fazer em três horas, em qualquer dia da semana.', placeIds: [1, 11], stops: [
    { placeId: 1, when: 'Dia 1 · almoço', title: 'Começa pelo izakaya', text: 'Chegue cedo: a casa é pequena e a fila cresce depois das 12h30. Peça os espetinhos para dividir e deixe o sushi para o fim.', tip: 'Sem reserva, vá na abertura.' },
    { placeId: null, when: 'Dia 1 · começo da tarde', title: 'Uma volta pelo bairro', text: 'Sobrou tempo antes do próximo destino? Caminhe pelas ruas ao redor, entre nas lojinhas e deixe a digestão ajudar.', tip: '' },
    { placeId: 11, when: 'Dia 1 · fim da tarde', title: 'Fecha com um ramen', text: 'A poucas quadras dali, o caldo é o forte da casa. Dá para comer em dez minutos ou ficar uma hora conversando.', tip: 'Peça o ovo extra.' },
  ] },
  // Roteiro com produtos (plano Criador em diante): a história leva ao que o criador usa em casa
  { id: 2, name: 'Cafés para ficar mais um pouco', note: 'Três cafés, três jeitos de passar o dia: um brunch lento de sábado em Pinheiros, uma mesa com tomada para trabalhar na Vila Madalena e um expresso de balcão na Paulista, quando a avenida acende. No fim, o que levar para casa.', placeIds: [2, 4, 12], stops: [
    { placeId: 2, when: 'Sábado · 9h40', title: 'Brunch sem pressa', text: 'A fila ainda está só no começo e a mesa grande do fundo está livre: é a que eu sempre peço. Começo pelo pão de fermentação longa com manteiga e um café coado que chega à mesa ainda soltando vapor. A ideia aqui não é correr, é abrir o dia devagar, de conversa em conversa. Esse café eu repito em casa com os grãos que deixei nos produtos, no fim do roteiro.', tip: 'Peça o pão quente com a manteiga da casa e reserve a mesa grande pelo Instagram.' },
    { placeId: 4, when: 'Sábado · 15h', title: 'O café para trabalhar', text: 'Depois do almoço o plano muda: notebook na bolsa e ninguém me chama. Aqui tem tomada em quase toda mesa, a luz da janela bate de lado, sem refletir na tela, e o latte não esfria na primeira meia hora. Foi nessa mesa que escrevi metade dos roteiros deste mapa.', tip: 'Sente perto da janela dos fundos: é onde ficam as tomadas e o silêncio.' },
    { placeId: 12, when: 'Sábado · 18h', title: 'Último café, na Paulista', text: 'A avenida acende enquanto a xícara esfria. Fecho o roteiro aqui, de pé no balcão, vendo o movimento da Paulista virar noite. Um expresso curto, sem açúcar, e a sensação de que o dia rendeu. Se quiser levar um pedaço disso para casa, deixei abaixo o café, o matcha das minhas tardes de trabalho e o kit que uso para fazer o latte na cozinha.', tip: 'Vá perto das 18h: a luz da avenida nessa hora vale o café.' },
  ], products: [
    { title: 'Café especial em grãos · 250 g', url: 'https://example.com/cafe-em-graos', price: 'R$ 52', image: '/photos/espresso.jpg' },
    { title: 'Matcha para preparar em casa · 30 g', url: 'https://example.com/matcha', price: 'R$ 68', image: '/photos/matcha.jpg' },
    { title: 'Kit de latte para fazer em casa', url: 'https://example.com/kit-latte', price: 'R$ 129', image: '/photos/latte.jpg' },
  ] },
  // Roteiro patrocinado (plano Pro), em parceria autorizada com a Visa
  { id: 3, video: 'https://www.instagram.com/reel/exemplo-ilustrativo/', name: 'Uma noite, quatro bairros', note: 'Da primeira rodada no centro à tapioca da madrugada: um roteiro de sexta à noite para quem não tem hora para voltar. Bar, pizza de forno a lenha, sobremesa tarde e um último lanche, em quatro bairros.', placeIds: [7, 9, 6, 10], sponsor: { brand: 'Visa', logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjgwIDQxNiIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJWaXNhIj48cGF0aCBmaWxsPSIjMTMzM2NhIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMTk1IDcgMTEwMSA3IDExMDAgOCAxMDk1IDggMTA4OSAxMCAxMDgxIDE0IDEwNzUgMTkgMTA3MCAyNSAxMDYwIDQzIDEwNTggNTAgMTA1NSA1NSAxMDUzIDYyIDEwNTAgNjcgMTA0OCA3NCAxMDQ1IDc5IDEwNDMgODYgMTA0MCA5MSAxMDM4IDk4IDEwMzUgMTAzIDEwMzMgMTEwIDEwMzAgMTE1IDEwMjggMTIyIDEwMjUgMTI3IDEwMjMgMTM0IDEwMjAgMTM5IDEwMTggMTQ2IDEwMTUgMTUxIDEwMTMgMTU4IDEwMTAgMTYzIDEwMDggMTcwIDEwMDUgMTc1IDEwMDMgMTgyIDEwMDAgMTg3IDk5OCAxOTQgOTk1IDE5OSA5OTMgMjA2IDk5MCAyMTEgOTg4IDIxOCA5ODUgMjIzIDk4MyAyMzAgOTgwIDIzNSA5NzggMjQyIDk3NSAyNDcgOTczIDI1NCA5NzAgMjU5IDk2OCAyNjYgOTY1IDI3MSA5NjMgMjc4IDk2MCAyODMgOTU4IDI5MCA5NTUgMjk1IDk1MyAzMDIgOTUwIDMwNyA5NDggMzE0IDk0NSAzMTkgOTQzIDMyNiA5NDAgMzMxIDkzOCAzMzggOTM1IDM0MyA5MzMgMzUwIDkzMCAzNTUgOTI4IDM2MiA5MjUgMzY3IDkyNSAzNjkgOTIwIDM3OSA5MjAgMzgxIDkxNSAzOTEgOTE1IDM5MyA5MDkgNDA3IDEwMTYgNDA3IDEwMTkgNDAxIDEwMjYgMzc4IDEwMjggMzc1IDEwMzUgMzUyIDEwMzggMzQ3IDExNzAgMzQ3IDExNzMgMzU2IDExNzMgMzYwIDExNzQgMzYxIDExNzUgMzcwIDExNzcgMzc1IDExNzcgMzc5IDExNzggMzgwIDExNzggMzg0IDExODEgMzk0IDExODMgNDA3IDEyNzggNDA3Wk0xMTIyIDExNSAxMTI0IDEyMCAxMTI0IDEyNCAxMTI1IDEyNSAxMTI4IDE0MyAxMTMwIDE0OCAxMTMyIDE2MiAxMTM0IDE2NyAxMTM1IDE3NiAxMTM3IDE4MSAxMTM4IDE5MCAxMTQwIDE5NSAxMTQxIDIwNCAxMTQzIDIwOSAxMTQ0IDIxOCAxMTQ2IDIyMyAxMTQ3IDIzMiAxMTQ5IDIzNyAxMTUwIDI0NiAxMTUxIDI0NyAxMTUzIDI2MCAxMTU1IDI2NSAxMTU0IDI2NiAxMDY5IDI2NiAxMDY4IDI2MyAxMDc3IDI0MCAxMDgwIDIyOSAxMDgyIDIyNiAxMDg1IDIxNSAxMDg3IDIxMiAxMDk0IDE5MCAxMTAwIDE3NiAxMTAzIDE2NSAxMTA1IDE2MiAxMTA4IDE1MSAxMTE0IDEzNyAxMTE3IDEyNlpNNjMyIDcgNTMwIDcgNDQ1IDQwNyA1NDggNDA3IDU0OCA0MDMgNTUwIDM5OCA1NTIgMzg0IDU1MyAzODMgNTU1IDM3MCA1NTcgMzY1IDU1OSAzNTEgNTYxIDM0NiA1NjMgMzMyIDU2NCAzMzEgNTY2IDMxOCA1NjggMzEzIDU3MCAyOTkgNTcxIDI5OCA1NzMgMjg1IDU3NSAyODAgNTc3IDI2NiA1NzkgMjYxIDU4MSAyNDcgNTgyIDI0NiA1ODQgMjMzIDU4NiAyMjggNTg4IDIxNCA1OTAgMjA5IDU5MiAxOTUgNTkzIDE5NCA1OTUgMTgxIDU5NyAxNzYgNTk5IDE2MiA2MDAgMTYxIDYwMiAxNDggNjA0IDE0MyA2MDYgMTI5IDYwOCAxMjQgNjEwIDExMCA2MTEgMTA5IDYxMyA5NiA2MTUgOTEgNjE3IDc3IDYxOSA3MiA2MTkgNjggNjIyIDU4IDYyMiA1NCA2MjMgNTMgNjI0IDQ0IDYyNiAzOSA2MjYgMzUgNjI3IDM0IDYyNyAzMCA2MzAgMjBaTTMgNyAxIDE5IDggMjAgMTMgMjIgMTcgMjIgMTggMjMgMjkgMjUgMzMgMjcgMzYgMjcgNDAgMjkgNDMgMjkgODUgNDQgOTggNTAgMTA5IDU3IDExOSA2OCAxMjMgNzYgMTI2IDg1IDEyNyA5MiAxMjkgOTYgMTMzIDExNSAxMzUgMTE5IDE0MCAxNDIgMTQyIDE0NiAxNDcgMTY5IDE0OSAxNzMgMTU0IDE5NiAxNTYgMjAwIDE2MSAyMjMgMTYzIDIyNyAxNjggMjUwIDE3MCAyNTQgMTc1IDI3NyAxNzcgMjgxIDE4MSAzMDAgMTgzIDMwNCAxODggMzI3IDE5MCAzMzEgMTkwIDMzNCAxOTEgMzM1IDE5NSAzNTQgMTk3IDM1OCAxOTcgMzYxIDE5OCAzNjIgMTk4IDM2NSAxOTkgMzY2IDIwMiAzODEgMjA0IDM4NSAyMDkgNDA3IDMxOCA0MDcgNDg1IDcgMzc3IDcgMzc3IDkgMzY5IDI3IDM2OCAzMiAzNTIgNzAgMzUxIDc1IDMzNSAxMTMgMzM0IDExOCAzMTggMTU2IDMxNyAxNjEgMzAxIDE5OSAzMDAgMjA0IDI4NCAyNDIgMjgzIDI0NyAyODEgMjUwIDI3MSAyNzcgMjY5IDI3OSAyNjcgMjczIDI2NyAyNjggMjY2IDI2NyAyNjYgMjYzIDI2NSAyNjIgMjY1IDI1OCAyNjMgMjUyIDI2MyAyNDcgMjYyIDI0NiAyNjIgMjQyIDI2MSAyNDEgMjYxIDIzNyAyNTkgMjMxIDI1OSAyMjYgMjU4IDIyNSAyNTggMjIxIDI1NiAyMTUgMjU2IDIxMCAyNTUgMjA5IDI1NSAyMDUgMjU0IDIwNCAyNTQgMjAwIDI1MiAxOTQgMjUyIDE4OSAyNTEgMTg4IDI1MSAxODQgMjUwIDE4MyAyNTAgMTc5IDI0OCAxNzMgMjQ4IDE2OCAyNDcgMTY3IDI0NyAxNjMgMjQ2IDE2MiAyNDYgMTU4IDI0NCAxNTIgMjQ0IDE0NyAyNDMgMTQ2IDI0MyAxNDIgMjQyIDE0MSAyNDIgMTM3IDI0MCAxMzEgMjQwIDEyNiAyMzkgMTI1IDIzOSAxMjEgMjM4IDEyMCAyMzggMTE2IDIzNiAxMTAgMjM2IDEwNSAyMzUgMTA0IDIzNSAxMDAgMjM0IDk5IDIzNCA5NSAyMzIgODkgMjMyIDg0IDIzMSA4MyAyMzEgNzkgMjMwIDc4IDIzMCA3NCAyMjggNjggMjI4IDYzIDIyNyA2MiAyMjQgNDMgMjIxIDM0IDIxNCAyMyAyMDUgMTUgMTk1IDEwIDE4OCA4IDE4MyA4IDE4MiA3Wk05MzIgMTggOTE1IDEyIDkxMiAxMiA5MDggMTAgODk2IDggODkxIDYgODg2IDYgODg1IDUgODc0IDQgODczIDMgODY2IDMgODY1IDIgODU2IDIgODU1IDEgODEzIDEgODEyIDIgODAzIDIgODAyIDMgNzg0IDUgNzU1IDEzIDczMiAyMyA3MzAgMjUgNzIwIDMwIDcwNiA0MCA2OTcgNDggNjg3IDU5IDY3OCA3MiA2NzIgODMgNjcyIDg1IDY2NyA5NiA2NjcgOTkgNjY1IDEwMyA2NjQgMTExIDY2MyAxMTIgNjYzIDExOCA2NjIgMTE5IDY2MiAxNDcgNjYzIDE0OCA2NjMgMTUzIDY2OCAxNjkgNjc5IDE4OCA2ODQgMTk0IDcwMSAyMTAgNzE4IDIyMiA3MzMgMjMxIDc0MCAyMzQgNzQyIDIzNiA3NjkgMjUwIDc5MCAyNjQgNzk5IDI3MyA4MDMgMjc5IDgwMyAyODEgODA1IDI4NCA4MDUgMjk3IDgwMCAzMDggNzg3IDMyMCA3NzIgMzI3IDc2OSAzMjcgNzYwIDMzMCA3NTQgMzMwIDc1MyAzMzEgNzIzIDMzMSA3MjIgMzMwIDcxNCAzMzAgNzEzIDMyOSA3MDcgMzI5IDcwNiAzMjggNjk2IDMyNyA2NjUgMzE4IDY0OCAzMTAgNjQ2IDMxMCA2MzggMzA1IDYzNiAzMTAgNjM1IDMxOSA2MzMgMzI0IDYzMiAzMzMgNjMwIDMzOCA2MjkgMzQ3IDYyNyAzNTIgNjI3IDM1NiA2MjYgMzU3IDYyNiAzNjEgNjI1IDM2MiA2MjUgMzY2IDYyMyAzNzEgNjIzIDM3NSA2MjIgMzc2IDYyMiAzODAgNjIxIDM4MSA2MTkgMzkyIDY1MSA0MDMgNjYzIDQwNSA2NjggNDA3IDY3MiA0MDcgNjczIDQwOCA2NzcgNDA4IDY3OCA0MDkgNjg5IDQxMCA2OTAgNDExIDcwNiA0MTIgNzA3IDQxMyA3MTkgNDEzIDcyMCA0MTQgNzUxIDQxNCA3NTIgNDEzIDc3MyA0MTIgNzc0IDQxMSA3ODUgNDEwIDc4NiA0MDkgODAzIDQwNiA4MjkgMzk3IDg1NyAzODIgODY5IDM3MyA4ODUgMzU3IDg5NSAzNDMgOTAyIDMzMCA5MDIgMzI4IDkwNSAzMjMgOTA4IDMxNCA5MTAgMzAyIDkxMSAzMDEgOTEyIDI4NSA5MTMgMjg0IDkxMyAyNzEgOTEyIDI3MCA5MTIgMjYxIDkxMSAyNjAgOTEwIDI1MSA5MDUgMjM3IDg5OCAyMjQgODg3IDIxMCA4NzIgMTk2IDg0OSAxODAgODAyIDE1NSA3ODYgMTQ1IDc3NCAxMzQgNzY5IDEyNSA3NjggMTE1IDc3MiAxMDUgNzg1IDkzIDc5OCA4NyA4MTAgODUgODExIDg0IDgxOCA4NCA4MTkgODMgODQyIDgzIDg0MyA4NCA4NTIgODQgODUzIDg1IDg2NSA4NiA4NjYgODcgODcwIDg3IDg3MSA4OCA4ODIgOTAgODg2IDkyIDg4OSA5MiA4OTIgOTQgOTAzIDk3IDkxNCAxMDJaIi8+PC9zdmc+' }, stops: [
    { placeId: 7, when: 'Sexta · 19h', title: 'Começa no centro', text: 'Este roteiro foi feito em parceria com a Visa. A noite começa quando os escritórios esvaziam e o bar enche aos poucos. Peço a primeira rodada no balcão e deixo o resto sem horário: é aqui que a noite escolhe para onde vai.', tip: 'Pague a primeira rodada no balcão para não perder a mesa.' },
    { placeId: 9, when: 'Sexta · 21h', title: 'Pizza que sai em dois minutos', text: 'O forno é a lenha, a massa é fina de borda alta e a primeira fatia some antes de a conversa recomeçar. Dividi com três amigos e ainda sobrou espaço para o resto da noite, que era o plano.', tip: 'Peça meio a meio: dá para provar dois sabores sem briga.' },
    { placeId: 6, when: 'Sexta · 23h', title: 'Sobremesa tarde, que vale mais', text: 'A vitrine ainda está cheia e a mousse de chocolate com sal é a que entra em todo roteiro meu. Comer doce depois da meia-noite tem outro sabor, e aqui ninguém olha o relógio.', tip: 'Os doces de vitrine acabam por volta de 23h30.' },
    { placeId: 10, when: 'Sábado · 1h', title: 'Fecha com uma tapioca', text: 'Final de noite honesto: tapioca na chapa, queijo coalho derretendo e a rua ainda acesa. Pago a conta, volto a pé até o carro e a noite termina do jeito que começou, sem pressa.', tip: 'Leve dinheiro trocado: a chapa é pequena e o caixa é simples.' },
  ] },
  { id: 4, name: 'Padarias para o café de domingo', note: 'Três fornadas em três bairros, para escolher a sua.', placeIds: [37, 8, 51], stops: [
    { placeId: 37, when: 'Domingo · 8h', title: 'Santana primeiro', text: 'O pão de queijo sai grande e quente logo cedo.', tip: 'Vá antes das 9h.' },
    { placeId: 8, when: 'Domingo · 10h', title: 'Croissant na Mooca', text: 'Pão na chapa para quem chegou com fome.', tip: '' },
    { placeId: 51, when: 'Domingo · 12h', title: 'Almoço de esquina', text: 'Fecha com o prato do dia no Tatuapé.', tip: '' },
  ] },
  { id: 5, name: 'Sexta em Pinheiros e Vila Madalena', note: 'Tacos, torneiras de chope e sorvete, tudo perto.', placeIds: [25, 40, 39], stops: [
    { placeId: 25, when: '19h', title: 'Tacos na calçada', text: 'Comece leve, dividindo.', tip: '' },
    { placeId: 40, when: '21h', title: 'Doze torneiras', text: 'Peça a provinha antes de escolher.', tip: '' },
    { placeId: 39, when: '23h', title: 'Sorvete para voltar a pé', text: 'Os sabores da estação acabam primeiro.', tip: '' },
  ] },
]

// no mapa do fundador não há patrocínio: são marcas que ele admira, só com o logo numa cor
const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/'
export const ownerArrival = () => ({
  ...demoArrival(),
  brandsTitle: 'Marcas que admiro',
  brands: [
    { name: 'Columbia', logo: `${COMMONS}c/c2/Columbia_Sportswear_Co_logo.svg` },
    { name: 'Makita', logo: `${COMMONS}7/71/Makita_Logo.svg`, plate: true }, // letras brancas numa placa: não dá para pintar pela silhueta
    { name: 'Xisto Outdoor', logo: '/sponsors/xisto.svg' },
    { name: 'Bolovo' }, // falta o arquivo do logo
  ],
})
