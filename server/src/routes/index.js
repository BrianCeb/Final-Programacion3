import { Router } from 'express';
import { verificarToken, permitirRoles } from '../middleware/auth.js';
import { registro, login, yo } from '../controllers/authController.js';
import { listarUsuarios, actualizarUsuario } from '../controllers/usuarioController.js';
import {
  listarPacientes, obtenerPaciente, crearPaciente, actualizarPaciente, darDeBajaPaciente,
} from '../controllers/pacienteController.js';
import {
  listarMedicamentos, crearMedicamento, actualizarMedicamento, eliminarMedicamento,
} from '../controllers/medicamentoController.js';
import {
  listarTratamientos, crearTratamiento, suspenderTratamiento,
} from '../controllers/tratamientoController.js';
import { listarTomas, registrarToma } from '../controllers/tomaController.js';

const router = Router();

/* ------------- Rutas públicas ------------- */
router.post('/auth/registro', registro);
router.post('/auth/login', login);

/* ------------- A partir de acá, todo requiere token ------------- */
router.use(verificarToken);

router.get('/auth/me', yo);

// Usuarios: solo admin
router.get('/usuarios', permitirRoles('admin'), listarUsuarios);
router.patch('/usuarios/:id', permitirRoles('admin'), actualizarUsuario);

// Pacientes: todos ven; médico y admin crean/editan; solo admin da de baja
router.get('/pacientes', listarPacientes);
router.get('/pacientes/:id', obtenerPaciente);
router.post('/pacientes', permitirRoles('medico', 'admin'), crearPaciente);
router.put('/pacientes/:id', permitirRoles('medico', 'admin'), actualizarPaciente);
router.delete('/pacientes/:id', permitirRoles('admin'), darDeBajaPaciente);

// Medicamentos: todos ven; solo admin gestiona el catálogo y el stock
router.get('/medicamentos', listarMedicamentos);
router.post('/medicamentos', permitirRoles('admin'), crearMedicamento);
router.put('/medicamentos/:id', permitirRoles('admin'), actualizarMedicamento);
router.delete('/medicamentos/:id', permitirRoles('admin'), eliminarMedicamento);

// Tratamientos: todos ven; solo el médico indica y suspende
router.get('/tratamientos', listarTratamientos);
router.post('/tratamientos', permitirRoles('medico'), crearTratamiento);
router.patch('/tratamientos/:id/suspender', permitirRoles('medico'), suspenderTratamiento);

// Tomas: todos ven la agenda; médico y enfermero registran
router.get('/tomas', listarTomas);
router.patch('/tomas/:id', permitirRoles('medico', 'enfermero'), registrarToma);

export default router;
