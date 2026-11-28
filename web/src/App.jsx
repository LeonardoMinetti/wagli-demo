import React from 'react'
import { useLocation, Redirect, Toaster } from './lib/router.jsx'
import { MeProvider, useMe } from './lib/me.jsx'
import { Loading, Guard } from './lib/ui.jsx'
import * as Site from './pages/Site.jsx'
import * as On from './pages/Onboarding.jsx'
import * as Au from './pages/Auth.jsx'
import * as Build from './pages/Build.jsx'
import * as St from './pages/Studio.jsx'
import * as Pn from './pages/Panel.jsx'
import * as Net from './pages/Network.jsx'
import * as Ad from './pages/Admin.jsx'
import { Voo } from './pages/Voo.jsx'
import Saved from './pages/Saved.jsx'
import { Guides, AdminGuides } from './pages/Guides.jsx'
import { RestaurantsLanding } from './landing/restaurants.jsx'
import Public from './pub/Public.jsx'
import { Skin } from './lib/skin.jsx'
import { STATIC } from './lib/base.js'
import { api } from './api.js'
import { TIERS, TIER_NAMES } from '../../server/plans.js'
import { isCreatorPath } from './lib/demoCreator.js'

const STATIC_OK = new Set(['/', '/roteirosjoy', '/miniguias', '/admin/miniguias', '/admin/lugares', '/admin/coletas', '/entrar', '/candidatura', '/rede', '/rede/lugar', '/admin/rede', '/admin/rede/lugar', '/restaurante/conta', '/painel-teste-restaurante', '/painel-teste-admin', '/restaurantes', '/restaurante', '/restaurante/percepcao', '/voo', '/admin', '/admin/mapas', '/admin/moderacao', '/admin/metricas', '/admin/criadores', '/admin/denuncias', '/painel-teste-usuario', '/painel-teste-explorador', '/salvos', '/salvos/criadores', '/salvos/conta', '/para-restaurantes', '/planos', '/perguntas', '/exemplos', '/termos', '/indisponivel'])

const ST = (el) => <St.StudioRoute>{el}</St.StudioRoute>
const ROUTES = {
  '/': <Site.Landing />, '/voo': <Voo />, '/salvos': <Saved />, '/painel-teste-usuario': <Au.TestEntry kind="criador" />, '/painel-teste-explorador': <Au.TestEntry kind="explorador" />, '/salvos/criadores': <Saved tab="criadores" />, '/salvos/conta': <Saved tab="conta" />, '/planos': <Site.Plans />, '/exemplos': <Site.Examples />, '/termos': <Site.Terms />, '/perguntas': <Site.Faq />, '/indisponivel': <Site.Unavailable />,
  '/candidatura': <Redirect to="/entrar?criar=1" />, '/candidatura/enviada': <On.ApplyStatus sent />, '/candidatura/status': <On.ApplyStatus />, '/candidatura/aprovado': <On.Approved />, '/entrar': <Au.Login />,
  '/conectar/instagram': <On.ConnectInstagram />, '/conectar/tiktok': <On.ConnectTikTok />, '/consentimentos': <On.Consents />, '/plano': <On.ChoosePlan />, '/pagamento': <On.Payment />, '/boas-vindas': <On.Welcome />,
  '/montando': <Build.Building />, '/previa': <Build.Preview />, '/revisar': <Build.Review />, '/adicionar': <Build.AddPlace />, '/sem-lugar': <Build.Unresolved />, '/unidades': <Build.Units />,
  '/publicar': <Build.Publish />, '/publicado': <Build.Published />, '/colar-posts': <Build.PastePosts />,
  '/painel': <Pn.Overview />, '/painel/buscas': <Pn.Searches />, '/painel/lugares': <Pn.PlacesPage />, '/painel/audiencia': <Redirect to="/painel" />, '/painel/atualizar': <Redirect to="/painel/lugares?atualizar=1" />, '/painel/divulgar': <Pn.Promote />,
  '/painel/roteiros': <Pn.Roteiros />, '/painel/listas': <Redirect to="/painel/roteiros" />, '/painel/contas': <Pn.Accounts />, '/painel/privacidade': <Pn.Privacy />, '/painel/plano': <Pn.Billing />, '/painel/conta': <Pn.Account />,
  '/estudio': ST(<St.StudioHome />), '/estudio/modelos': <Redirect to="/estudio" />, '/estudio/cores': ST(<St.StudioColors />), '/estudio/categorias': ST(<St.StudioCategories />), '/estudio/simbolos': <Redirect to="/estudio/pins" />,
  '/estudio/mapa': ST(<St.StudioMap />), '/estudio/pins': ST(<St.StudioPins />), '/estudio/layout': <Redirect to="/estudio" />, '/estudio/links': <Redirect to="/estudio" />, '/estudio/endereco': <Redirect to="/painel/divulgar" />,
  '/rede': <Net.HardRedirect to="/admin/rede" />, '/rede/lugar': <Net.HardRedirect to="/admin/rede/lugar" />, '/admin/rede': <Redirect to="/admin/lugares?aba=rede" />, '/admin/rede/lugar': <Net.AdminNetworkPlace />, '/restaurante/conta': <Net.RestaurantAccount />, '/painel-teste-restaurante': <Au.TestEntry kind="restaurante" />, '/painel-teste-admin': <Au.TestEntry kind="admin" />, '/restaurantes': <Net.Claim />, '/para-restaurantes': <RestaurantsLanding />, '/restaurante': <Net.RestaurantPanel />, '/restaurante/percepcao': <Net.Perception />,
  '/admin': <Ad.Home />, '/admin/criadores': <Ad.Creators />, '/admin/lugares': <Ad.Places />, '/admin/denuncias': <Ad.Reports />, '/admin/mapas': <Redirect to="/admin/lugares?aba=revisar" />, '/admin/coletas': <Redirect to="/admin/criadores?aba=coletados" />, '/admin/miniguias': <AdminGuides />, '/roteirosjoy': <Guides />, '/miniguias': <Redirect to="/roteirosjoy" />, '/admin/moderacao': <Redirect to="/admin/denuncias" />, '/admin/metricas': <Ad.Metrics />,
}

