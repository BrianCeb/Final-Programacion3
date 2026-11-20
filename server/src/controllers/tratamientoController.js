import Tratamiento from '../models/Tratamiento.js';
import Medicamento from '../models/Medicamento.js';
import Paciente from '../models/Paciente.js';
import Toma from '../models/Toma.js';
import { asyncHandler, ErrorHttp } from '../utils/asyncHandler.js';

export const listarTratamientos = asyncHandler(async (req, res) => {
  const filtro = {};
  if (req.query.paciente) filtro.paciente = req.query.paciente;
  const tratamientos = await Tratamiento.find(filtro)
    .populate('medicamento', 'nombre presentacion')
    .populate('creadoPor', 'nombre')
    .sort({ activo: -1, createdAt: -1 });
  res.json(tratamientos);
});


async function buscarInteracciones(pacienteId, medicamentoId) {
  const activos = await Tratamiento.find({ paciente: pacienteId, activo: true }).populate('medicamento');
  const nuevo = await Medicamento.findById(medicamentoId);
  if (!nuevo) throw new ErrorHttp(404, 'Medicamento no encontrado');

  const conflictos = [];
  for (const t of activos) {
    const actual = t.medicamento;
    if (String(actual._id) === String(nuevo._id)) {
      throw new ErrorHttp(409, `El paciente ya tiene un tratamiento activo con ${nuevo.nombre}`);
    }
    const choca =
      nuevo.interacciones.some((id) => String(id) === String(actual._id)) ||
      actual.interacciones.some((id) => String(id) === String(nuevo._id));
    if (choca) conflictos.push(actual.nombre);
  }
  return { nuevo, conflictos };
}

export const crearTratamiento = asyncHandler(async (req, res) => {
  const { paciente, medicamento, forzar, ...resto } = req.body;

  const existePaciente = await Paciente.exists({ _id: paciente, activo: true });
  if (!existePaciente) throw new ErrorHttp(404, 'Paciente no encontrado');

  const { nuevo, conflictos } = await buscarInteracciones(paciente, medicamento);
  if (conflictos.length > 0 && !forzar) {
    throw new ErrorHttp(409, `${nuevo.nombre} interactúa con medicación actual del paciente`, {
      tipo: 'INTERACCION',
      conflictos,
    });
  }

  const { dosis, unidadesPorToma, cadaHoras, horaInicio, fechaInicio, fechaFin, indicaciones } = resto;
  const tratamiento = await Tratamiento.create({
    paciente, medicamento, dosis, unidadesPorToma, cadaHoras, horaInicio,
    fechaInicio, fechaFin, indicaciones,
    creadoPor: req.usuario._id,
  });
  await tratamiento.populate('medicamento', 'nombre presentacion');
  res.status(201).json(tratamiento);
});

export const suspenderTratamiento = asyncHandler(async (req, res) => {
  const { motivo } = req.body;
  if (!motivo?.trim()) throw new ErrorHttp(400, 'Indicá el motivo de la suspensión');

  const tratamiento = await Tratamiento.findById(req.params.id);
  if (!tratamiento) throw new ErrorHttp(404, 'Tratamiento no encontrado');
  if (!tratamiento.activo) throw new ErrorHttp(400, 'El tratamiento ya estaba suspendido');

  tratamiento.activo = false;
  tratamiento.motivoSuspension = motivo.trim();
  await tratamiento.save();

  await Toma.deleteMany({ tratamiento: tratamiento._id, estado: 'pendiente', fechaHora: { $gt: new Date() } });

  res.json(tratamiento);
});
