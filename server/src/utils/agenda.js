export function inicioDelDia(fecha) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function horariosDelDia(horaInicio, cadaHoras) {
  const [h0, m0] = horaInicio.split(':').map(Number);
  const cantidad = 24 / cadaHoras; 
  const horarios = [];
  for (let k = 0; k < cantidad; k++) {
    horarios.push({ hora: (h0 + k * cadaHoras) % 24, minutos: m0 });
  }
  return horarios.sort((a, b) => a.hora * 60 + a.minutos - (b.hora * 60 + b.minutos));
}

export function calcularTomas(tratamiento, desde, hasta) {
  const resultado = [];
  const inicioTrat = new Date(tratamiento.fechaInicio);
  const finTrat = tratamiento.fechaFin ? new Date(tratamiento.fechaFin) : null;
  if (finTrat) finTrat.setHours(23, 59, 59, 999);

  const horarios = horariosDelDia(tratamiento.horaInicio, tratamiento.cadaHoras);
  const dia = inicioDelDia(desde);
  const ultimoDia = inicioDelDia(hasta);

  while (dia <= ultimoDia) {
    for (const { hora, minutos } of horarios) {
      const fechaHora = new Date(dia);
      fechaHora.setHours(hora, minutos, 0, 0);
      const dentroDelTratamiento = fechaHora >= inicioTrat && (!finTrat || fechaHora <= finTrat);
      if (dentroDelTratamiento) resultado.push(fechaHora);
    }
    dia.setDate(dia.getDate() + 1);
  }
  return resultado;
}
