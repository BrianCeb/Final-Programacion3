import { forwardRef, memo } from 'react';
import { Link } from 'react-router-dom';
import Insignia from './Insignia.jsx';
import { formatoHora } from '../utils/fechas.js';

const TomaItem = forwardRef(function TomaItem(
  { toma, estado, puedeRegistrar, ocupado, onRegistrar, onOmitir, mostrarPaciente = true },
  ref
) {
  const { tratamiento, paciente } = toma;
  const pendiente = toma.estado === 'pendiente';

  return (
    <li ref={ref} className={`toma toma-${estado}`}>
      <time className="toma-hora" dateTime={toma.fechaHora}>{formatoHora(toma.fechaHora)}</time>

      <div className="toma-info">
        {mostrarPaciente && paciente && (
          <Link to={`/pacientes/${paciente._id}`} className="toma-paciente">
            {paciente.apellido}, {paciente.nombre}
            {paciente.habitacion && <span className="tenue"> · Hab. {paciente.habitacion}</span>}
          </Link>
        )}
        <div>
          <strong>{tratamiento?.medicamento?.nombre ?? 'Medicamento'}</strong>{' '}
          <span className="tenue">{tratamiento?.medicamento?.presentacion}</span>
        </div>
        <div className="tenue">
          {tratamiento?.dosis}
          {tratamiento?.indicaciones && ` — ${tratamiento.indicaciones}`}
        </div>
        {!pendiente && toma.registradoPor && (
          <div className="toma-auditoria">
            Registrada por {toma.registradoPor.nombre} a las {formatoHora(toma.registradoEn)}
            {toma.observacion && ` · "${toma.observacion}"`}
          </div>
        )}
      </div>

      <div className="toma-acciones">
        <Insignia estado={estado} />
        {pendiente && puedeRegistrar && estado !== 'proxima' && (
          <div className="botones">
            <button type="button" className="btn btn-exito" disabled={ocupado} onClick={() => onRegistrar(toma._id)}>
              {ocupado ? 'Guardando…' : 'Dar toma'}
            </button>
            <button type="button" className="btn btn-secundario" disabled={ocupado} onClick={() => onOmitir(toma)}>
              Omitir
            </button>
          </div>
        )}
      </div>
    </li>
  );
});

export default memo(TomaItem);