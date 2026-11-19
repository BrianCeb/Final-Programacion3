import Usuario from '../models/Usuario.js';
import { generarToken } from '../middleware/auth.js';
import { asyncHandler, ErrorHttp } from '../utils/asyncHandler.js';


const usuarioPublico = (u) => ({ id: u._id, nombre: u.nombre, email: u.email, rol: u.rol });


export const registro = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!password || password.length < 6) {
    throw new ErrorHttp(400, 'La contraseña debe tener al menos 6 caracteres');
  }
  if (!nombre || nombre.trim().length < 3) {
  throw new ErrorHttp(400, 'El nombre debe tener al menos 3 caracteres');
}
  const usuario = await Usuario.create({ nombre, email, password, rol: 'enfermero' });
  res.status(201).json({ token: generarToken(usuario), usuario: usuarioPublico(usuario) });
});


export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ErrorHttp(400, 'Email y contraseña son obligatorios');


  const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+password');


  if (!usuario || !(await usuario.compararPassword(password))) {
    throw new ErrorHttp(401, 'Email o contraseña incorrectos');
  }
  if (!usuario.activo) throw new ErrorHttp(403, 'Tu usuario está desactivado');

  res.json({ token: generarToken(usuario), usuario: usuarioPublico(usuario) });
});


export const yo = asyncHandler(async (req, res) => {
  res.json({ usuario: usuarioPublico(req.usuario) });
});
