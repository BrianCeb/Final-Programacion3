import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAgenda } from '../hooks/useAgenda.js';
import { useReloj } from '../hooks/useReloj.js';
import TomaItem from '../components/TomaItem.jsx';
import ModalOmitir from '../components/ModalOmitir.jsx';
import Mensaje from '../components/Mensaje.jsx';
import Cargando from '../components/Cargando.jsx';
import { aISO, estadoVisual, formatoHora, sumarDias } from '../utils/fechas.js';
import { tienePermiso } from '../utils/permisos.js';

const FILTROS = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'pendientes', texto: 'Pendientes' },
  { valor: 'atrasadas', texto: 'Atrasadas' },
  { valor: 'registradas', texto: 'Registradas' },
  { valor: 'omitidas', texto: 'Omitidas' },
];

export default function Agenda() {
  const { usuario } = useAuth();
  const [fecha, setFecha] = useState(() => aISO());
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [tomaAOmitir, setTomaAOmitir] = useState(null);

  const ahora = useReloj(30000); // se actualiza cada 30 s
  const { tomas, cargando, error, registrando, errorRegistro, registrar, limpiarError } = useAgenda(fecha);
  const puedeRegistrar = tienePermiso(usuario, 'registrarToma');
  const esHoy = fecha === aISO(ahora);

  // ---------------- useMemo: cálculos derivados ----------------

  const tomasConEstado = useMemo(
    () => tomas.map((t) => ({ toma: t, estado: estadoVisual(t, ahora) })),
    [tomas, ahora]
  );

  const resumen = useMemo(() => {
    const r = { total: tomasConEstado.length, tomada: 0, omitida: 0, atrasada: 0, pendientes: 0 };
    for (const { estado } of tomasConEstado) {
      if (estado === 'tomada') r.tomada++;
      else if (estado === 'omitida') r.omitida++;
      else {
        r.pendientes++;
        if (estado === 'atrasada') r.atrasada++;
      }
    }
    return r;
  }, [tomasConEstado]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return tomasConEstado.filter(({ toma, estado }) => {
            const pasaFiltro =
        filtro === 'todas' ||
        (filtro === 'pendientes' && toma.estado === 'pendiente') ||
        (filtro === 'atrasadas' && estado === 'atrasada') ||
        (filtro === 'registradas' && toma.estado !== 'pendiente') ||
        (filtro === 'omitidas' && toma.estado === 'omitida');
      if (!pasaFiltro) return false;
      if (!texto) return true;
      const p = toma.paciente;
      const med = toma.tratamiento?.medicamento?.nombre ?? '';
      return `${p?.nombre} ${p?.apellido} ${p?.habitacion} ${med}`.toLowerCase().includes(texto);
    });
  }, [tomasConEstado, filtro, busqueda]);

  const idObjetivo = useMemo(() => {
    const pendientes = visibles.filter(({ toma }) => toma.estado === 'pendiente');
    const urgente = pendientes.find(({ estado }) => estado !== 'proxima');
    return (urgente ?? pendientes[0])?.toma._id ?? null;
  }, [visibles]);

  // ---------------- useRef + useLayoutEffect: scroll automático ----------------
  const refObjetivo = useRef(null);
  const yaScrolleo = useRef(false);

  useLayoutEffect(() => {
    if (cargando) {
      yaScrolleo.current = false;
      return;
    }
    if (!yaScrolleo.current && refObjetivo.current) {
      refObjetivo.current.scrollIntoView({ block: 'center' });
      yaScrolleo.current = true;
    }
  }, [cargando, idObjetivo]);

  // ---------------- useEffect: título de la pestaña con alertas ----------------
  useEffect(() => {
    const original = document.title;
    if (esHoy && resumen.atrasada > 0) document.title = `(${resumen.atrasada}) Tomas atrasadas`;
    return () => {
      document.title = original; // limpieza: al salir de la página dejamos el título como estaba
    };
  }, [esHoy, resumen.atrasada]);

  // ---------------- useCallback: funciones estables para TomaItem (memo) ----------------
  const darToma = useCallback((id) => registrar(id, 'tomada'), [registrar]);
  const abrirOmitir = useCallback((toma) => setTomaAOmitir(toma), []);
  const confirmarOmitir = useCallback(
    async (id, motivo) => {
      const ok = await registrar(id, 'omitida', motivo);
      if (ok) setTomaAOmitir(null);
    },
    [registrar]
  );

  const cambiarDia = (dias) => setFecha((f) => aISO(sumarDias(`${f}T12:00:00`, dias)));

  return (
    <section>
      <div className="encabezado-pagina">
        <div>
          <h1>Agenda de medicación</h1>
          <p className="tenue">
            {new Date(`${fecha}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {esHoy && ` · son las ${formatoHora(ahora)}`}
          </p>
        </div>
        <div className="botones">
          <button type="button" className="btn btn-secundario" onClick={() => cambiarDia(-1)} aria-label="Día anterior">←</button>
          <button type="button" className="btn btn-secundario" onClick={() => setFecha(aISO())} disabled={esHoy}>Hoy</button>
          <button type="button" className="btn btn-secundario" onClick={() => cambiarDia(1)} aria-label="Día siguiente">→</button>
          <input type="date" className="input-fecha" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} aria-label="Elegir fecha" />
        </div>
      </div>

      <div className="resumen">
        <div className="resumen-item"><span className="numero">{resumen.total}</span> programadas</div>
        <div className="resumen-item"><span className="numero texto-exito">{resumen.tomada}</span> tomadas</div>
        <div className="resumen-item"><span className="numero texto-peligro">{resumen.omitida}</span> omitidas</div>
        <div className="resumen-item"><span className="numero">{resumen.pendientes}</span> pendientes</div>
        <div className="resumen-item"><span className="numero texto-aviso">{resumen.atrasada}</span> atrasadas</div>
      </div>

      {resumen.atrasada > 0 && (
        <Mensaje tipo="aviso">
          Hay {resumen.atrasada} {resumen.atrasada === 1 ? 'toma atrasada' : 'tomas atrasadas'} sin registrar.
        </Mensaje>
      )}
      <Mensaje tipo="error" onCerrar={limpiarError}>{errorRegistro}</Mensaje>

      <div className="barra-filtros">
        <div className="segmentado" role="group" aria-label="Filtrar tomas">
          {FILTROS.map((f) => (
            <button key={f.valor} type="button" aria-pressed={filtro === f.valor}
              className={filtro === f.valor ? 'activo' : ''} onClick={() => setFiltro(f.valor)}>
              {f.texto}
            </button>
          ))}
        </div>
        <input type="search" className="buscador" placeholder="Buscar paciente, habitación o medicamento…"
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar en la agenda" />
      </div>

      {cargando && <Cargando texto="Cargando agenda..." />}
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      {!cargando && !error && visibles.length === 0 && (
        <p className="vacio">No hay tomas para mostrar con estos filtros.</p>
      )}

      {!cargando && (
        <ul className="lista-tomas">
          {visibles.map(({ toma, estado }) => (
            <TomaItem
              key={toma._id}
              ref={toma._id === idObjetivo ? refObjetivo : undefined}
              toma={toma}
              estado={estado}
              puedeRegistrar={puedeRegistrar}
              ocupado={registrando === toma._id}
              onRegistrar={darToma}
              onOmitir={abrirOmitir}
            />
          ))}
        </ul>
      )}

      <ModalOmitir toma={tomaAOmitir} errorServidor={errorRegistro} onConfirmar={confirmarOmitir} onCerrar={() => { setTomaAOmitir(null); limpiarError(); }} />
    </section>
  );
}