import React, { useState } from 'react'
import { Link } from '../lib/router.jsx'
import { withBase } from '../lib/base.js'
import { Icon } from '../lib/icons.jsx'
import { num } from '../theme.jsx'
import { Switch } from '../lib/ui.jsx'
import { Scene } from './motion.jsx'
import { Floaters } from './doodles.jsx'
import { FAQ } from './faq.js'
import { Phone, Native } from './device.jsx'
import { PubPreview, MAP_THEME } from './pubpreview.jsx'

const em = (n) => ({ lib: `lib:fluent3d:${n}` })
const hl = { background: 'linear-gradient(transparent 60%, var(--hl, var(--acc)) 60%)', padding: '0 4px' }

// Seção 09 · Controle e confiança
const PRINCIPLES = [
  'Você revisa e aprova cada recomendação antes de publicar.', 'Não é necessário compartilhar a senha das suas redes sociais.',
  'O JoyMap não lê mensagens, listas de seguidores nem comentários.', 'O painel usa informações agregadas, sem identificar pessoas.',
  'Você decide se quer participar do mapa geral.', 'Você decide, separadamente, se quer compartilhar informações com restaurantes.',
  'Consentimentos são independentes e revogáveis.', 'Participações adicionais ficam desativadas por padrão.',
]
export function Trust() {
  const [geral, setGeral] = useState(false)
  const [rest, setRest] = useState(false)
  return (
    <section className="sec" aria-labelledby="conf" style={{ background: 'var(--cream)' }}>
      <div className="w split" style={{ gap: 56, alignItems: 'center' }}>
        <div className="col" style={{ flex: 1.1, gap: 22, minWidth: 0 }}>
          <div className="sec-h"><span className="eb">Controle e confiança</span><h2 id="conf" className="d h-sec">Seu conteúdo. Sua marca. <span style={hl}>Suas decisões.</span></h2></div>
          <ul className="tr-l">{PRINCIPLES.map((t) => <li key={t}><i aria-hidden="true"><Icon n="check" s={12} c="#171713" /></i>{t}</li>)}</ul>
          <p className="xs mut">Os textos legais (termos e privacidade) ainda passam por revisão jurídica.</p>
        </div>
        <div className="tr-card" style={{ flex: 1 }}>
          <div className="row jb"><b className="d s20">Privacidade e consentimentos</b><span className="tag wn">Demonstração</span></div>
          <div className="tr-row"><div className="sp"><b>Aprovar cada recomendação</b><span>Nada é publicado sem a sua revisão.</span></div><span className="tr-always">Sempre</span></div>
          <div className="tr-row"><div className="sp"><b>Participar do mapa geral</b><span>Opcional e independente. Desativado por padrão.</span></div><Switch on={geral} onChange={setGeral} label="Participar do mapa geral" /></div>
          <div className="tr-row"><div className="sp"><b>Compartilhar dados agregados com restaurantes</b><span>Decisão separada e revogável. Desativado por padrão.</span></div><Switch on={rest} onChange={setRest} label="Compartilhar dados agregados com restaurantes" /></div>
          <p className="xs mut">Experimente: cada opção muda sozinha e pode ser desfeita a qualquer momento.</p>
        </div>
      </div>
    </section>
  )
}

