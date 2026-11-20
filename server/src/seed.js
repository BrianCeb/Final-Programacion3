import 'dotenv/config';
import mongoose from 'mongoose';
import { conectarDB } from './config/db.js';
import Usuario from './models/Usuario.js';
import Paciente from './models/Paciente.js';
import Medicamento from './models/Medicamento.js';
import Tratamiento from './models/Tratamiento.js';
import Toma from './models/Toma.js';
import { calcularTomas, inicioDelDia } from './utils/agenda.js';
import { sincronizarInteracciones } from './controllers/medicamentoController.js';

const haceDias = (n) => {
  const d = inicioDelDia(new Date());
  d.setDate(d.getDate() - n);
  return d;
};

export async function cargarDatos() {
  await Promise.all([
    Usuario.deleteMany(), Paciente.deleteMany(), Medicamento.deleteMany(),
    Tratamiento.deleteMany(), Toma.deleteMany(),
  ]);

  // ---------- Usuarios (contraseña de todos: 123456) ----------
  const [admin, medico, enfermero] = await Usuario.create([
    { nombre: 'Ana Admin', email: 'admin@medicontrol.com', password: '123456', rol: 'admin' },
    { nombre: 'Dr. Martín Gómez', email: 'medico@medicontrol.com', password: '123456', rol: 'medico' },
    { nombre: 'Lucía Fernández', email: 'enfermero@medicontrol.com', password: '123456', rol: 'enfermero' },
  ]);

  // ---------- Medicamentos ----------
  const meds = await Medicamento.create([
    { nombre: 'Ibuprofeno', presentacion: 'Comprimido 400 mg', stock: 120, stockMinimo: 20 },
    { nombre: 'Acenocumarol', presentacion: 'Comprimido 4 mg', stock: 40, stockMinimo: 10 },
    { nombre: 'Enalapril', presentacion: 'Comprimido 10 mg', stock: 90, stockMinimo: 20 },
    { nombre: 'Paracetamol', presentacion: 'Comprimido 500 mg', stock: 200, stockMinimo: 30 },
    { nombre: 'Omeprazol', presentacion: 'Cápsula 20 mg', stock: 8, stockMinimo: 15 },
    { nombre: 'Metformina', presentacion: 'Comprimido 850 mg', stock: 150, stockMinimo: 30 },
    { nombre: 'Amoxicilina', presentacion: 'Cápsula 500 mg', stock: 12, stockMinimo: 20 },
    { nombre: 'Atorvastatina', presentacion: 'Comprimido 20 mg', stock: 60, stockMinimo: 15 },
  ]);
  const m = Object.fromEntries(meds.map((x) => [x.nombre, x]));

  // Interacciones 
  m.Ibuprofeno.interacciones = [m.Acenocumarol._id, m.Enalapril._id];
  await m.Ibuprofeno.save();
  await sincronizarInteracciones(m.Ibuprofeno); // Acenocumarol y Enalapril también quedan marcados

  // ---------- Pacientes ----------
  const pacientes = await Paciente.create([
    { nombre: 'Rosa', apellido: 'Martínez', dni: '10234567', fechaNacimiento: '1945-03-12', habitacion: '101', alergias: ['Penicilina'] },
    { nombre: 'Carlos', apellido: 'López', dni: '11345678', fechaNacimiento: '1950-07-25', habitacion: '102',obraSocial: 'OSEP' },
    { nombre: 'Elena', apellido: 'Suárez', dni: '9876543', fechaNacimiento: '1938-11-02', habitacion: '103', obraSocial: 'OSDE', observaciones: 'Dificultad para tragar' },
    { nombre: 'Jorge', apellido: 'Pereyra', dni: '12456789', fechaNacimiento: '1955-01-30', habitacion: '104' ,obraSocial: 'PAMI'},
    { nombre: 'Marta', apellido: 'Giménez', dni: '13567890', fechaNacimiento: '1948-05-18', habitacion: '105' ,obraSocial: 'PAMI'},
    { nombre: 'Brian', apellido: 'Cebrero', dni: '42537406', fechaNacimiento: '1997-07-26', habitacion: '90',obraSocial: 'OSPE' },
  ]);
  const [rosa, carlos, elena, jorge, marta,] = pacientes;

  // ---------- Tratamientos ----------
  const base = { creadoPor: medico._id, fechaInicio: haceDias(10) };
  const tratamientos = await Tratamiento.create([
    { ...base, paciente: rosa._id, medicamento: m.Acenocumarol._id, dosis: '1 comprimido', cadaHoras: 24, horaInicio: '20:00' },
    { ...base, paciente: rosa._id, medicamento: m.Omeprazol._id, dosis: '1 cápsula en ayunas', cadaHoras: 24, horaInicio: '07:00' },
    { ...base, paciente: carlos._id, medicamento: m.Enalapril._id, dosis: '1 comprimido', cadaHoras: 12, horaInicio: '08:00' },
    { ...base, paciente: carlos._id, medicamento: m.Metformina._id, dosis: '1 comprimido con las comidas', cadaHoras: 12, horaInicio: '09:00' },
    { ...base, paciente: elena._id, medicamento: m.Paracetamol._id, dosis: '1 comprimido triturado', cadaHoras: 8, horaInicio: '06:00', indicaciones: 'Triturar y mezclar con compota' },
    { ...base, paciente: jorge._id, medicamento: m.Amoxicilina._id, dosis: '1 cápsula', cadaHoras: 8, horaInicio: '08:00', fechaInicio: haceDias(3), fechaFin: haceDias(-4) },
    { ...base, paciente: jorge._id, medicamento: m.Atorvastatina._id, dosis: '1 comprimido', cadaHoras: 24, horaInicio: '21:00' },
    { ...base, paciente: marta._id, medicamento: m.Ibuprofeno._id, dosis: '1 comprimido', cadaHoras: 8, horaInicio: '07:00', fechaInicio: haceDias(5), fechaFin: haceDias(1) },
    { ...base, paciente: marta._id, medicamento: m.Paracetamol._id, dosis: '1 comprimido', cadaHoras: 6, horaInicio: '06:00' },
  ]);

  // ---------- Historial de tomas  ----------
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
  const ayerFin = haceDias(1);

  const tomas = [];
  for (const t of tratamientos) {
    for (const fechaHora of calcularTomas(t, haceDias(7), ayerFin)) {
      const probOmitir = String(t.paciente) === String(elena._id) ? 0.3 : 0.07;
      const omitida = azar() < probOmitir;
      tomas.push({
        tratamiento: t._id,
        paciente: t.paciente,
        fechaHora,
        estado: omitida ? 'omitida' : 'tomada',
        observacion: omitida ? 'El paciente rechazó la medicación' : undefined,
        registradoPor: enfermero._id,
        registradoEn: new Date(fechaHora.getTime() + Math.round(azar() * 30) * 60000),
      });
    }
  }
  await Toma.insertMany(tomas);

  return { usuarios: 3, medicamentos: meds.length, pacientes: pacientes.length, tratamientos: tratamientos.length, tomas: tomas.length, admin };
}

// (npm run seed)
if (process.argv[1]?.endsWith('seed.js')) {
  await conectarDB();
  const r = await cargarDatos();
  console.log(` Datos cargados: ${r.usuarios} usuarios, ${r.medicamentos} medicamentos, ${r.pacientes} pacientes, ${r.tratamientos} tratamientos, ${r.tomas} tomas`);
  console.log('Usuarios: admin@ / medico@ / enfermero@medicontrol.com  —  contraseña: 123456');
  await mongoose.disconnect();
}
