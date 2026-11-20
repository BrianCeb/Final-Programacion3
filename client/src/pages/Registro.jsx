import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import Campo from '../components/Campo.jsx';
import Mensaje from '../components/Mensaje.jsx';

const validar = ({ nombre, email, password, confirmar }) => ({
  nombre: nombre.trim().length < 3 ? 'Ingresá tu nombre completo' : undefined,
  email: !/^\S+@\S+\.\S+$/.test(email) ? 'El email no es válido' : undefined,
  password: password.length < 6 ? 'Mínimo 6 caracteres' : undefined,
  confirmar: confirmar !== password ? 'Las contraseñas no coinciden' : undefined,
});

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const { valores, errores, setErrores, cambiar, validarTodo } = useFormulario(
    { nombre: '', email: '', password: '', confirmar: '' },
    validar
  );
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    if (!validarTodo()) return;
    setEnviando(true);
    try {
      await registro(valores.nombre.trim(), valores.email, valores.password);
      navigate('/', { replace: true });
    } catch (err) {
      // Si el backend devuelve errores por campo, los mostramos debajo de cada input
      if (err.datos?.errores) setErrores(err.datos.errores);
      setErrorServidor(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-acceso">
      <form className="tarjeta tarjeta-acceso formulario" onSubmit={enviar} noValidate>
        <div className="marca marca-grande"><span className="logo">✚</span> control-medicamentos</div>
        <h1>Crear cuenta</h1>
        <Mensaje tipo="info">Las cuentas nuevas se crean con rol Enfermero/a. Un administrador puede cambiarlo.</Mensaje>
        <Mensaje tipo="error">{errorServidor}</Mensaje>
        <Campo etiqueta="Nombre y apellido" name="nombre" autoComplete="name" value={valores.nombre} onChange={cambiar} error={errores.nombre} />
        <Campo etiqueta="Email" name="email" type="email" autoComplete="email" value={valores.email} onChange={cambiar} error={errores.email} />
        <Campo etiqueta="Contraseña" name="password" type="password" autoComplete="new-password" value={valores.password} onChange={cambiar} error={errores.password} />
        <Campo etiqueta="Repetir contraseña" name="confirmar" type="password" autoComplete="new-password" value={valores.confirmar} onChange={cambiar} error={errores.confirmar} />
        <button className="btn btn-primario btn-ancho" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Registrarme'}
        </button>
        <p className="centrado">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
      </form>
    </div>
  );
}
