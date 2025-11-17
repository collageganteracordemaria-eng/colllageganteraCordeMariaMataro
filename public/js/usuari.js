import mongoose from 'mongoose';
const { Schema } = mongoose;

const UsuariSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: null },
  email: { type: String, required: true, unique: true },  // Aquí afegim el camp del correu
  date: { type: Date, default: Date.now },
});

const Usuari = mongoose.model('Usuari', UsuariSchema);
export default Usuari;
