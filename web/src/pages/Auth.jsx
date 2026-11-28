import { STATIC } from '../lib/base.js'
import React, { useEffect, useState } from 'react'
import { api } from '../api.js'
import { Link, navigate, useLocation } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { Top, Field, Check, Note, useTitle } from '../lib/ui.jsx'
import { useMe, homeFor } from '../lib/me.jsx'
import { Floaters, DoodleDefs } from '../landing/doodles.jsx'
import { Scene, useMedia } from '../landing/motion.jsx'
import { MapMotion, SaveMotion, RestaurantMotion } from './AuthMotion.jsx'
import { num } from '../theme.jsx'

// Entrada única do site (/entrar). Três tipos de conta, a mesma tela:
//   criador      tem (ou quer ter) um mapa, painel e Estúdio     /entrar   e  /entrar?criar=1
//   explorador   não tem mapa: guarda lugares dos mapas alheios  /entrar?como=explorador   e  /entrar?como=explorador&criar=1
//   restaurante  reivindica o seu lugar e vê quem o indica       /entrar?como=restaurante  e  /entrar?como=restaurante&criar=1
// "Entrar" e "Quero meu mapa" abrem esta página; o explorador chega pelo rodapé e pelo mapa de um criador.
// Acessos: e-mail (link sem senha, já funciona), Google (pronto para ligar: ver `providers` em /api/config) e Instagram (criadores).

export const IconCircle = ({ n, c, bg }) => <div className="sq" style={{ width: 64, height: 64, borderRadius: '50%', background: bg, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon n={n} s={30} c={c} /></div>

// Na demonstração publicada (sem servidor) o acesso por e-mail está liberado só para este e-mail, que entra como administrador
// a conta autorizada na demonstração fica só como resumo (SHA-256): o endereço não aparece no código público
const OWNER_HASH = '8d654e522afb1a4ccd40ec5b77e7df2561040aa87f8d7607cd5b3590072ef77e'
export const isOwner = async (email) => {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(email).trim().toLowerCase()))
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('') === OWNER_HASH
}
export const Google = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
)

// Moldura: fundo em largura total (preto para criador, amarelo para explorador) com elementos flutuantes, o cartão e a ilustração em movimento
const KINDS = { escolha: { set: 'hero', Motion: null }, criador: { set: 'g', Motion: MapMotion }, explorador: { set: 'q', Motion: SaveMotion }, restaurante: { set: 'd', Motion: RestaurantMotion } }
export function AuthFrame({ kind = 'criador', children }) {
  const wide = useMedia('(min-width: 901px)')
  const { set, Motion } = KINDS[kind]
  return (
    <div className={`page lp au fl-host au-${kind}`}>
      <DoodleDefs />
      <Top active={-1} overlay dark={kind === 'criador' || kind === 'escolha'} />
      <Floaters set={set} />
      <main className="w au-w">
        <section className="au-card">{children}</section>
        {wide && Motion && <Scene className="au-mo"><Motion /></Scene>}
      </main>
    </div>
  )
}

// endereço de cada tela: só muda o tipo de conta (como) e se é criar conta (criar)
const url = (kind, criar, voltar) => { const q = new URLSearchParams(); q.set('como', kind); if (criar) q.set('criar', '1'); if (voltar && voltar !== '/salvos') q.set('voltar', voltar); const s = q.toString(); return '/entrar' + (s ? `?${s}` : '') }
const Alt = ({ children }) => <div className="au-alt sm mut">{children}</div>

