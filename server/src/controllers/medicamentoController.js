import Medicamento from '../models/Medicamento.js';
import Tratamiento from '../models/Tratamiento.js';
import { asyncHandler, ErrorHttp } from '../utils/asyncHandler.js';

// Las interacciones son simétricas: si A no se combina con B, B tampoco con A.
// Después de guardar un medicamento, actualizamos las listas de los demás.
export async function sincronizarInteracciones(med) {
  const ids = med.interacciones.map((i) => i._id ?? i);
  await Medicamento.updateMany({ _id: { $in: ids } }, { $addToSet: { interacciones: med._id } });
  await Medicamento.updateMany({ _id: { $nin: [...ids, med._id] } }, { $pull: { interacciones: med._id } });
}

// GET /api/medicamentos
export const listarMedicamentos = asyncHandler(async (req, res) => {
  const medicamentos = await Medicamento.find()
    .populate('interacciones', 'nombre')
    .sort({ nombre: 1 });
  res.json(medicamentos);
});

// POST /api/medicamentos  (solo admin)
export const crearMedicamento = asyncHandler(async (req, res) => {
  const { nombre, presentacion, stock, stockMinimo, interacciones } = req.body;
  const med = await Medicamento.create({ nombre, presentacion, stock, stockMinimo, interacciones });
  await sincronizarInteracciones(med);
  res.status(201).json(med);
});

// PUT /api/medicamentos/:id  (solo admin) -> sirve también para reponer stock
export const actualizarMedicamento = asyncHandler(async (req, res) => {
  const { nombre, presentacion, stock, stockMinimo, interacciones } = req.body;
  const med = await Medicamento.findByIdAndUpdate(
    req.params.id,
    { nombre, presentacion, stock, stockMinimo, interacciones },
    { new: true, runValidators: true }
  ).populate('interacciones', 'nombre');
  if (!med) throw new ErrorHttp(404, 'Medicamento no encontrado');
  // Solo si se mandaron interacciones (al reponer stock no se mandan)
  if (interacciones !== undefined) await sincronizarInteracciones(med);
  res.json(med);
});

// DELETE /api/medicamentos/:id  (solo admin)
export const eliminarMedicamento = asyncHandler(async (req, res) => {
  const enUso = await Tratamiento.exists({ medicamento: req.params.id, activo: true });
  if (enUso) throw new ErrorHttp(409, 'No se puede eliminar: hay tratamientos activos que lo usan');

  const med = await Medicamento.findByIdAndDelete(req.params.id);
  if (!med) throw new ErrorHttp(404, 'Medicamento no encontrado');
  // Lo quitamos también de las listas de interacciones de los demás
  await Medicamento.updateMany({}, { $pull: { interacciones: med._id } });
  res.json({ mensaje: 'Medicamento eliminado' });
});
