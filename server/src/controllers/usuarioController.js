import Usuario, { ROLES } from '../models/Usuario.js';
import { asyncHandler, ErrorHttp } from '../utils/asyncHandler.js';

export const listarUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.find().sort({ nombre: 1 });
  res.json(usuarios);
});

export const actualizarUsuario = asyncHandler(async (req, res) => {
  const { rol, activo } = req.body;

  if (req.params.id === String(req.usuario._id)) {
    throw new ErrorHttp(400, 'No podés modificar tu propio usuario');
  }
  if (rol !== undefined && !ROLES.includes(rol)) throw new ErrorHttp(400, 'Rol inválido');

  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) throw new ErrorHttp(404, 'Usuario no encontrado');

  if (rol !== undefined) usuario.rol = rol;
  if (activo !== undefined) usuario.activo = Boolean(activo);
  await usuario.save();
  res.json(usuario);
});