const ICONOS = { error: '⛔', exito: '✅', aviso: '⚠️', info: 'ℹ️' };

export default function Mensaje({ tipo = 'info', children, onCerrar }) {
  if (!children) return null;
  return (
    <div className={`mensaje mensaje-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{ICONOS[tipo]}</span>
      <div className="mensaje-texto">{children}</div>
      {onCerrar && (
        <button type="button" className="btn-icono" onClick={onCerrar} aria-label="Cerrar aviso">
          ✕
        </button>
      )}
    </div>
  );
}
