import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import './AppLayout.css'

export default function AppLayout() {
  return (
    <>
      <div className="app-shell">
        <Nav />
      </div>
      <Outlet />
    </>
  )
}
