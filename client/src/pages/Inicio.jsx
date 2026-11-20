import { useAuth } from '../context/AuthContext.jsx';
import { NOMBRE_ROL } from '../utils/permisos.js';

export default function Inicio() {
    const { usuario } = useAuth();

    return (
        <section>
            <h1>Bienvenido, {usuario.nombre}</h1>
            <p className="tenue">Ingresaste como {NOMBRE_ROL[usuario.rol]}</p>
        </section>
    );
}