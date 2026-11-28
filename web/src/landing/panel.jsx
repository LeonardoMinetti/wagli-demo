import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '../lib/icons.jsx'
import { Switch } from '../lib/ui.jsx'
import { NORES, REL } from './insights.jsx'
import { ph } from './social.jsx'
import { useInView, usePause, useReducedMotion } from './motion.jsx'

const em = (n) => ({ lib: `lib:fluent3d:${n}` })
const hl = { background: 'linear-gradient(transparent 60%, var(--hl, var(--acc)) 60%)', padding: '0 4px' }

// ---------- mídias dos cartões (telas do painel, com a mesma linguagem dos cartões de roteiros) ----------
function Searches() {
  return (
    <div className="md">
      <div className="md-h st" style={{ '--k': 0 }}><b>Buscas sem resultado</b><span className="md-chip">30 dias</span></div>
      <ul className="md-bars">{NORES.slice(0, 4).map(([t, v], i) => (
        <li key={t} className={'st' + (i === 0 ? ' hot' : '')} style={{ '--k': i + 1, '--i': i }}>
          <span className="md-t">{t}</span><span className="md-tr"><i style={{ '--w': `${Math.round((v / 87) * 100)}%` }} /></span><b>{v}</b>
        </li>))}</ul>
      <div className="md-idea st" style={{ '--k': 5 }}><span className="md-ie"><Icon s={26} sym={em('light-bulb')} /></span><div><b>Ideia de conteúdo</b><p>Um roteiro de restaurantes japoneses na Liberdade atende a uma demanda que já existe.</p></div></div>
    </div>
  )
}
function Categories() {
  return (
    <div className="md">
      <div className="md-h st" style={{ '--k': 0 }}><b>Categorias</b><span className="md-chip">interesse relativo</span></div>
      <ul className="md-bars">{REL.cat.slice(0, 3).map(([t, v], i) => (
        <li key={t} className="st" style={{ '--k': i + 1, '--i': i }}><span className="md-t">{t}</span><span className="md-tr"><i style={{ '--w': `${v}%` }} /></span><b>{v}</b></li>))}</ul>
      <div className="md-h st" style={{ '--k': 4 }}><b>Bairros</b><span className="md-chip">interesse relativo</span></div>
      <ul className="md-heat">{REL.hood.slice(0, 5).map(([t, v], i) => <li key={t} className="st" style={{ '--k': i + 5, '--a': (0.07 + (v / 100) * 0.22).toFixed(2) }}>{t}<b>{v}</b></li>)}</ul>
    </div>
  )
}
const TOP = [['Izakaya Exemplo', 'Liberdade', 'sushi', 100], ['Cantina Exemplo', 'Bela Vista', 'massa', 78], ['Café Exemplo', 'Vila Madalena', 'cafe', 63], ['Pizza Exemplo', 'Moema', 'pizza', 41]]
function TopOpened() {
  return (
    <div className="md">
      <div className="md-h st" style={{ '--k': 0 }}><b>Recomendações mais abertas</b><span className="md-chip">30 dias</span></div>
      <ul className="md-top">{TOP.map(([n, b, k, v], i) => (
        <li key={n} className="st" style={{ '--k': i + 1, '--i': i }}>
          <em>{i + 1}</em><img src={ph(k)} alt="" loading="lazy" decoding="async" />
          <div><b>{n}</b><span>{b}</span><span className="md-tr thin"><i style={{ '--w': `${v}%` }} /></span></div>
          <strong>{v}</strong>
        </li>))}</ul>
      <p className="md-note st" style={{ '--k': 5 }}>Dados ilustrativos. Tudo agregado, sem identificar pessoas.</p>
    </div>
  )
}
function Choices() {
  const [geral, setGeral] = useState(false)
  const [rest, setRest] = useState(false)
  const [saved, setSaved] = useState('')
  const t = useRef(null)
  const flash = (m) => { setSaved(m); clearTimeout(t.current); t.current = setTimeout(() => setSaved(''), 1800) }
  useEffect(() => () => clearTimeout(t.current), [])
  return (
    <div className="md">
      <div className="md-h st" style={{ '--k': 0 }}><b>Privacidade e consentimentos</b><span className="md-chip">demonstração</span></div>
      <ul className="md-rows">
        <li className="st" style={{ '--k': 1 }}><span className="md-ri"><Icon s={26} sym={em('star')} /></span><div><b>Aprovar cada recomendação</b><span>Nada é publicado sem a sua revisão.</span></div><em className="md-always">Sempre</em></li>
        <li className="st" style={{ '--k': 2 }}><span className="md-ri"><Icon s={26} sym={em('world-map')} /></span><div><b>Participar do mapa geral</b><span>Opcional. Desativado por padrão.</span></div><Switch on={geral} onChange={(v) => { setGeral(v); flash(v ? 'Participação no mapa geral ativada' : 'Participação no mapa geral desativada') }} label="Participar do mapa geral" /></li>
        <li className="st" style={{ '--k': 3 }}><span className="md-ri"><Icon s={26} sym={em('fork-and-knife-with-plate')} /></span><div><b>Dados agregados para restaurantes</b><span>Decisão separada e revogável. Desativado por padrão.</span></div><Switch on={rest} onChange={(v) => { setRest(v); flash(v ? 'Compartilhamento com restaurantes ativado' : 'Compartilhamento com restaurantes desativado') }} label="Compartilhar dados agregados com restaurantes" /></li>
      </ul>
      <p className={'md-toast' + (saved ? ' on' : '')} role="status" aria-live="polite"><i />{saved || 'Experimente: cada opção muda sozinha e pode ser desfeita.'}</p>
    </div>
  )
}
function Trust() {
  return (
    <div className="md">
      <div className="md-2 st" style={{ '--k': 0 }}>
        <div className="md-yes"><b>O JoyMap analisa</b><ul><li>Legendas das publicações autorizadas</li><li>Localização e data</li><li>Dados agregados, sem pessoas</li></ul></div>
        <div className="md-no"><b>O JoyMap não lê</b><ul><li>Mensagens</li><li>Lista de seguidores</li><li>Comentários</li></ul></div>
      </div>
      <ul className="md-pills">{['Sem senha das suas redes', 'Consentimentos revogáveis', 'Participações extras desativadas'].map((t, i) => <li key={t} className="st" style={{ '--k': i + 1 }}><Icon n="check" s={13} c="currentColor" />{t}</li>)}</ul>
      <p className="md-note st" style={{ '--k': 4 }}>Os textos legais (termos e privacidade) ainda passam por revisão jurídica.</p>
    </div>
  )
}

