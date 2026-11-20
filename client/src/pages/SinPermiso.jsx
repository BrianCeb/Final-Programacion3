import { Link } from 'react-router-dom';

export default function SinPermiso() {
  return (
    <section className="pagina-estado">
      <span className="codigo">403</span>
      <h1>No tenés permiso para ver esta página</h1>
      <p className="tenue">Si creés que es un error, pedile a un administrador que revise tu rol.</p>
      <Link to="/" className="btn btn-primario">Volver a la agenda</Link>
    </section>
  );
}
