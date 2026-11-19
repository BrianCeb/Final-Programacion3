import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { asyncHandler, ErrorHttp } from '../utils/asyncHandler.js';

export const verificarToken = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');
  if (tipo !== 'Bearer' || !token) throw new ErrorHttp(401, 'No autenticado');

  let datos;
  try {
    datos = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ErrorHttp(401, 'Sesión vencida o token inválido');
  }

  const usuario = await Usuario.findById(datos.id);
  if (!usuario || !usuario.activo) throw new ErrorHttp(401, 'Usuario inexistente o desactivado');

  req.usuario = usuario;
  next();
});


export const permitirRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return next(new ErrorHttp(403, 'No tenés permiso para realizar esta acción'));
  }
  next();
};

export function generarToken(usuario) {
  return jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRA || '8h',
  });
}
