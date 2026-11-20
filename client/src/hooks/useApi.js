import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { llamarApi } from '../utils/api.js';

// Custom hook: devuelve una función "pedir" que ya incluye el token del usuario logueado.
// Si el backend responde 401 (token vencido), cierra la sesión automáticamente.
//
// Uso:  const pedir = useApi();
//       const pacientes = await pedir('/pacientes');
//       await pedir('/pacientes', { method: 'POST', body: datos });
export function useApi() {
  const { token, logout } = useAuth();

  return useCallback(
    async (url, opciones = {}) => {
      try {
        return await llamarApi(url, { ...opciones, token });
      } catch (error) {
        if (error.status === 401) logout();
        throw error;
      }
    },
    [token, logout]
  );
}