// Acessos sociais: Google (e Instagram para criadores). Ligados pelo servidor; enquanto não estiverem, avisam.
function Social({ kind, criar, voltar }) {
  const { reload } = useMe()
  const [cfg, setCfg] = useState({})
  const [msg, setMsg] = useState('')
  useEffect(() => { api('/config').then((c) => setCfg(c.providers || {})).catch(() => {}) }, [])
  const go = async (p) => {
    setMsg('')
    if (cfg[p]) { location.href = `/api/auth/${p}?${new URLSearchParams({ as: kind === 'explorador' ? 'viewer' : kind === 'restaurante' ? 'restaurant' : 'creator', ...(criar ? { signup: '1' } : {}), back: voltar })}`; return }
    // em desenvolvimento o servidor aceita um login simulado de criador de teste
    if (p === 'instagram' && !STATIC && !criar) { try { await api('/auth/demo', { method: 'POST' }); await reload(); return } catch { /* cai no aviso */ } }
    setMsg(p)
  }
  return (
    <div className="col" style={{ gap: 10 }}>
      <div className={kind === 'criador' ? 'au-soc' : ''}>
        <button type="button" className="btn ln blk" onClick={() => go('google')}><Google />{kind !== 'criador' ? (criar ? 'Criar conta com Google' : 'Continuar com Google') : 'Google'}</button>
        {kind === 'criador' && <button type="button" className="btn ln blk" onClick={() => go('instagram')}><Icon n="insta" s={18} />Instagram</button>}
      </div>
      {msg && <Note>{msg === 'google' ? 'O acesso com Google ainda não está ativo.' : 'O acesso pelo Instagram depende da aprovação do app pela Meta e ainda não está ativo.'} Use o e-mail.</Note>}
      <div className="row"><div className="sep sp" /><span className="xs mut">ou com e-mail</span><div className="sep sp" /></div>
    </div>
  )
}

const EB = { criador: 'Criadores', explorador: 'Exploradores', restaurante: 'Restaurantes' }
const Head = ({ kind, criar, children }) => (
  <>
    <span className="eb">{EB[kind]}</span>
    <h1 className="d s44">{criar ? (kind === 'criador' ? 'Pedir convite' : 'Criar conta') : 'Entrar'}</h1>
    <p className="mut">{children}</p>
  </>
)
const OTHER = { criador: [['explorador', 'Só quer salvar lugares?', 'Entrar como explorador'], ['restaurante', 'Tem um restaurante/estabelecimento?', 'Entrar como restaurante/estabelecimento']], explorador: [['criador', 'Tem um mapa?', 'Entrar como criador'], ['restaurante', 'Tem um restaurante/estabelecimento?', 'Entrar como restaurante/estabelecimento']], restaurante: [['criador', 'Tem um mapa?', 'Entrar como criador'], ['explorador', 'Só quer salvar lugares?', 'Entrar como explorador']] }
const Bottom = ({ kind, criar, voltar }) => (
  <Alt>
    <div>{criar ? 'Já tem conta?' : 'Ainda não tem conta?'} <Link className="link" to={url(kind, !criar, voltar)}>{criar ? 'Entrar' : 'Criar conta'}</Link></div>
    {OTHER[kind].map(([k, t, l]) => <div key={k}>{t} <Link className="link" to={url(k, criar, voltar)}>{l}</Link></div>)}
  </Alt>
)

