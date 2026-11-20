// Qué puede hacer cada rol en la interfaz.
// OJO: esto solo oculta botones. La seguridad real está en el backend (permitirRoles).
export const PERMISOS = {
  gestionarPacientes: ['medico', 'admin'],
  darDeBajaPaciente: ['admin'],
  indicarTratamiento: ['medico'],
  registrarToma: ['medico', 'enfermero'],
  gestionarMedicamentos: ['admin'],
  gestionarUsuarios: ['admin'],
};

export const NOMBRE_ROL = { admin: 'Administrador', medico: 'Médico', enfermero: 'Enfermero/a' };

export const tienePermiso = (usuario, accion) =>
  Boolean(usuario && PERMISOS[accion]?.includes(usuario.rol));
