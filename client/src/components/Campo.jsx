import { forwardRef, useId } from 'react';

const Campo = forwardRef(function Campo({ etiqueta, error, ayuda, como = 'input', children, ...props }, ref) {
  const id = useId();
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const Control = como;

  return (
    <div className={`campo ${error ? 'campo-con-error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      <Control
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={[error && idError, ayuda && idAyuda].filter(Boolean).join(' ') || undefined}
        {...props}
      >
        {children}
      </Control>
      {ayuda && !error && <small id={idAyuda} className="ayuda">{ayuda}</small>}
      {error && <small id={idError} className="error-campo">{error}</small>}
    </div>
  );
});

export default Campo;