const TEXT = {
  criador: ['Acesse o seu painel, o Estúdio de estilo e o seu mapa.', ''],
  explorador: ['Veja os lugares que você salvou, os criadores que acompanha e a sua conta.', 'Guarde lugares de qualquer mapa e encontre tudo num só lugar, em qualquer aparelho. Sem painel e sem senha.'],
  restaurante: ['Acesse o painel do seu restaurante: quem indica o seu lugar e o que dizem dele.', 'Conta de restaurante: reivindique o seu lugar, veja quais criadores o indicam e corrija os dados exibidos nos mapas.'],
}
// E-mail sem senha (entrar, ou criar conta de explorador ou restaurante). Criador que cria conta passa pelo pedido de mapa (ApplyForm).
function EmailForm({ kind, criar, voltar }) {
  const { reload } = useMe()
  const { search: qs } = useLocation()
  const [email, setEmail] = useState(() => { try { return (kind === 'criador' && sessionStorage.getItem('applied_email')) || '' } catch { return '' } })
  const [terms, setTerms] = useState(false)
  const [sent, setSent] = useState(null)
  const [err, setErr] = useState('')
  const [wait, setWait] = useState(0)
  useEffect(() => { if (wait <= 0) return; const h = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(h) }, [wait])
  // quando o link é aberto em outra aba, esta tela percebe o login
  useEffect(() => { if (!sent) return; const h = setInterval(() => reload(), 3500); return () => clearInterval(h) }, [sent, reload])
  const send = async (e) => {
    e?.preventDefault(); setErr('')
    if (criar && kind !== 'criador' && !terms) { setErr('É preciso aceitar os Termos e a Política de Privacidade.'); return }
    if (STATIC) { // sem servidor: só o e-mail autorizado recebe o link de teste
      if (!(await isOwner(email))) { setErr('Na demonstração, o acesso por e-mail está liberado só para contas autorizadas.'); return }
      setSent({ demo: true }); setWait(30); return
    }
    try { setSent(await api('/auth/request', { method: 'POST', body: kind === 'explorador' ? { email, next: 'viewer', back: voltar } : kind === 'restaurante' ? { email, next: 'restaurante' } : { email } })); setWait(30) } catch (x) { setErr(x.message === 'email_invalido' ? 'Digite um e-mail válido.' : 'Não foi possível enviar. Tente de novo.') }
  }
  const openDemo = async () => { await api('/auth/demo-admin', { method: 'POST' }); await reload() }

  if (sent) return (
    <>
      <IconCircle n="mail" c="#d93a1c" bg="var(--accs)" />
      <h1 className="d s44">Link enviado</h1>
      <p className="mut">Abra o e-mail enviado para <b>{email}</b> e toque no botão para entrar. O link expira em 15 minutos.</p>
      <div className="card soft col" style={{ gap: 6 }}><b className="sm">Não chegou?</b><span className="sm mut">Confira o spam ou peça outro link em 30 segundos.</span></div>
      {(sent.devLink || sent.demo) && <Note>{sent.demo ? 'Modo demonstração: esta versão não envia e-mails.' : 'Modo desenvolvimento: este ambiente não envia e-mails.'} Use o botão abaixo para abrir o link de acesso.</Note>}
      <div className="col" style={{ gap: 10 }}>
        {sent.devLink && <a className="btn blk" href={sent.devLink}>Abrir o link (modo desenvolvimento)</a>}
        {sent.demo && <button type="button" className="btn blk" onClick={openDemo}>Abrir o link (modo demonstração)</button>}
        <button type="button" className="btn ln blk" disabled={wait > 0} onClick={() => send()}>{wait > 0 ? `Reenviar link (${wait}s)` : 'Reenviar link'}</button>
        <button type="button" className="link sm au-again" onClick={() => setSent(null)}>Usar outro e-mail</button>
      </div>
    </>
  )
  return (
    <form onSubmit={send} className="col" style={{ gap: 16 }}>
      <Head kind={kind} criar={criar}>{TEXT[kind][criar ? 1 : 0]}</Head>
      {qs.get('erro') === 'link' && <Note>Este link expirou ou já foi usado. Peça outro.</Note>}
      <Social kind={kind} criar={criar} voltar={voltar} />
      <Field label="E-mail" id="m"><div className="in f"><input id="m" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" required /></div></Field>
      {criar && kind !== 'criador' && <Check on={terms} onChange={setTerms}>Aceito os <b><Link to="/termos" target="_blank">Termos</Link></b> e a <b><Link to="/termos" target="_blank">Política de Privacidade</Link></b>.</Check>}
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn blk">{criar ? 'Criar conta com e-mail' : 'Continuar com e-mail'}</button>
      <span className="xs mut c">Enviamos um link de acesso, sem senha. Ele vale por 15 minutos e só funciona uma vez.</span>
      <Bottom kind={kind} criar={criar} voltar={voltar} />
    </form>
  )
}

