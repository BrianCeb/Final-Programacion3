export function manejarErrores(err, req, res, next) {

  if (err.name === 'ValidationError') {
    const errores = {};
    for (const [campo, e] of Object.entries(err.errors)) errores[campo] = e.message;
    return res.status(400).json({ mensaje: 'Hay datos inválidos', errores });
  }

  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ mensaje: `Ya existe un registro con ese ${campo}` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: 'Identificador inválido' });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    mensaje: status === 500 ? 'Error interno del servidor' : err.message,
    ...(err.detalle && { detalle: err.detalle }),
  });
}

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.originalUrl}` });
}
