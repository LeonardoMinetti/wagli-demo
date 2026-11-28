// Entrar (ou ver a conta) sem sair do mapa: folha de baixo no celular, janela no computador.
import React, { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useMe } from '../lib/me.jsx'
import { Link, toast } from '../lib/router.jsx'
import { Icon } from '../lib/icons.jsx'
import { STATIC } from '../lib/base.js'
import { Google, isOwner } from '../pages/Auth.jsx'
import { initial } from '../theme.jsx'

export default function MapLogin({ creator, slug, savedCount, onSaved, onClose }) {
  const { me, reload } = useMe()
  const user = me?.user
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [google, setGoogle] = useState(false)
  const back = `/@${slug}`
  const first = creator.displayName.split(' ')[0]
  useEffect(() => { if (!STATIC) api('/config').then((c) => setGoogle(!!c.providers?.google)).catch(() => {}) }, [])
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  // o link pode ser aberto em outra aba: esta tela percebe a entrada sem a pessoa sair do mapa
  useEffect(() => { if (!sent || user) return; const h = setInterval(() => reload(), 3500); return () => clearInterval(h) }, [sent, user, reload])
  useEffect(() => { if (sent && user) { toast('Pronto, você entrou'); onClose() } }, [user])

  const send = async (e) => {
    e.preventDefault(); setMsg('')
    const m = email.trim().toLowerCase()
    if (STATIC) { // sem servidor: mesma regra da tela de entrada
      if (!(await isOwner(m))) { setMsg('As contas ainda não abriram. Por enquanto, seus salvos ficam guardados neste aparelho.'); return }
      setSent({ demo: true }); return
    }
    setBusy(true)
    try { setSent(await api('/auth/request', { method: 'POST', body: { email: m, next: 'viewer', back } })) } catch (x) { setMsg(x.message === 'email_invalido' ? 'Digite um e-mail válido.' : 'Não foi possível enviar. Tente de novo.') }
    setBusy(false)
  }
  // só no protótipo e na demonstração: completa a entrada sem enviar nada
  const simulate = async () => { await api('/auth/demo-explorador', { method: 'POST', body: { email: 'explorador@teste.wagli' } }); setSent({ demo: true }); await reload() }
  const out = async () => { await api('/auth/logout', { method: 'POST' }); await reload(); toast('Você saiu'); onClose() }

  return (
    <div className="ml" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ml-box" role="dialog" aria-modal="true" aria-label={user ? 'Sua conta' : 'Entrar'}>
        <button type="button" className="ml-x" aria-label="Fechar" onClick={onClose}><Icon n="close" s={18} c="currentColor" /></button>
        {user ? <>
          <span className="ml-av">{initial(user.email)}</span>
          <h2 className="pt">Sua conta</h2>
          <p className="ml-mut">{user.email}</p>
          <button type="button" className="ml-btn" onClick={() => { onSaved(); onClose() }}><Icon n="heart" s={16} c="currentColor" />Ver salvos deste mapa{savedCount ? ` · ${savedCount}` : ''}</button>
          <Link className="ml-btn line" to={me.creator ? '/painel' : '/salvos'}>{me.creator ? 'Ir ao meu painel' : 'Salvos de todos os mapas'}</Link>
          <button type="button" className="ml-link" onClick={out}>Sair</button>
        </> : sent ? <>
          <span className="ml-av"><Icon n="mail" s={22} c="currentColor" /></span>
          <h2 className="pt">Confira seu e-mail</h2>
          <p className="ml-mut">Toque no link que enviamos para <b>{email}</b>. Ele vale por 15 minutos. Você pode continuar vendo o mapa.</p>
          {sent.devLink && <a className="ml-btn" href={sent.devLink}>Abrir o link (modo desenvolvimento)</a>}
          {sent.demo && <button type="button" className="ml-btn" onClick={simulate}>Abrir o link (modo demonstração)</button>}
          <button type="button" className="ml-link" onClick={() => setSent(null)}>Usar outro e-mail</button>
        </> : <>
          <span className="ml-av"><Icon n="heart" s={22} c="currentColor" /></span>
          <h2 className="pt">Guarde seus lugares</h2>
          <p className="ml-mut">Entre para salvar os lugares de {first} e vê-los em qualquer aparelho. Sem senha.{savedCount === 1 ? ' O lugar que você já salvou vai junto.' : savedCount ? ` Os ${savedCount} que você já salvou vão junto.` : ''}</p>
          {google && <a className="ml-btn line" href={`/api/auth/google?${new URLSearchParams({ as: 'viewer', back })}`}><Google />Continuar com Google</a>}
          <form onSubmit={send}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" aria-label="Seu e-mail" autoComplete="email" />
            <button className="ml-btn" disabled={busy}>{busy ? 'Enviando…' : 'Receber link de acesso'}</button>
          </form>
          {msg && <p className="ml-err" role="alert">{msg}</p>}
          <p className="ml-fine">Ao continuar, você aceita os <a href={`${import.meta.env.BASE_URL}termos`} target="_blank" rel="noopener noreferrer">Termos e a Política de Privacidade</a>.</p>
          <button type="button" className="ml-link" onClick={onClose}>Agora não, continuar no mapa</button>
        </>}
      </div>
    </div>
  )
}
