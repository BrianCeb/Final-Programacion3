import { useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import Campo from './Campo.jsx';
import Mensaje from './Mensaje.jsx';
import { formatoHora } from '../utils/fechas.js';

const MOTIVOS_RAPIDOS = ['El paciente rechazó la medicación', 'Paciente en ayunas por estudio', 'Paciente dormido', 'Vómitos'];

export default function ModalOmitir({ toma, errorServidor, onConfirmar, onCerrar }) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (toma) {
      setMotivo('');
      setError('');
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [toma]);

  const enviar = (e) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError('Indicá por qué se omite la toma');
      textareaRef.current.focus();
      return;
    }
    onConfirmar(toma._id, motivo.trim());
  };

  return (
    <Modal abierto={Boolean(toma)} titulo="Omitir toma" onCerrar={onCerrar}>
      {toma && (
        <form onSubmit={enviar} className="formulario">
          <p className="tenue">
            {toma.tratamiento?.medicamento?.nombre} de las {formatoHora(toma.fechaHora)}
            {toma.paciente && ` — ${toma.paciente.apellido}, ${toma.paciente.nombre}`}
          </p>
          <Mensaje tipo="error">{errorServidor}</Mensaje>
          <div className="chips">
            {MOTIVOS_RAPIDOS.map((m) => (
              <button key={m} type="button" className="chip" onClick={() => { setMotivo(m); setError(''); }}>
                {m}
              </button>
            ))}
          </div>
          <Campo
            como="textarea"
            etiqueta="Motivo"
            ref={textareaRef}
            rows={3}
            value={motivo}
            onChange={(e) => { setMotivo(e.target.value); setError(''); }}
            error={error}
          />
          <div className="botones botones-fin">
            <button type="button" className="btn btn-secundario" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-peligro">Registrar como omitida</button>
          </div>
        </form>
      )}
    </Modal>
  );
}