// Criar conta de criador = pedir o mapa: o perfil é analisado antes de liberar
function ApplyForm({ me, voltar }) {
  const { reload } = useMe()
  const [minF, setMin] = useState(null)
  const [f, setF] = useState({ handle: '', email: me?.user?.email || '', tiktok: '', acceptTerms: true })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [demoDone, setDemoDone] = useState(false)
  useEffect(() => { api('/config').then((c) => setMin(c.minFollowers)).catch(() => {}) }, [])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (STATIC) { setDemoDone(true); return }
    setBusy(true)
    try {
      await api('/apply', { method: 'POST', body: f })
      try { sessionStorage.setItem('applied_email', f.email.trim().toLowerCase()) } catch { /* ok */ }
      navigate('/candidatura/enviada')
    } catch (x) {
      setErr({ email_invalido: 'Digite um e-mail válido.', handle_invalido: 'Use só letras, números, ponto e sublinhado no @.', tiktok_invalido: 'O @ do TikTok parece inválido.', aceite_obrigatorio: 'É preciso aceitar os Termos e a Política de Privacidade.', ja_existe: 'Já existe uma conta com este e-mail.', handle_em_uso: 'Este @ já tem uma conta.' }[x.message] || 'Não foi possível enviar. Tente de novo.')
    } finally { setBusy(false) }
  }
  if (demoDone) return (
    <>
      <IconCircle n="clock" c="#93370d" bg="var(--suns)" />
      <h1 className="d s44">Candidatura recebida</h1>
      <p className="mut">Estamos analisando o perfil <b>@{f.handle.replace(/^@/, '')}</b>. Conferimos o número de seguidores e se você é o titular. Quando for aprovado, entre com <b>{f.email}</b>.</p>
      <Note>Modo demonstração: nada foi enviado. Use o botão abaixo para ver o painel de exemplo.</Note>
      <div className="col" style={{ gap: 10 }}>
        <button type="button" className="btn blk" onClick={async () => { await api('/auth/demo', { method: 'POST' }); await reload() }}>Abrir o painel (modo demonstração)</button>
        <Link className="btn ln blk" to="/@demo">Ver o mapa de exemplo</Link>
      </div>
    </>
  )
  return (
    <form onSubmit={submit} className="col" style={{ gap: 16 }}>
      <Head kind="criador" criar>Conta de criador: você pede o seu mapa e analisamos o perfil.{minF != null && <> Mínimo de {num(minF)} seguidores.</>}</Head>
      <Social kind="criador" criar voltar={voltar} />
      <div className="au-two">
      <Field label="Seu @ no Instagram" id="a"><div className="in"><span className="mut">@</span><input id="a" value={f.handle} onChange={set('handle')} placeholder="seuperfil" autoComplete="off" required /></div></Field>
      <Field label="@ no TikTok (opcional)" id="t"><div className="in"><input id="t" value={f.tiktok} onChange={set('tiktok')} placeholder="@seuperfil" autoComplete="off" /></div></Field>
      </div>
      <Field label="E-mail" id="e"><div className="in"><input id="e" type="email" value={f.email} onChange={set('email')} placeholder="voce@email.com" autoComplete="email" required /></div></Field>
      <Check on={f.acceptTerms} onChange={(v) => setF({ ...f, acceptTerms: v })}>Sou o titular ou represento este perfil e aceito os <b><Link to="/termos" target="_blank">Termos</Link></b> e a <b><Link to="/termos" target="_blank">Política de Privacidade</Link></b>.</Check>
      {err && <p className="err" role="alert">{err} {err.includes('Já existe') && <Link className="link" to="/entrar">Entrar</Link>}</p>}
      <button className="btn blk" disabled={busy}>Pedir convite</button>
      <span className="xs mut c">Sem senha e sem cobrança nesta etapa.</span>
      <Bottom kind="criador" criar voltar={voltar} />
    </form>
  )
}

// Primeira tela de "Entrar": qual é o tipo de conta
const CHOICES = [
  ['criador', 'user', 'Sou criador', 'Tenho, ou quero ter, um mapa das minhas indicações, com painel, Estúdio de estilo e métricas.'],
  ['explorador', 'heart', 'Sou explorador', 'Quero salvar lugares dos mapas dos criadores e encontrar tudo num só lugar.'],
  ['restaurante', 'pin', 'Tenho um restaurante/estabelecimento', 'Quero ver quais criadores indicam o meu lugar e corrigir os dados exibidos.'],
]
function Choose() {
  return (
    <AuthFrame kind="escolha">
      <span className="eb">Entrar</span>
      <h1 className="d s44">Como você quer entrar?</h1>
      <p className="mut">Escolha o tipo de conta. Dá para ter mais de uma com o mesmo e-mail.</p>
      <div className="col" style={{ gap: 12 }}>
        {CHOICES.map(([k, ic, t, d]) => (
          <Link key={k} to={url(k, false)} className="card row au-opt" style={{ gap: 14, textDecoration: 'none', color: 'inherit' }}>
            <span className="av" style={{ flex: 'none' }}><Icon n={ic} s={20} c="currentColor" /></span>
            <div className="sp"><b>{t}</b><div className="sm mut">{d}</div></div>
            <Icon n="next" s={18} />
          </Link>))}
      </div>
      <Alt>Ainda não tem conta? Escolha o tipo e toque em <b>Criar conta</b>.</Alt>
    </AuthFrame>
  )
}

