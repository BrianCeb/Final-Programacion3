import mongoose from 'mongoose';

export const FRECUENCIAS = [4, 6, 8, 12, 24];

const tratamientoSchema = new mongoose.Schema(
  {
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', required: true },
    medicamento: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicamento', required: true },
    dosis: { type: String, required: [true, 'La dosis es obligatoria'], trim: true },
    unidadesPorToma: { type: Number, default: 1, min: [1, 'Debe ser al menos 1 unidad'] },
    cadaHoras: {
      type: Number,
      required: true,
      enum: { values: FRECUENCIAS, message: 'La frecuencia debe ser 4, 6, 8, 12 o 24 horas' },
    },
    horaInicio: {
      type: String,
      required: true,
      validate: {
        validator: (valor) => {
          const partes = valor.split(':');
          if (partes.length !== 2) return false;

          const hora = Number(partes[0]);
          const minutos = Number(partes[1]);
          return hora >= 0 && hora <= 23 && minutos >= 0 && minutos <= 59;
        },
        message: 'La hora debe tener formato HH:MM',
      },
    },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date },
    indicaciones: { type: String, trim: true },
    activo: { type: Boolean, default: true },
    motivoSuspension: { type: String, trim: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  },
  { timestamps: true }
);

tratamientoSchema.pre('validate', function () {
  if (this.fechaFin && this.fechaInicio && this.fechaFin < this.fechaInicio) {
    this.invalidate('fechaFin', 'La fecha de fin no puede ser anterior a la de inicio');
  }
});

export default mongoose.model('Tratamiento', tratamientoSchema);