// Seção 10 · Monetização (visão futura): cartas de roteiros, sobrepostas como um baralho
const GUIDES = [
  { t: 'Izakayas da Liberdade', d: 'Roteiro a pé pelos melhores izakayas do bairro, com o que pedir em cada parada.', bg: 'var(--acc)', fg: 'var(--ink)', photos: ['sushi', 'sushi2', 'ramen'], more: 7, r: -5 },
  { t: 'Fim de semana na serra', d: 'Onde ficar, o que ver e onde comer em dois dias de estrada, organizado por dia.', bg: 'var(--ink)', fg: '#fff', icons: ['mountain', 'tent', 'automobile'], more: 6, r: 2.5 },
  { t: 'Trilhas e passeios perto de SP', d: 'Trilhas, mirantes e passeios ao ar livre, com o ponto de partida e a duração de cada um.', bg: '#E4E4E4', fg: 'var(--ink)', icons: ['bicycle', 'compass', 'beach-with-umbrella'], more: 5, r: -2 },
  { t: 'Um bairro, um roteiro', d: 'Roteiro por determinado bairro, em blocos para fazer a pé.', bg: '#A5DFCA', fg: 'var(--ink)', photos: ['pizza', 'burger', 'tacos'], more: 8, r: 4 },
]
export function Monetize() {
  return (
    <section className="sec" aria-labelledby="mon" style={{ background: '#fff', overflow: 'hidden' }}>
      <div className="w col" style={{ gap: 36 }}>
        <div className="sec-h"><span className="eb">Roteiros e monetização</span><h2 id="mon" className="d h-sec">Suas recomendações também podem virar um negócio.</h2>
          <p className="lead">Transforme seu repertório de lugares em roteiros exclusivos, guias digitais e seleções que sua audiência poderá adquirir diretamente de você.</p></div>
        <Scene className="gd" threshold={0.3}>
          {GUIDES.map((g, i) => (
            <article key={g.t} className="gd-c" style={{ '--i': i, '--r': `${g.r}deg`, background: g.bg, color: g.fg }}>
              <span className="gd-ex">Exemplo</span>
              <div className="gd-top"><h3>{g.t}</h3><Icon n="next" s={22} c="currentColor" /></div>
              <div className="gd-av" aria-hidden="true">{g.photos ? g.photos.map((k) => <img key={k} src={withBase(`/photos/${k}.jpg`)} alt="" loading="lazy" decoding="async" />) : g.icons.map((k) => <span key={k} className="gd-em"><Icon s={32} sym={em(k)} /></span>)}<b>+{g.more}</b></div>
              <hr />
              <p>{g.d}</p>
            </article>))}
        </Scene>
        <div className="rt-now">
          <div className="col" style={{ gap: 14 }}>
            <h3 className="d s32">Como um roteiro aparece no mapa</h3>
            <ul className="tr-l">{['Paradas em ordem, por dia e horário', 'Linha do tempo ou lista, como o seguidor preferir', 'O trajeto desenhado no mapa', 'Um botão para levar o roteiro ao Google Maps', 'Parcerias sempre identificadas, com o logo da marca'].map((t) => <li key={t}><i aria-hidden="true"><Icon n="check" s={12} c="#171713" /></i>{t}</li>)}</ul>
            <p className="xs mut">Roteiros fazem parte dos planos Criador e Pro, e parcerias do Pro, ambos em breve. A venda ainda não está disponível. Roteiros, nomes e quantidades desta seção são exemplos, sem valores definidos.</p>
          </div>
          <Phone h={560} label="Um roteiro aberto no mapa de demonstração"><Native h={560} theme={MAP_THEME}><PubPreview theme={MAP_THEME} view="rota" /></Native></Phone>
        </div>
      </div>
    </section>
  )
}

