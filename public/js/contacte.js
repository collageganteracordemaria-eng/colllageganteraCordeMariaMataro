import mongoose from 'mongoose';

const contacteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  missatge: {
    type: String,
    required: true
  }
});

export default mongoose.model('Contacte', contacteSchema);
