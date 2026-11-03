import mongoose from 'mongoose';

const medicamentoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true },
    presentacion: { type: String, required: true, trim: true }, 
    stock: { type: Number, default: 0, min: [0, 'El stock no puede ser negativo'] },
    stockMinimo: { type: Number, default: 10, min: 0 },
    interacciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicamento' }],
  },
  { timestamps: true }
);

medicamentoSchema.virtual('stockBajo').get(function () {
  return this.stock <= this.stockMinimo;
});
medicamentoSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Medicamento', medicamentoSchema);
