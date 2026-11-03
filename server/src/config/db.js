import mongoose from 'mongoose';

export async function conectarDB(uri = process.env.MONGO_URI) {
  try {
    await mongoose.connect(uri);
    console.log(' Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}
