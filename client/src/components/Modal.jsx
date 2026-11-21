import { useEffect, useRef } from 'react';

export default function Modal({ abierto, titulo, onCerrar, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (abierto && !dialog.open) dialog.showModal(); // abre, enfoca y bloquea el fondo
    if (!abierto && dialog.open) dialog.close();
  }, [abierto]);

  return (
    <dialog ref={dialogRef} className="modal" onCancel={(e) => { e.preventDefault(); onCerrar(); }}>
      <div className="modal-encabezado">
        <h2>{titulo}</h2>
        <button type="button" className="btn-icono" onClick={onCerrar} aria-label="Cerrar">✕</button>
      </div>
      {abierto && children}
    </dialog>
  );
}