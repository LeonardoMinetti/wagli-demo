// RoteirosJoy da demonstração: são os roteiros do próprio mapa de demonstração, para o cartão abrir o mesmo roteiro que anuncia.
const COVER_5 = 'https://commons.wikimedia.org/wiki/Special:FilePath/Vale%20do%20Corisco%20com%20a%20Cachoeira%20do%20Corisco%20ao%20fundo.jpg?width=960'
const g = (id, name, note, photo, city, count, color) => ({ id, name, note, by: 'Criador Demo', handle: 'criador_demo', avatar: null, photo, city, count, color, featured: true, href: `/@demo/roteiros/${id}` })
export const DEMO_GUIDES = [
  g(1, 'Cafés para ficar um tempo', 'Para um sábado sem pressa, um café de cada vez.', 'latte', 'São Paulo', 4, '#FF4B2B'),
  g(2, 'Pão e doce de fim de semana', 'Padarias e doces para começar bem o dia.', 'croissant', 'São Paulo', 4, '#EC4899'),
  g(3, 'Noite de bar', 'Para encontrar os amigos depois do trabalho.', 'drink', 'São Paulo', 4, '#2D7FF9'),
  g(4, 'Pizza e massa', 'Para o jantar que pede mesa cheia.', 'pizza', 'São Paulo', 4, '#8B5CF6'),
  g(5, 'Entre cânions e cachoeiras', 'Quatro dias de estrada até os Campos Gerais do Paraná. Parceria ilustrativa com uma marca fictícia.', COVER_5, 'Paraná', 9, '#36C5A0'),
]
