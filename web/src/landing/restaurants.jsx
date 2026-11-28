import React, { useEffect, useState } from 'react'
import { Link } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { Top, SiteFooter, useTitle } from '../lib/ui.jsx'
import { Phone, Native, Browser } from './device.jsx'
import { PubPreview, DEMO_IDENTITIES, MAP_THEME, PLACES6 } from './pubpreview.jsx'
import { Floaters, DoodleDefs } from './doodles.jsx'
import { PauseCtx } from './motion.jsx'
import { Accordion } from './trust.jsx'

// Página de venda para restaurantes (rota oculta: não está linkada no site institucional). Mesmo sistema visual da página dos criadores.
const em = (n) => ({ lib: `lib:fluent3d:${n}` })
const hl = { background: 'linear-gradient(transparent 60%, var(--hl, var(--acc)) 60%)', padding: '0 4px' }
const Deco = ({ set, children }) => <div className="fl-host">{children}<Floaters set={set} /></div>
const CLAIM = '/entrar?como=restaurante&criar=1'

const BENEFITS = [
  ['magnifying-glass-tilted-left', 'Veja quem indica você', 'Descubra quais criadores incluíram o seu restaurante no mapa, e quando. Sem precisar vasculhar feeds.', 'Acesso antecipado'],
  ['round-pushpin', 'Corrija o que aparece', 'Endereço, nome e categoria errados queimam a indicação. Com o lugar verificado, você corrige os dados exibidos nos mapas.', 'Acesso antecipado'],
  ['bar-chart', 'Entenda o efeito', 'Contagens agregadas de aberturas do seu lugar e pedidos de rota, sempre sem identificar pessoas e só quando o criador autoriza.', 'Em desenvolvimento'],
  ['party-popper', 'Avise o público da sua oferta', 'Coloque uma bandeira no seu lugar com um desconto ou evento da semana. Quem abre o mapa de um criador que indicou você vê, mesmo sem acompanhar o seu Instagram.', 'Em desenvolvimento'],
]
const STEPS = [
  ['Encontre o seu lugar', 'Busque o restaurante pelo nome entre os lugares já indicados nos mapas dos criadores.'],
  ['Confirme que é o responsável', 'Pelo Perfil de Empresa do Google (em breve), pelo e-mail do domínio ou por verificação manual com documento.'],
  ['Acompanhe e corrija', 'Veja as indicações recebidas, quem indicou e corrija as informações do seu lugar.'],
]
const TRUST = [
  'Reivindicar o lugar não dá poder sobre o que os criadores publicam. Dá o direito de corrigir os dados do lugar.',
  'Você vê contagens agregadas. Nunca uma lista de pessoas nem a jornada de alguém.',
  'Os dados de visitas só chegam a você se o criador decidir compartilhar, em uma escolha separada e revogável.',
  'Indicações pagas aparecem sempre com a marca de publi.',
  'Ofertas e eventos do restaurante aparecem sempre identificados como do restaurante, separados da indicação do criador, e não mudam a ordem nem a posição no mapa.',
  'O painel nunca mostra nada ao seguidor sem aviso: ele é só seu.',
]
const FAQ_REST = [
  ['Quanto custa?', 'Reivindicar o lugar e corrigir os dados é gratuito. Um painel completo, com métricas agregadas, ainda está em definição: nenhum valor foi decidido e nenhuma cobrança está ativa.'],
  ['Meu restaurante precisa estar no mapa de algum criador?', 'Sim. O painel mostra as indicações recebidas, então o seu lugar precisa ter sido indicado por pelo menos um criador. Se ainda não foi, avisamos quando acontecer.'],
  ['Posso remover ou alterar uma indicação feita por um criador?', 'Não. Reivindicar não dá poder sobre o que os criadores publicam. Você corrige os dados do lugar, como endereço e nome, e pode falar com a equipe se algo estiver errado.'],
  ['Como vocês confirmam que sou o responsável?', 'Por três caminhos: Perfil de Empresa do Google (em breve), e-mail do domínio do restaurante ou verificação manual com documento. A equipe confere antes de liberar o painel.'],
  ['Vocês leem comentários ou avaliações de clientes?', 'Hoje não coletamos comentários de nenhuma plataforma. A conexão com avaliações do Google depende da sua autorização e ainda não está disponível.'],
  ['Posso divulgar um desconto ou um evento?', 'É o que estamos desenhando: uma bandeira no seu lugar, com a oferta ou o evento da semana, que aparece para quem abre o mapa de um criador que indicou você. Ela vai aparecer sempre como oferta do restaurante, separada da indicação do criador. Ainda não está disponível e as condições não foram definidas.'],
  ['Vou ver quem visitou o meu restaurante?', 'Não. Mostramos apenas contagens agregadas, com amostra mínima, e só quando o criador permite compartilhar. Nunca identificamos pessoas.'],
]

