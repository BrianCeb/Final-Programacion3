import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <section className="pagina-estado">
      <span className="codigo">404</span>
      <h1>Página no encontrada</h1>
      <Link to="/" className="btn btn-primario">Ir al inicio</Link>
    </section>
  );
}
