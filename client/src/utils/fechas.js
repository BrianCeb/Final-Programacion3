export const TOLERANCIA_MIN = 30; 
export function aISO(fecha = new Date()) {
  const d = new Date(fecha);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

export const formatoHora = (f) =>
  new Date(f).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export const formatoFecha = (f) =>
  new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatoFechaHora = (f) => `${formatoFecha(f)} ${formatoHora(f)}`;

export const fechaSinHora = (f) => new Date(`${String(f).slice(0, 10)}T12:00:00`);
export const inicioDiaLocalISO = (aaaammdd) => new Date(`${aaaammdd}T00:00:00`).toISOString();

export function calcularEdad(fechaNacimiento) {
  const nac = fechaSinHora(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const cumplioEsteAnio =
    hoy.getMonth() > nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate());
  return cumplioEsteAnio ? edad : edad - 1;
}

export function estadoVisual(toma, ahora) {
  if (toma.estado !== 'pendiente') return toma.estado;
  const diferenciaMin = (ahora - new Date(toma.fechaHora)) / 60000;
  if (diferenciaMin > TOLERANCIA_MIN) return 'atrasada';
  if (diferenciaMin >= -TOLERANCIA_MIN) return 'en-horario';
  return 'proxima';
}

export const ETIQUETAS_ESTADO = {
  tomada: 'Tomada',
  omitida: 'Omitida',
  atrasada: 'Atrasada',
  'en-horario': 'En horario',
  proxima: 'Próxima',
};