// Páginas do site: entram com um fade curto (as telas do painel e do estúdio ficam como estão, para não perder estado)
const SITE = new Set(['/', '/roteirosjoy', '/planos', '/perguntas', '/exemplos', '/termos'])
function Routes() {
  const { path } = useLocation()
  const { me } = useMe()
  // domínio próprio: o servidor injeta o slug e a página do criador atende a raiz do domínio
  if (window.__SLUG__) return <Public slug={window.__SLUG__} />
  const pub = path.match(/^\/@([a-z0-9_-]+)(\/.*)?$/i)
  if (pub) return <Public slug={pub[1].toLowerCase()} />
  if (me === undefined) return <Loading />
  if (STATIC && !STATIC_OK.has(path) && !isCreatorPath(path)) return ROUTES[path] || path.startsWith('/revisar/') ? <Site.StaticNotice /> : <Redirect to="/" />
  const ed = path.match(/^\/revisar\/(\d+)$/)
  if (ed) return <Build.EditPlace id={ed[1]} />
  const el = ROUTES[path]
  if (!el) return <Redirect to="/" />
  return SITE.has(path) ? <div key={path} className="rt">{el}</div> : el
}
// Versão estática: avisa que o painel é uma demonstração e deixa recomeçar ou sair
function DemoBar() {
  const { me, reload } = useMe()
  const { path } = useLocation()
  const show = STATIC && !!me?.user && !path.startsWith('/@')
  // a faixa não ocupa espaço no fim da página (isso deixava o menu lateral curto): só ganha folga no conteúdo
  React.useEffect(() => { document.body.classList.toggle('has-demobar', show); return () => document.body.classList.remove('has-demobar') }, [show])
  if (!show) return null
  return (
    <>
    <div role="status" className="demobar" style={{ position: 'fixed', left: '50%', bottom: 14, transform: 'translateX(-50%)', zIndex: 60, maxWidth: 'calc(100vw - 24px)', background: '#171717', color: '#fff', borderRadius: 999, padding: '8px 10px 8px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}>
      <span><b>Demonstração.</b> {(path === '/admin/lugares' && /^(|\?aba=base)$/.test(location.search)) || (path === '/admin/criadores' && location.search.includes('coletados')) ? 'Aqui os dados são reais; as alterações ficam neste navegador.' : 'Dados fictícios, salvos só nesta aba.'}</span>
      {me.creator?.plan && <label className="row" style={{ gap: 6 }}><span>Plano</span><select aria-label="Plano na demonstração" value={me.creator.plan.tier} onChange={async (e) => { await api('/creator/plan-demo', { method: 'PUT', body: { tier: e.target.value } }); await reload() }} style={{ background: '#3a3a3a', color: '#fff', border: 0, borderRadius: 999, padding: '6px 10px', font: 'inherit' }}>{TIERS.map((t) => <option key={t} value={t}>{TIER_NAMES[t]}</option>)}</select></label>}
    </div>
    </>
  )
}
export default function App() { return <MeProvider><Routes /><DemoBar /><Skin /><Toaster /></MeProvider> }
