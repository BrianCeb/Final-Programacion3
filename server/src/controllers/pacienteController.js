import Paciente from '../models/Paciente.js';
import { asyncHandler, ErrorHttp } from '../utils/asyncHandler.js';

export const listarPacientes = asyncHandler(async (req, res) => {
  const filtro = { activo: true };
  if (req.query.buscar) {
    const texto = req.query.buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(texto, 'i');
    filtro.$or = [{ nombre: regex }, { apellido: regex }, { dni: regex }];
  }
  const pacientes = await Paciente.find(filtro).sort({ apellido: 1, nombre: 1 });
  res.json(pacientes);
});

export const obtenerPaciente = asyncHandler(async (req, res) => {
  const paciente = await Paciente.findById(req.params.id);
  if (!paciente) throw new ErrorHttp(404, 'Paciente no encontrado');
  res.json(paciente);
});

export const crearPaciente = asyncHandler(async (req, res) => {
  const { nombre, apellido, dni, fechaNacimiento, obraSocial, habitacion, alergias, observaciones } = req.body;
  const paciente = await Paciente.create({
    nombre, apellido, dni, fechaNacimiento,obraSocial, habitacion, alergias, observaciones,
  });
  res.status(201).json(paciente);
});

export const actualizarPaciente = asyncHandler(async (req, res) => {
  const { nombre, apellido, dni, fechaNacimiento,obraSocial, habitacion, alergias, observaciones } = req.body;
  const paciente = await Paciente.findByIdAndUpdate(
    req.params.id,
    { nombre, apellido, dni, fechaNacimiento,obraSocial, habitacion, alergias, observaciones },
    { new: true, runValidators: true }
  );
  if (!paciente) throw new ErrorHttp(404, 'Paciente no encontrado');
  res.json(paciente);
});

export const darDeBajaPaciente = asyncHandler(async (req, res) => {
  const paciente = await Paciente.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
  if (!paciente) throw new ErrorHttp(404, 'Paciente no encontrado');
  res.json({ mensaje: 'Paciente dado de baja' });
});