export function Login() {
  const { me } = useMe()
  const { search: qs } = useLocation() // reage à troca de ?criar= / ?como= sem recarregar
  const como = qs.get('como')
  const kind = como === 'explorador' || como === 'usuario' || qs.get('leitor') === '1' ? 'explorador' : como === 'restaurante' ? 'restaurante' : 'criador'
  const criar = qs.get('criar') === '1' || qs.get('novo') === '1'
  const escolher = !como && !criar && qs.get('leitor') !== '1' && !qs.get('erro')
  // volta só para um mapa (/@criador...) ou para os salvos
  const voltar = /^\/(@[a-z0-9_-]{1,40}(\/[a-z0-9\/_-]*)?|salvos)$/i.test(qs.get('voltar') || '') ? qs.get('voltar') : '/salvos'
  useTitle(`${criar ? (kind === 'criador' ? 'Pedir convite' : 'Criar conta') : 'Entrar'}${kind === 'explorador' ? ' de explorador' : kind === 'restaurante' ? ' de restaurante' : ''}`)
  useEffect(() => {
    if (!me?.user) return
    const home = homeFor(me)
    if (me.creator || home.startsWith('/restaurante') || home === '/admin') navigate(home, { replace: true }) // criador: painel ou etapa; restaurante e admin: o painel deles
    else if (escolher) navigate(home, { replace: true }) // já entrou: vai para o painel do tipo de conta
    else if (kind === 'restaurante') navigate('/restaurante', { replace: true })
    else if (kind === 'explorador') navigate(voltar, { replace: true }) // explorador: volta para onde estava
    else if (!criar) navigate(me.user.role === 'viewer' ? '/entrar?criar=1' : home, { replace: true }) // logado sem mapa: só falta pedir o seu
  }, [me, kind, criar, voltar, escolher])
  if (escolher) return <Choose />
  return (
    <AuthFrame kind={kind}>
      {criar && kind === 'criador' ? <ApplyForm me={me} voltar={voltar} /> : <EmailForm key={`${kind}${criar}`} kind={kind} criar={criar} voltar={voltar} />}
    </AuthFrame>
  )
}

// Atalhos de teste da demonstração publicada: entram direto no painel do criador ou no espaço do explorador (dados fictícios).
// /painel-teste-usuario (criador) · /painel-teste-explorador · /painel-teste-restaurante · /painel-teste-admin
export function TestEntry({ kind }) {
  const { reload } = useMe()
  useEffect(() => {
    if (!STATIC) { navigate('/', { replace: true }); return }
    ;(async () => {
      await api('/auth/logout', { method: 'POST' })
      if (kind === 'explorador') {
        try { if (!localStorage.getItem('wagli_saved_demo')) localStorage.setItem('wagli_saved_demo', '[1,2,5,9]') } catch { /* ok */ }
        await api('/auth/demo-explorador', { method: 'POST', body: { email: 'explorador@teste.wagli' } })
      } else if (kind === 'restaurante') await api('/auth/demo-restaurante', { method: 'POST' })
      else if (kind === 'admin') await api('/auth/demo-admin', { method: 'POST' })
      else await api('/auth/demo', { method: 'POST' })
      await reload()
      navigate({ explorador: '/salvos', restaurante: '/restaurante', admin: '/admin' }[kind] || '/painel', { replace: true })
    })()
  }, [])
  return <div className="pad" style={{ padding: 32 }}>Abrindo o painel de teste…</div>
}