function Hero() {
  const a = DEMO_IDENTITIES[0]
  return (
    <div className="hero2">
      <div className="w split hero2-in">
        <div className="col hero2-tx">
          <span className="tag hero2-eb">Para restaurantes</span>
          <h1 className="d rs-h1">Os criadores já indicam <span className="rs-nl">o seu restaurante.</span></h1>
          <p className="s20" style={{ maxWidth: 520, fontWeight: 500 }}>O JoyMap reúne, em mapas de criadores, as indicações do seu lugar. Reivindique o seu restaurante, corrija as informações e acompanhe quem indica você.</p>
          <div className="row wrap" style={{ gap: 12 }}>
            <Link className="btn dk btn-lg" to={CLAIM}>Reivindicar meu restaurante</Link>
            <Link className="btn ln btn-lg" to="/@demo">Ver um mapa de exemplo</Link>
          </div>
          <p className="xs hero2-mc">Reivindicar e corrigir os dados é gratuito.</p>
        </div>
        <div className="rs-hero-v">
          <Phone h={560} label="Tela pública de um mapa de criador, com o restaurante em destaque">
            <Native h={560} theme={MAP_THEME}><PubPreview name={a.name} handle={a.handle} theme={MAP_THEME} places={PLACES6} view="map" /></Native>
          </Phone>
          <div className="rs-float" aria-label="Exemplo de aviso do painel do restaurante">
            <span className="rs-fl-eb">Painel do restaurante</span>
            <b>1 criador novo indicou a Cantina Exemplo</b>
            <span className="xs">Exemplo ilustrativo, dados fictícios</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Problem() {
  return (
    <section className="sec" aria-labelledby="rs-p" style={{ background: 'var(--cream)' }}>
      <div className="w col" style={{ gap: 40 }}>
        <div className="sec-h c"><span className="eb">Hoje, na prática</span><h2 id="rs-p" className="d h-sec">A indicação acontece. <span style={hl}>Você só fica sabendo depois.</span></h2>
          <p className="lead">Cada vez mais gente escolhe onde comer a partir do que um criador indica. Mas esse caminho passa por feeds que você não acompanha, com informações que você não controla.</p></div>
        <div className="rs-vs">
          <div className="rs-box off"><span className="fvm-lb off">Sem JoyMap</span>
            <ul className="fvm-ul off">{['Você descobre a indicação pelo movimento, não pelo criador.', 'Endereço ou nome errado circula nos posts sem correção.', 'Não dá para saber quais criadores falam do seu lugar.', 'Parceria e indicação espontânea se misturam.'].map((t) => <li key={t}><i aria-hidden="true">✕</i>{t}</li>)}</ul></div>
          <div className="rs-box on"><span className="fvm-lb on">Com JoyMap</span>
            <ul className="fvm-ul on">{['Você vê quais criadores indicaram o seu lugar.', 'Os dados exibidos nos mapas ficam corretos, porque você os corrige.', 'Contagens agregadas mostram o interesse pelo lugar, quando o criador autoriza.', 'Você avisa o público sobre uma oferta ou evento, direto no mapa que ele já usa.'].map((t) => <li key={t}><i aria-hidden="true">✓</i>{t}</li>)}</ul></div>
        </div>
      </div>
    </section>
  )
}

function Benefits() {
  return (
    <section className="sec" aria-labelledby="rs-b" style={{ background: '#fff' }}>
      <div className="w col" style={{ gap: 40 }}>
        <div className="sec-h"><span className="eb">O que você ganha</span><h2 id="rs-b" className="d h-sec">Um painel para quem é <span style={hl}>indicado.</span></h2></div>
        <div className="rs-grid">{BENEFITS.map(([ic, t, d, soon], i) => (
          <article key={t} className="rs-card" style={{ '--i': i }}>
            <span className="rs-ic"><Icon s={56} sym={em(ic)} /></span>
            {soon && <span className="tag wn rs-soon">{soon}</span>}
            <h3 className="d s26">{t}</h3><p>{d}</p>
          </article>))}</div>
      </div>
    </section>
  )
}

function PanelMock() {
  const a = DEMO_IDENTITIES[0], b = DEMO_IDENTITIES[1]
  return (
    <Browser url="JoyMap · painel do restaurante" side={false}>
      <div className="rs-mock">
        <div className="row jb wrap"><div><b className="d s26">Cantina Exemplo</b><div className="xs mut">Bela Vista · lugar verificado</div></div><span className="tag ok">Verificado</span></div>
        <div className="rs-kpis"><div><b>3</b><span>criadores indicaram</span></div><div><b>5</b><span>indicações</span></div><div><b>1</b><span>com publi declarada</span></div></div>
        <div className="rs-list"><b className="sm">Indicações recebidas</b>
          {[[a.name, '12/11', false], [b.name, '04/11', true], ['Mapa de exemplo', '27/10', false]].map(([n, d, ad]) => <div key={n} className="rs-row"><i style={{ background: ad ? 'var(--acc)' : '#171713' }} /><span className="sp">{n} · {d}</span>{ad && <span className="tag wn">Publi</span>}</div>)}</div>
        <div className="rs-flag"><span className="tag wn">Bandeira da semana</span><b className="sm">Sobremesa em dobro às quintas</b><span className="xs">Aparece no seu lugar nos mapas dos criadores que indicaram você. Exemplo ilustrativo.</span></div>
        <div className="rs-lock"><Icon n="lock" s={16} /><span><b>Aberturas e pedidos de rota</b> <em>em desenvolvimento</em></span></div>
      </div>
    </Browser>
  )
}
function How() {
  return (
    <section id="como-funciona" className="sec" aria-labelledby="rs-h" style={{ background: 'var(--cream)' }}>
      <div className="w rs-how">
        <div className="col" style={{ gap: 28, minWidth: 0 }}>
          <div className="sec-h"><span className="eb">Como funciona</span><h2 id="rs-h" className="d h-sec">Do seu lugar ao seu painel, em <span style={hl}>três passos.</span></h2></div>
          <ol className="rs-steps">{STEPS.map(([t, d], i) => <li key={t}><b className="rs-n">{i + 1}</b><div><h3 className="d s26">{t}</h3><p>{d}</p></div></li>)}</ol>
          <div className="row wrap" style={{ gap: 12 }}><Link className="btn dk btn-lg" to={CLAIM}>Reivindicar meu restaurante</Link></div>
        </div>
        <div className="rs-mockwrap"><PanelMock /><p className="xs mut c" style={{ marginTop: 14 }}>Exemplo ilustrativo, com restaurante e criadores fictícios.</p></div>
      </div>
    </section>
  )
}

function Trust() {
  return (
    <section className="sec rs-trust" aria-labelledby="rs-t">
      <div className="w split" style={{ gap: 56, alignItems: 'center' }}>
        <div className="col" style={{ flex: 1, gap: 18, minWidth: 0 }}>
          <span className="eb" style={{ color: 'inherit', opacity: 0.7 }}>Regras de confiança</span>
          <h2 id="rs-t" className="d h-sec">Dinheiro não compra posição.</h2>
          <p className="lead" style={{ color: 'inherit' }}>O mapa vale porque o seguidor confia nele. Por isso as regras valem para todos, inclusive para quem paga.</p>
        </div>
        <ul className="tr-l rs-tl" style={{ flex: 1.1 }}>{TRUST.map((t) => <li key={t}><i aria-hidden="true"><Icon n="check" s={12} c="#171713" /></i>{t}</li>)}</ul>
      </div>
    </section>
  )
}

function Plans() {
  return (
    <section id="planos" className="sec" aria-labelledby="rs-pl" style={{ background: 'var(--cream)' }}>
      <div className="w col" style={{ gap: 32 }}>
        <div className="sec-h c"><span className="eb">Condições</span><h2 id="rs-pl" className="d h-sec">Comece <span style={hl}>sem pagar nada.</span></h2></div>
        <div className="pl">
          <div className="pl-main">
            <span className="tag" style={{ background: 'var(--acc)', alignSelf: 'flex-start' }}>Para restaurantes</span>
            <b className="d" style={{ fontSize: 'clamp(40px,5vw,64px)' }}>Reivindicar é grátis</b>
            <p>Confirme que é o responsável, veja as indicações recebidas e corrija os dados do seu lugar, sem custo.</p>
            <p className="sm" style={{ opacity: 0.8 }}>Um painel completo, com métricas agregadas, está em desenvolvimento. Os valores ainda não foram definidos e nenhuma cobrança está ativa.</p>
          </div>
          <div className="pl-side">
            <div className="pl-i"><b>Acesso antecipado</b><span>Sem cobrança nesta etapa. A equipe confere cada pedido antes de liberar o painel.</span></div>
            <div className="pl-i"><b>Rede com várias unidades?</b><span>Cada unidade vira um pin. Fale com a gente para organizar o acesso. Em definição.</span></div>
            <Link className="btn dk btn-lg" to={CLAIM}>Reivindicar meu restaurante</Link>
            <span className="xs mut">Você só precisa do nome do lugar e de um contato.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  return (
    <section id="perguntas" className="sec fqt" aria-labelledby="rs-fq">
      <div className="w fqt-g">
        <div className="fqt-l">
          <span className="eb">Perguntas frequentes</span>
          <h2 id="rs-fq" className="d h-sec">Dúvidas de quem tem um <span style={hl}>restaurante.</span></h2>
          <p className="lead">O que o painel mostra, o que não mostra e como confirmamos que você é o responsável.</p>
        </div>
        <Accordion items={FAQ_REST} />
      </div>
    </section>
  )
}

function Final() {
  return (
    <section className="sec fc" aria-labelledby="rs-fim" style={{ overflow: 'hidden', paddingBottom: 110 }}>
      <Floaters set="g" />
      <div className="w col" style={{ alignItems: 'center', textAlign: 'center', gap: 22, position: 'relative' }}>
        <span className="tag" style={{ background: 'var(--cream)' }}>Para restaurantes</span>
        <h2 id="rs-fim" className="d h-sec" style={{ maxWidth: 760 }}>O seu restaurante já pode estar nos mapas.</h2>
        <p className="lead" style={{ maxWidth: 560 }}>Reivindique o seu lugar, corrija as informações e veja quem indica você.</p>
        <div className="row wrap" style={{ gap: 12, justifyContent: 'center' }}><Link className="btn dk btn-lg" to={CLAIM}>Reivindicar meu restaurante</Link><Link className="btn ln btn-lg" to="/@demo">Ver um mapa de exemplo</Link></div>
      </div>
    </section>
  )
}

export function RestaurantsLanding() {
  useTitle('Para restaurantes')
  const [paused, setPaused] = useState(false)
  // página em teste: fora dos buscadores até ser lançada
  useEffect(() => { const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, nofollow'; document.head.appendChild(m); return () => m.remove() }, [])
  return (
    <PauseCtx.Provider value={{ paused, setPaused }}>
      <div className={'page lp rs' + (paused ? ' nomo' : '')}>
        <Top active={-1} overlay dark />
        <DoodleDefs />
        <Hero />
        <Deco set="a"><Problem /></Deco>
        <Deco set="b"><Benefits /></Deco>
        <Deco set="c"><How /></Deco>
        <Trust />
        <Deco set="f"><Plans /></Deco>
        <Faq />
        <Final />
        <SiteFooter />
      </div>
    </PauseCtx.Provider>
  )
}
