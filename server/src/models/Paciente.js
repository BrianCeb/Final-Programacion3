import mongoose from 'mongoose';

const pacienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    apellido: { type: String, required: [true, 'El apellido es obligatorio'], trim: true },
    dni: {
      type: String,
      required: [true, 'El DNI es obligatorio'],
      unique: true,
      match: [/^\d{7,8}$/, 'El DNI debe tener 7 u 8 números'],
    },
    fechaNacimiento: { type: Date, required: [true, 'La fecha de nacimiento es obligatoria'] },
    obraSocial: { type: String, trim: true },
    habitacion: { type: String, trim: true },
    alergias: [{ type: String, trim: true }],
    observaciones: { type: String, trim: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Paciente', pacienteSchema);
