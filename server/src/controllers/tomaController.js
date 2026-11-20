import Toma from '../models/Toma.js';
import Tratamiento from '../models/Tratamiento.js';
import Medicamento from '../models/Medicamento.js';
import { calcularTomas, inicioDelDia } from '../utils/agenda.js';
import { asyncHandler, ErrorHttp } from '../utils/asyncHandler.js';

const MAX_DIAS = 31;
const MARGEN_ANTICIPO_MIN = 60; 

async function asegurarTomas(desde, hasta, pacienteId) {
  const filtro = { activo: true };
  if (pacienteId) filtro.paciente = pacienteId;
  const tratamientos = await Tratamiento.find(filtro);

  const operaciones = [];
  for (const t of tratamientos) {
    for (const fechaHora of calcularTomas(t, desde, hasta)) {
      operaciones.push({
        updateOne: {
          filter: { tratamiento: t._id, fechaHora },
          update: { $setOnInsert: { tratamiento: t._id, paciente: t.paciente, fechaHora, estado: 'pendiente' } },
          upsert: true,
        },
      });
    }
  }
  if (!operaciones.length) return;
  try {
    await Toma.bulkWrite(operaciones, { ordered: false });
  } catch (error) {
    const soloDuplicados = error.writeErrors?.every((e) => e.code === 11000);
    if (!soloDuplicados) throw error;
  }
}

export const listarTomas = asyncHandler(async (req, res) => {
  const desde = inicioDelDia(req.query.desde ? `${req.query.desde}T00:00:00` : new Date());
  const hasta = inicioDelDia(req.query.hasta ? `${req.query.hasta}T00:00:00` : desde);
  if (isNaN(desde) || isNaN(hasta)) throw new ErrorHttp(400, 'Fechas inválidas (usar AAAA-MM-DD)');
  if (hasta < desde) throw new ErrorHttp(400, '"hasta" no puede ser anterior a "desde"');
  if ((hasta - desde) / 86400000 > MAX_DIAS) throw new ErrorHttp(400, `El rango máximo es de ${MAX_DIAS} días`);

  await asegurarTomas(desde, hasta, req.query.paciente);

  const finRango = new Date(hasta);
  finRango.setHours(23, 59, 59, 999);
  const filtro = { fechaHora: { $gte: desde, $lte: finRango } };
  if (req.query.paciente) filtro.paciente = req.query.paciente;

  const tomas = await Toma.find(filtro)
    .populate('paciente', 'nombre apellido habitacion')
    .populate({ path: 'tratamiento', select: 'dosis indicaciones medicamento', populate: { path: 'medicamento', select: 'nombre presentacion' } })
    .populate('registradoPor', 'nombre rol')
    .sort({ fechaHora: 1 });

  res.json(tomas);
});

export const registrarToma = asyncHandler(async (req, res) => {
  const { estado, observacion } = req.body;
  if (!['tomada', 'omitida'].includes(estado)) throw new ErrorHttp(400, 'Estado inválido');
  if (estado === 'omitida' && !observacion?.trim()) {
    throw new ErrorHttp(400, 'Si la toma se omite, hay que indicar el motivo');
  }

  const toma = await Toma.findById(req.params.id).populate('tratamiento');
  if (!toma) throw new ErrorHttp(404, 'Toma no encontrada');
  if (toma.estado !== 'pendiente') throw new ErrorHttp(409, 'Esta toma ya fue registrada');

  const limite = new Date(Date.now() + MARGEN_ANTICIPO_MIN * 60000);
  if (toma.fechaHora > limite) throw new ErrorHttp(400, 'Todavía no es horario de esta toma');

  if (estado === 'tomada') {
    const unidades = toma.tratamiento.unidadesPorToma;
    const med = await Medicamento.findOneAndUpdate(
      { _id: toma.tratamiento.medicamento, stock: { $gte: unidades } },
      { $inc: { stock: -unidades } },
      { new: true }
    );
    if (!med) throw new ErrorHttp(409, 'No hay stock suficiente de este medicamento');
  }

  toma.estado = estado;
  toma.observacion = observacion?.trim();
  toma.registradoPor = req.usuario._id;
  toma.registradoEn = new Date();
  await toma.save();

  toma.depopulate('tratamiento');
  await toma.populate([
    { path: 'paciente', select: 'nombre apellido habitacion' },
    { path: 'tratamiento', select: 'dosis indicaciones medicamento', populate: { path: 'medicamento', select: 'nombre presentacion' } },
    { path: 'registradoPor', select: 'nombre rol' },
  ]);
  res.json(toma);
});
