import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { llamarApi } from '../utils/api.js';

const CLAVE_TOKEN = 'medicontrol_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CLAVE_TOKEN));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true); 
  const logout = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN);
    setToken(null);
    setUsuario(null);
  }, []);

  const guardarSesion = useCallback(({ token, usuario }) => {
    localStorage.setItem(CLAVE_TOKEN, token);
    setToken(token);
    setUsuario(usuario);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const datos = await llamarApi('/auth/login', { method: 'POST', body: { email, password } });
      guardarSesion(datos);
      return datos.usuario;
    },
    [guardarSesion]
  );

  const registro = useCallback(
    async (nombre, email, password) => {
      const datos = await llamarApi('/auth/registro', { method: 'POST', body: { nombre, email, password } });
      guardarSesion(datos);
      return datos.usuario;
    },
    [guardarSesion]
  );

  useEffect(() => {
    if (!token) {
      setCargando(false);
      return;
    }
    let cancelado = false; 
    llamarApi('/auth/me', { token })
      .then((datos) => !cancelado && setUsuario(datos.usuario))
      .catch(() => !cancelado && logout())
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, []);

  const value = useMemo(
    () => ({ usuario, token, cargando, login, registro, logout }),
    [usuario, token, cargando, login, registro, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