// Cartões: mesma paleta dos roteiros (amarelo, preto, cinza, menta) mais lilás.
const CARDS = [
  { k: 'ins', tag: 'Insights', t: 'O que a audiência busca e não encontra', d: 'Veja o que as pessoas procuram no seu mapa e ainda não encontram. Cada busca sem resultado vira uma ideia de conteúdo.', bg: 'var(--acc)', fg: 'var(--ink)', av: { img: ['sushi', 'ramen', 'sushi2'], more: 4 }, body: Searches },
  { k: 'cat', tag: 'Em desenvolvimento', t: 'Categorias e bairros com mais interesse', d: 'Descubra quais categorias e bairros despertam mais interesse na sua audiência.', bg: 'var(--ink)', fg: '#fff', av: { img: ['pizza', 'massa', 'burger'], more: 5 }, body: Categories },
  { k: 'top', tag: 'Insights', t: 'Recomendações que mais despertam interesse', d: 'Saiba quais das suas indicações são mais abertas, sem identificar quem abriu.', bg: '#E4E4E4', fg: 'var(--ink)', av: { img: ['latte', 'croissant', 'bolo'], more: 6 }, body: TopOpened },
  { k: 'ctl', tag: 'Controle', t: 'Você decide o que é publicado e compartilhado', d: 'Nada vai ao ar sem a sua aprovação, e cada compartilhamento é uma decisão separada sua.', bg: '#A5DFCA', fg: 'var(--ink)', av: { em: ['handshake', 'world-map', 'star'] }, body: Choices },
  { k: 'priv', tag: 'Confiança', t: 'Sem senhas, sem mensagens, sem expor pessoas', d: 'Você não precisa dar a senha das suas redes, e o JoyMap não lê mensagens nem identifica pessoas.', bg: '#C9B0E9', fg: 'var(--ink)', av: { em: ['locked', 'sparkles', 'handshake'] }, body: Trust },
]
const SHORT = ['Buscas sem resultado', 'Categorias e bairros', 'Mais abertos', 'Você decide', 'Privacidade']

