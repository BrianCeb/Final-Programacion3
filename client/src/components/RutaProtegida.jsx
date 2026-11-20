import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Cargando from './Cargando.jsx';


export default function RutaProtegida({ roles }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Cargando texto="Verificando sesión..." />;

  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;

  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/sin-permiso" replace />;

  return <Outlet />;
}
