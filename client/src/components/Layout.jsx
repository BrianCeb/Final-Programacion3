import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { NOMBRE_ROL } from '../utils/permisos.js';

const ENLACES = [
  { a: '/', texto: 'Inicio', icono: '🏠', roles: ['admin', 'medico', 'enfermero'] },
  { a: '/agenda', texto: 'Agenda del día', icono: '🕒', roles: ['admin', 'medico', 'enfermero'] },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const salir = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app">
      <header className="barra-superior">
        <button type="button" className="btn-icono menu-movil" onClick={() => setMenuAbierto((v) => !v)} aria-label="Abrir menú" aria-expanded={menuAbierto}>
          ☰
        </button>
        <div className="marca">
          <span className="logo" aria-hidden="true">✚</span> MediControl
        </div>
        <div className="usuario-actual">
          <span>
            {usuario.nombre} <span className={`rol rol-${usuario.rol}`}>{NOMBRE_ROL[usuario.rol]}</span>
          </span>
          <button type="button" className="btn btn-secundario btn-chico" onClick={salir}>Salir</button>
        </div>
      </header>

      <nav className={`menu ${menuAbierto ? 'abierto' : ''}`} aria-label="Principal">
        {ENLACES.filter((e) => e.roles.includes(usuario.rol)).map((e) => (
          <NavLink key={e.a} to={e.a} end={e.a === '/'} onClick={() => setMenuAbierto(false)}>
            <span aria-hidden="true">{e.icono}</span> {e.texto}
          </NavLink>
        ))}
      </nav>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}
