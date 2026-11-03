import mongoose from 'mongoose';

export const ESTADOS_TOMA = ['pendiente', 'tomada', 'omitida'];

const tomaSchema = new mongoose.Schema(
  {
    tratamiento: { type: mongoose.Schema.Types.ObjectId, ref: 'Tratamiento', required: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    fechaHora: { type: Date, required: true },
    estado: { type: String, enum: ESTADOS_TOMA, default: 'pendiente' },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    registradoEn: { type: Date },
    observacion: { type: String, trim: true },
  },
  { timestamps: true }
);

tomaSchema.index({ tratamiento: 1, fechaHora: 1 }, { unique: true });

export default mongoose.model('Toma', tomaSchema);
