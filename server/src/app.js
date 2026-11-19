import express from 'express';
import cors from 'cors';
import rutas from './routes/index.js';
import { manejarErrores, rutaNoEncontrada } from './middleware/errores.js';


const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true }));
app.use('/api', rutas);


app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
