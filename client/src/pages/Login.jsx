import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import Campo from '../components/Campo.jsx';
import Mensaje from '../components/Mensaje.jsx';

const validar = ({ email, password }) => ({
  email: !email.trim() ? 'Ingresá tu email' : !/^\S+@\S+\.\S+$/.test(email) ? 'El email no es válido' : undefined,
  password: !password ? 'Ingresá tu contraseña' : undefined,
});

const USUARIOS_DEMO = [
  { rol: 'Admin', email: 'admin@medicontrol.com' },
  { rol: 'Médico', email: 'medico@medicontrol.com' },
  { rol: 'Enfermero', email: 'enfermero@medicontrol.com' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { valores, setValores, errores, cambiar, validarTodo } = useFormulario({ email: '', password: '' }, validar);
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);
  const emailRef = useRef(null);

  // Al entrar a la pantalla, el cursor queda directo en el email
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    if (!validarTodo()) return;
    setEnviando(true);
    try {
      await login(valores.email, valores.password);
      // Volvemos a la página que quería ver antes de que lo mandáramos al login
      navigate(location.state?.desde || '/', { replace: true });
    } catch (err) {
      setErrorServidor(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-acceso">
      <form className="tarjeta tarjeta-acceso formulario" onSubmit={enviar} noValidate>
        <div className="marca marca-grande"><span className="logo">✚</span> MediControl</div>
        <h1>Iniciar sesión</h1>
        <Mensaje tipo="error">{errorServidor}</Mensaje>
        <Campo etiqueta="Email" name="email" type="email" autoComplete="email" ref={emailRef}
          value={valores.email} onChange={cambiar} error={errores.email} />
        <Campo etiqueta="Contraseña" name="password" type="password" autoComplete="current-password"
          value={valores.password} onChange={cambiar} error={errores.password} />
        <button className="btn btn-primario btn-ancho" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
        <p className="centrado">¿No tenés cuenta? <Link to="/registro">Registrate</Link></p>

        <div className="demo">
          <p className="tenue">Usuarios de prueba (contraseña <code>123456</code>):</p>
          <div className="chips">
            {USUARIOS_DEMO.map((u) => (
              <button key={u.email} type="button" className="chip"
                onClick={() => setValores({ email: u.email, password: '123456' })}>
                {u.rol}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
