// Painéis no estilo combinado (mesma organização; tipografia leve e cartões sem sombra) e a escolha do mapa.
import { useEffect } from 'react'
import { useLocation } from './router.jsx'
import './skin.css'

const PANEL = /^\/(painel|estudio|salvos|restaurante|restaurantes|admin|revisar|adicionar)(\/|$)/
// mapa novo ou antigo: a mesma escolha de ?visual= no mapa público
export const newMap = () => { try { return sessionStorage.getItem('joymap:mapa') !== 'antigo' } catch { return true } }

export function Skin() {
  const { path } = useLocation()
  const here = PANEL.test(path)
  useEffect(() => { document.body.classList.toggle('skin-new', here); return () => document.body.classList.remove('skin-new') }, [here])
  return null
}