// Seção 11 · Planos e condições de entrada
// Valores do plano de negócio: hipóteses a validar no período de testes. Nenhuma cobrança está ativa.
// Cada item é [texto, explicação opcional (ícone ?), oculto?]. `oculto` tira da página sem apagar.
const T = {
  recent: 'O mapa mostra os lugares dos posts mais recentes. O histórico completo é dos planos pagos.',
  manual: 'Você cola o link e a legenda de cada post, ou busca o lugar, e revisa tudo antes de publicar.',
  brand: 'Nos planos Grátis e Criador, um selo "Mapa feito com JoyMap" aparece no rodapé da sua página pública. No Pro, ele some.',
  full: 'Todos os lugares que você já indicou entram no mapa, não só os dos posts recentes.',
  auto: 'Seus posts novos entram sozinhos no mapa, depois que você conecta a conta. Depende das integrações oficiais das plataformas, que ainda estão sendo liberadas.',
  limite: 'No plano Grátis o mapa tem até 20 lugares. Nos planos pagos não há limite.',
  studio: 'Cores, fonte, categorias, pins e símbolos do seu mapa. No plano Grátis, o mapa usa o tema padrão do JoyMap (Solar, com cor principal preta).',
  panel: 'Mostra o que o seu público busca no mapa, inclusive o que não encontrou, e quais lugares são abertos e geram pedido de rota. Sempre em números agregados, sem identificar pessoas.',
  roteiro: 'Você cria roteiros com paradas e história. Cada um pode ficar grátis ou ser vendido, e a JoyMap cobra uma taxa só sobre as vendas.',
  produto: 'Coloque o link de um produto, como uma mochila ou um guia, dentro de um roteiro, para o seguidor ver e abrir.',
  patrocinado: 'Faça um roteiro em parceria com uma marca. Ele aparece com a etiqueta "Roteiro patrocinado" e o logo da marca no cartão, para o seguidor saber que é parceria.',
  dominio: 'O seu mapa pode abrir num domínio seu, como mapa.seunome.com.br.',
  categorias: 'No Pro você cria as suas categorias, além das que o JoyMap já oferece.',
  visits: 'Total de visitas ao seu mapa, sem o detalhe de buscas e cliques.',
}
const PLANS = [
  { k: 'free', icon: 'round-pushpin', name: 'Grátis', price: ['R$ 0', 'R$ 0'], per: 'para sempre', who: 'Para quem quer engajar o público, sem vender nada.', trial: false,
    items: [['Até 20 lugares no mapa', T.limite], ['Posts recentes no mapa', T.recent], ['Você adiciona e atualiza os lugares manualmente', T.manual], ['Tema padrão do JoyMap, sem Estúdio de estilo', T.studio], ['Visitas totais no painel', T.visits]] },
  { k: 'creator', icon: 'trophy', name: 'Criador', price: ['R$ 39,90', 'R$ 399'], per: ['por mês', 'por ano'], note: 'No anual, 2 meses grátis.', who: 'Para quem quer o mapa completo, sempre em dia.', trial: true, main: true,
    items: [['Mapa completo, com todo o histórico', T.full], ['Atualização automática do mapa, a partir dos seus posts', T.auto], ['Estúdio de estilo completo', T.studio], ['Painel com buscas, buscas sem resultado, lugares abertos e cliques em rota', T.panel], ['Criação de roteiros que podem ser vendidos, com taxa de 8% por venda', T.roteiro], ['Produtos nos seus roteiros', T.produto]] },
  { k: 'pro', icon: 'crown', name: 'Pro', price: ['R$ 79', 'R$ 790'], per: ['por mês', 'por ano'], note: 'No anual, 2 meses grátis.', who: 'Para quem vende roteiros e quer a marca própria.', trial: true,
    items: [['Tudo do plano Criador, com histórico maior no painel', T.panel], ['Sem a marca JoyMap na página', T.brand], ['Domínio personalizado', T.dominio], ['Categorias próprias', T.categorias], ['Criação de roteiros que podem ser vendidos, com taxa de 5% por venda', T.roteiro], ['Criação de roteiros patrocinados com marcas parceiras', T.patrocinado], ['Fechar publi direto com restaurantes', null, true], ['Pin em destaque, sempre com a marca de publi', null, true], ['Relatório de publi para marcas', null, true]] },
].map((p) => ({ ...p, items: p.items.filter((it) => !it[2]) }))
const Y = 'Sim', N = 'Não'
// [item, Grátis, Criador, Pro, explicação, oculto?]
const COMPARE = [
  ['Preço', 'R$ 0', 'R$ 39,90 por mês ou R$ 399 por ano', 'R$ 79 por mês ou R$ 790 por ano'],
  ['Para quem', 'Engajar o público, sem vender nada', 'Mapa completo, sempre em dia', 'Vender roteiros e ter a marca própria'],
  ['Lugares no mapa', 'Até 20, dos posts recentes', 'Sem limite, com todo o histórico', 'Sem limite, com todo o histórico', T.limite],
  ['Atualização do mapa', 'Manual: você adiciona e atualiza os lugares', 'Automática, a partir dos seus posts', 'Automática, a partir dos seus posts', T.auto],
  ['Sem a marca JoyMap na página', N, N, Y, T.brand],
  ['Categorias', 'As do JoyMap', 'As do JoyMap', 'Até 15, com categorias próprias', T.categorias],
  ['Estúdio de estilo', 'Não, usa o tema padrão', 'Completo', 'Completo', T.studio],
  ['Painel de audiência', 'Visitas totais', 'Buscas, buscas sem resultado, lugares abertos e cliques em rota', 'Tudo do Criador, com histórico maior', T.panel],
  ['Banner do restaurante na ficha do lugar', 'Em breve', 'Em breve', 'Em breve', 'O restaurante vai poder mostrar uma promoção ou o cardápio na ficha do lugar dele, sempre identificado como do restaurante. Ainda não está disponível.'],
  ['Relatório de publi para marcas', N, N, Y, null, true],
  ['Fechar publi direto com restaurantes', N, N, Y, null, true],
  ['Pin em destaque para restaurante com publi', N, N, Y, null, true],
  ['Domínio personalizado', N, N, Y, T.dominio],
  ['Roteiros (grátis ou vendidos)', N, 'Sim, com taxa de 8% por venda', 'Sim, com taxa de 5% por venda', T.roteiro],
  ['Produtos nos roteiros', N, Y, Y, T.produto],
  ['Roteiros patrocinados com marcas parceiras', N, N, Y, T.patrocinado],
].filter((r) => !r[5])
// Ícone "?" com explicação ao passar o mouse ou focar (teclado e toque)
function Tip({ text }) {
  const id = React.useId()
  return (
    <span className="tip">
      <button type="button" className="tip-b" aria-describedby={id} aria-label="Saiba mais"><span aria-hidden="true">?</span></button>
      <span id={id} role="tooltip" className="tip-t">{text}</span>
    </span>
  )
}
function Compare({ open, setOpen }) {
  return (
    <div className="pn-cmp">
      <button type="button" className="pn-cmp-btn" id="comparar-planos" aria-expanded={open} aria-controls="pn-cmp-body" onClick={() => setOpen(!open)}>
        <span><b>Comparar os planos em detalhe</b><small>{open ? 'Ocultar a tabela comparativa' : 'Veja item por item o que cada plano inclui'}</small></span>
        <i aria-hidden="true" className={open ? 'on' : ''}><Icon n="down" s={20} c="currentColor" /></i>
      </button>
      <div id="pn-cmp-body" role="region" aria-labelledby="comparar-planos" className={'pn-cmp-p' + (open ? ' open' : '')}><div>
        <div className="pn-scroll" tabIndex={open ? 0 : -1}>
          <table className="pn-tbl">
            <caption className="sr">Comparativo dos planos Grátis, Criador e Pro</caption>
            <thead><tr><th scope="col">Item</th><th scope="col">Grátis</th><th scope="col" className="pn-hl">Criador</th><th scope="col">Pro</th></tr></thead>
            <tbody>{COMPARE.map(([l, a, b, c, tip]) => (
              <tr key={l}><th scope="row">{l}{tip && <Tip text={tip} />}</th>{[a, b, c].map((v, i) => <td key={i} className={i === 1 ? 'pn-hl' : ''}>{v === Y ? <><Icon n="check" s={16} c="#067647" /><span className="sr">Sim</span></> : v === N ? <span className="pn-no" aria-label="Não">—</span> : v}</td>)}</tr>))}</tbody>
          </table>
        </div>
      </div></div>
    </div>
  )
}
export function PlansBlock({ min, compact }) {
  const [annual, setAnnual] = useState(false)
  const [open, setOpen] = useState(false)
  // o link #comparar-planos abre a tabela
  React.useEffect(() => {
    const f = () => { if (location.hash === '#comparar-planos') { setOpen(true); setTimeout(() => document.getElementById('comparar-planos')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120) } }
    f(); window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f)
  }, [])
  const i = annual ? 1 : 0
  return (
    <section id="planos" className="sec" aria-labelledby="planos-h" style={{ background: 'var(--cream)' }}>
      <div className="w col" style={{ gap: 32 }}>
        <div className="sec-h c"><span className="eb">Planos e condições de entrada</span><h2 id="planos-h" className="d h-sec">Comece pelo seu <span style={hl}>mapa.</span></h2>
          <p className="lead">Comece no plano grátis, por convite, atualizando o seu mapa. Em breve, dois planos pagos, para o mapa completo sempre em dia e roteiros que podem ser vendidos. Você paga pouco e a JoyMap ganha quando você ganha.</p></div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <div className="pl-per pn-per" role="group" aria-label="Periodicidade da assinatura"><button type="button" aria-pressed={!annual} className={'chip' + (!annual ? ' on' : '')} onClick={() => setAnnual(false)}>Mensal</button><button type="button" aria-pressed={annual} className={'chip' + (annual ? ' on' : '')} onClick={() => setAnnual(true)}>Anual · 2 meses grátis</button></div>
        </div>
        <div className="pn">
          {PLANS.map((p) => (
            <article key={p.k} className={'pn-c pn-' + p.k + (p.main ? ' pn-main' : '') + (p.k === 'free' ? '' : ' pn-off')}>
              {p.k !== 'free' && <span className="tag pn-badge">Em breve</span>}
              <div className="pn-head"><span className="pn-em" aria-hidden="true"><Icon s={40} sym={em(p.icon)} /></span><b className="d s26">{p.name}</b></div>
              <p className="pn-who">{p.who}</p>
              <div className="pn-price"><b className="d">{p.price[i]}</b><span>{Array.isArray(p.per) ? p.per[i] : p.per}</span></div>
              {p.note && annual && p.k === 'free' ? <span className="xs pn-note">{p.note}</span> : <span className="xs pn-note">{p.k === 'free' ? 'Sem prazo e sem cartão' : 'Disponível em breve'}</span>}
              <ul className="pn-ul">{p.items.map(([t, tip]) => <li key={t}><i aria-hidden="true"><Icon n="check" s={12} c="#171713" /></i><span>{t}{tip && <Tip text={tip} />}</span></li>)}</ul>
              {p.k === 'free' ? <Link className="btn btn-lg pn-cta dk" to="/entrar?criar=1">Pedir convite</Link> : <span className="btn btn-lg pn-cta pn-wait">Em breve</span>}
            </article>))}
        </div>
        <Compare open={open} setOpen={setOpen} />
        <div className="pn-foot">
          <p className="xs mut">Valores previstos, ainda em validação durante o período de testes: nenhuma cobrança está ativa e alguns recursos ainda estão sendo liberados.</p>
          <p className="xs mut">Entrada mediante análise de perfil{min != null ? `, com mínimo de ${num(min)} seguidores (hoje)` : ''}, ainda em definição. Plano Agência, para quem administra vários criadores (R$ 19 por mapa por mês, mínimo de 10 mapas), sob consulta.</p>
          <Link className="link sm" to="/perguntas">Ver as perguntas frequentes</Link>
        </div>
      </div>
    </section>
  )
}