const Stack = ({ av }) => (
  <div className="gd-av">
    {av.img && av.img.map((k) => <img key={k} src={ph(k)} alt="" loading="lazy" decoding="async" />)}
    {av.em && av.em.map((n) => <span key={n} className="gd-em"><Icon s={26} sym={em(n)} /></span>)}
    {av.more && <b>+{av.more}</b>}
  </div>
)

// Um cartão por vez, em pilha inclinada como o baralho de roteiros: troca com abas, setas ou deslizando; avança sozinho enquanto está visível.
export function InsightsControl() {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [auto, setAuto] = useState(true)
  const [ref, on] = useInView(0.35)
  const rm = useReducedMotion()
  const { paused } = usePause()
  const run = auto && on && !rm && !paused
  const go = (n, manual = true) => { if (manual) setAuto(false); setDir(n >= i ? 1 : -1); setI((n + CARDS.length) % CARDS.length) }
  useEffect(() => {
    if (!run) return
    const t = setTimeout(() => { setDir(1); setI((x) => (x + 1) % CARDS.length) }, 7000)
    return () => clearTimeout(t)
  }, [run, i])
  const c = CARDS[i], Body = c.body
  const touch = useRef(null)
  return (
    <section id="insights" className="sec pn-sec" aria-labelledby="ins">
      <div className="w col" style={{ gap: 36 }}>
        <div className="sec-h"><span className="tag" style={{ alignSelf: 'flex-start' }}>JOYMAP INSIGHTS · CONTROLE E CONFIANÇA</span>
          <h2 id="ins" className="d h-sec">Seu próximo conteúdo pode estar <span style={hl}>na busca da sua audiência.</span> E as decisões continuam <span style={{ ...hl, '--hl': '#C9B0E9' }}>com você.</span></h2>
          <p className="lead">As redes mostram como um conteúdo performou. O JoyMap pode mostrar o que as pessoas tentam encontrar, sem abrir mão da privacidade de ninguém. Números, buscas e nomes destes cartões são ilustrativos.</p></div>
        <div ref={ref} className="sl">
          <div className="sl-tabs" role="tablist" aria-label="Insights e controle">
            {CARDS.map((x, n) => <button key={x.k} type="button" role="tab" aria-selected={n === i} className={n === i ? 'on' : ''} onClick={() => go(n)}><i aria-hidden="true" style={{ background: x.bg }} />{SHORT[n]}</button>)}
          </div>
          <div className="sl-stage" onTouchStart={(e) => { touch.current = e.touches[0].clientX }} onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - (touch.current ?? 0); if (Math.abs(d) > 50) go(i + (d < 0 ? 1 : -1)) }}>
            <i className="sl-ghost g1" aria-hidden="true" style={{ background: CARDS[(i + 1) % CARDS.length].bg }} /><i className="sl-ghost g2" aria-hidden="true" style={{ background: CARDS[(i + 2) % CARDS.length].bg }} />
            <article key={c.k} className={'sl-card' + (dir < 0 ? ' back' : '') + (c.bg === 'var(--ink)' ? ' dk' : '')} style={{ background: c.bg, color: c.fg }} aria-live="polite">
              <div className="sl-tx">
                <span className="gd-ex">{c.tag} · {String(i + 1).padStart(2, '0')}</span>
                <h3 className="d s32">{c.t}</h3>
                <Stack av={c.av} />
                <hr />
                <p>{c.d}</p>
                <div className="sl-nav">
                  <button type="button" className="sl-arw" aria-label="Anterior" onClick={() => go(i - 1)}><Icon n="back" s={18} c="currentColor" /></button>
                  <span className="sl-cnt">{String(i + 1).padStart(2, '0')} / {String(CARDS.length).padStart(2, '0')}</span>
                  <button type="button" className="sl-arw nx" aria-label="Próximo" onClick={() => go(i + 1)}><Icon n="back" s={18} c="currentColor" /></button>
                  <span className={'sl-prog' + (run ? ' run' : '')} aria-hidden="true"><i key={i} /></span>
                </div>
              </div>
              <div className="sl-pn"><Body /></div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
