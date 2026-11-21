import { useCallback, useEffect, useReducer } from 'react';
import { useApi } from './useApi.js';


export const estadoInicial = {
    tomas: [],
    cargando: true,
    error: null,
    registrando: null, errorRegistro: null,
};

export function agendaReducer(estado, accion) {
    switch (accion.type) {
        case 'CARGA_INICIO':
            return { ...estado, cargando: true, error: null };
        case 'CARGA_OK':
            return { ...estado, cargando: false, tomas: accion.tomas };
        case 'CARGA_ERROR':
            return { ...estado, cargando: false, error: accion.error };
        case 'REGISTRO_INICIO':
            return { ...estado, registrando: accion.id, errorRegistro: null };
        case 'REGISTRO_OK':
            return {
                ...estado,
                registrando: null,
                tomas: estado.tomas.map((t) => (t._id === accion.toma._id ? accion.toma : t)),
            };
        case 'REGISTRO_ERROR':
            return { ...estado, registrando: null, errorRegistro: accion.error };
        case 'LIMPIAR_ERROR':
            return { ...estado, errorRegistro: null };
        default:
            throw new Error(`Acción desconocida: ${accion.type}`);
    }
}

export function useAgenda(fecha, pacienteId) {
    const pedir = useApi();
    const [estado, dispatch] = useReducer(agendaReducer, estadoInicial);

    const cargar = useCallback(async () => {
        dispatch({ type: 'CARGA_INICIO' });
        try {
            const params = new URLSearchParams({ desde: fecha, hasta: fecha });
            if (pacienteId) params.set('paciente', pacienteId);
            const tomas = await pedir(`/tomas?${params}`);
            dispatch({ type: 'CARGA_OK', tomas });
        } catch (err) {
            dispatch({ type: 'CARGA_ERROR', error: err.message });
        }
    }, [pedir, fecha, pacienteId]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const registrar = useCallback(
        async (id, nuevoEstado, observacion) => {
            dispatch({ type: 'REGISTRO_INICIO', id });
            try {
                const toma = await pedir(`/tomas/${id}`, {
                    method: 'PATCH',
                    body: { estado: nuevoEstado, observacion },
                });
                dispatch({ type: 'REGISTRO_OK', toma });
                return true;
            } catch (err) {
                dispatch({ type: 'REGISTRO_ERROR', error: err.message });
                return false;
            }
        },
        [pedir]
    );

    const limpiarError = useCallback(() => dispatch({ type: 'LIMPIAR_ERROR' }), []);

    return { ...estado, registrar, recargar: cargar, limpiarError };
}