import { ETIQUETAS_ESTADO } from '../utils/fechas.js';

const ICONOS = { tomada: '✓', omitida: '✕', atrasada: '!', 'en-horario': '●', proxima: '○' };

export default function Insignia({ estado, texto }) {
  return (
    <span className={`insignia insignia-${estado}`}>
      <span aria-hidden="true">{ICONOS[estado] ?? '•'}</span> {texto ?? ETIQUETAS_ESTADO[estado] ?? estado}
    </span>
  );
}