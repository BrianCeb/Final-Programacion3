import { useEffect, useRef, useState } from 'react';

export function useReloj(intervaloMs = 30000) {
  const [ahora, setAhora] = useState(() => new Date());
  const intervaloRef = useRef(null);

  useEffect(() => {
    intervaloRef.current = setInterval(() => setAhora(new Date()), intervaloMs);
    return () => clearInterval(intervaloRef.current);
  }, [intervaloMs]);

  return ahora;
}