// Seção 12 · FAQ (accordion acessível)
const FAQ_COLORS = ['#FF6A4D', '#7FB0FF', '#4FD8B0', '#B79CFF', '#FF8FB1', '#FFC400']
export function Accordion({ items = FAQ }) {
  const [open, setOpen] = useState(0)
  const refs = React.useRef([])
  // setas, Home e End percorrem as perguntas
  const key = (e, i) => {
    const n = items.length
    const to = e.key === 'ArrowDown' ? (i + 1) % n : e.key === 'ArrowUp' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (to >= 0) { e.preventDefault(); refs.current[to]?.focus() }
  }
  return (
    <div className="faq">{items.map(([q, a], i) => (
      <div key={q} className={'faq-i' + (open === i ? ' open' : '')} style={{ '--c': FAQ_COLORS[i % FAQ_COLORS.length] }}>
        <h3><button type="button" ref={(el) => { refs.current[i] = el }} id={`fq-b${i}`} aria-expanded={open === i} aria-controls={`fq-p${i}`} onClick={() => setOpen(open === i ? -1 : i)} onKeyDown={(e) => key(e, i)}>
          <span className="faq-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span className="faq-q">{q}</span><span className="faq-pm" aria-hidden="true" /></button></h3>
        <div id={`fq-p${i}`} role="region" aria-labelledby={`fq-b${i}`} className="faq-p"><div><p>{a}</p></div></div>
      </div>))}</div>
  )
}
// Prévia das perguntas na página inicial: leva à página completa
export function FaqTeaser() {
  return (
    <section id="perguntas" className="sec fqt" aria-labelledby="faq-h">
      <div className="w fqt-g">
        <div className="fqt-l">
          <span className="eb">Perguntas frequentes</span>
          <h2 id="faq-h" className="d h-sec">Ainda tem dúvidas? <span style={hl}>A gente responde.</span></h2>
          <p className="lead">As perguntas que todo criador faz antes de começar: integrações, privacidade, personalização e planos.</p>
          <Link className="btn dk btn-lg fqt-btn" to="/perguntas">Ver todas as {FAQ.length} perguntas<Icon n="back" s={16} c="currentColor" /></Link>
        </div>
        <Accordion items={FAQ.slice(0, 5)} />
      </div>
    </section>
  )
}

// Seção 13 · CTA final com rota animada
export function FinalCta() {
  return (
    <section className="sec fc" aria-labelledby="fim" style={{ overflow: 'hidden', paddingBottom: 110 }}>
      <Floaters set="g" />
      <div className="w col" style={{ alignItems: 'center', textAlign: 'center', gap: 22, position: 'relative' }}>
        <span className="tag" style={{ background: 'var(--cream)' }}>Seu jeito. Seu voo.</span>
        <h2 id="fim" className="d h-sec" style={{ maxWidth: 760 }}>Você já tem o conteúdo. Falta o mapa.</h2>
        <p className="lead" style={{ maxWidth: 560 }}>Dê um novo destino às suas recomendações e descubra até onde elas podem levar sua audiência.</p>
        <div className="row wrap" style={{ gap: 12, justifyContent: 'center' }}><Link className="btn dk btn-lg" to="/entrar?criar=1">Pedir convite</Link><Link className="btn ln btn-lg" to="/@demo">Ver um mapa de exemplo</Link></div>
      </div>
    </section>
  )
}
