export async function llamarApi(url, { method = 'GET', body, token } = {}) {
  const respuesta = await fetch(`/api${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
  }

  if (!respuesta.ok) {
    const error = new Error(datos?.mensaje || 'Error de conexión con el servidor');
    error.status = respuesta.status;
    error.datos = datos; 
    throw error;
  }
  return datos;
}
