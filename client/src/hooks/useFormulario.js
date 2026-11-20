import { useCallback, useState } from 'react';

// Custom hook para manejar cualquier formulario.
//  - valoresIniciales: { campo: valor }
//  - validar: función (valores) => { campo: 'mensaje de error' }
//
// Uso:
//   const { valores, errores, cambiar, validarTodo } = useFormulario({ email: '' }, validar);
//   <input name="email" value={valores.email} onChange={cambiar} />
export function useFormulario(valoresIniciales, validar = () => ({})) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});

  // Un único handler para todos los inputs: usa el atributo "name" para saber qué campo cambiar
  const cambiar = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValores((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Al corregir un campo, borramos su error
    setErrores((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  // Devuelve true si no hay errores
  const validarTodo = useCallback(() => {
    const nuevos = validar(valores);
    setErrores(nuevos);
    return Object.values(nuevos).every((e) => !e);
  }, [validar, valores]);

  const reiniciar = useCallback((nuevos = valoresIniciales) => {
    setValores(nuevos);
    setErrores({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { valores, setValores, errores, setErrores, cambiar, validarTodo, reiniciar };
}
