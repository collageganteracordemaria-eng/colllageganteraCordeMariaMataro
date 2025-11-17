import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path'; 
import bcrypt from 'bcryptjs'; // Afegir importació de bcrypt
import { Server } from 'socket.io';  // Cambiar para importar la clase Server de socket.io
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from "fs";
import Stripe from "stripe";
dotenv.config();


const app = express();
const port = 3000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta on es guarden els fitxers
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom únic
  }
});

const upload = multer({ storage });
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Static file serving

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const audioDir = path.join(process.cwd(), "uploads", "audios");

// 🔧 Crea la carpeta si no existeix
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
  console.log("📂 Carpeta creada:", audioDir);
}
// Configura multer per a fitxers d’àudio
const storageAudios = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
app.use(cors());

// Connexió a MongoDB
mongoose.connect(process.env.URLMONGO)
  .then(() => console.log("Connexió a MongoDB establerta"))
  .catch((err) => {
    console.error("Error a l'establir la connexió amb MongoDB", err);
    process.exit(1); // Sortir del procés si la connexió falla
  });

// MongoDB models
const Musica = mongoose.model('Musica', new mongoose.Schema({
  nom: String,
  edat: Number,
  instrument: String,
  nivell: String,
  telefon: String,
  correu: String,
  antic_alumne: String,
  data: { type: Date, default: Date.now }
}));

const Portador = mongoose.model('Portador', new mongoose.Schema({
  nom: String,
  edat: Number,
  telefon: String,
  correu: String,
  pes: Number,
  alçada: Number,
  antic_alumne: String,
  data: { type: Date, default: Date.now }
}));
// --- Schema i model Contacte ---
const contacteSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true },
  missatge: { type: String, required: true },
  data: { type: Date, default: Date.now }
});

const Contacte = mongoose.model('Contacte', contacteSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

app.post('/submit-musica', async (req, res) => {
  const { nom, edat, instrument, nivell, telefon, correu, antic_alumne } = req.body;

  // Revisem que totes les dades han estat enviades
  if (!nom || !edat || !instrument || !nivell || !telefon || !correu) {
    console.error('Falten dades en el formulari:', req.body);
    return res.status(400).json({ success: false, message: 'Tots els camps són obligatoris.' });
  }

  try {
    // Guardem les dades a MongoDB
    const musica = new Musica({ nom, edat, instrument, nivell, telefon, correu, antic_alumne });
    await musica.save();
    console.log('Dades guardades correctament:', musica);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.DESTINATARI_EMAIL,
      subject: 'Nova submissió del formulari de Músics',
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f7fa; color: #333; margin: 0; padding: 0; }
              .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .header { background-color: #d91212ff; padding: 10px; color: #ffffff; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 20px; text-align: left; }
              .footer { text-align: center; font-size: 14px; color: #a71111ff; margin-top: 20px; }
              .footer a { color: #ce0a0aff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nova Submissió del Formulari de Músics</h1>
              </div>
              <div class="content">
                <h2>Detalls de la Submissió:</h2>
                <p><strong>Nom:</strong> ${nom}</p>
                <p><strong>Edat:</strong> ${edat}</p>
                <p><strong>Instrument:</strong> ${instrument}</p>
                <p><strong>Nivell:</strong> ${nivell}</p>
                <p><strong>Telèfon:</strong> ${telefon}</p>
                <p><strong>Correu:</strong> ${correu}</p>
                <p><strong>Antic Alumne:</strong> ${antic_alumne === 'si' ? 'Sí' : 'No'}</p>
              </div>
              <div class="footer">
                <p>Gràcies per la teva submissió. Si tens alguna pregunta, no dubtis en posar-te en contacte amb nosaltres.</p>
                <p><a href="mailto:${process.env.GMAIL_USER}">Contacta amb nosaltres</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Correu enviat correctament.');

    return res.status(200).json({ success: true, message: 'Formulari enviat correctament.' });
  } catch (error) {
    console.error('Error en l\'enviament del formulari:', error);
    return res.status(500).json({ success: false, message: 'Error en l\'enviament del formulari.' });
  }
});



app.post('/submit-portadors', async (req, res) => {
  const { nom, edat, telefon, correu, pes, alçada, antic_alumne, missatge } = req.body;
  
  if (!nom || !edat || !telefon || !correu || !pes || !alçada || !antic_alumne || !missatge) {
    return res.status(400).json({ success: false, message: 'Tots els camps són obligatoris.' });
  }

  try {
    const portador = new Portador({ nom, edat, telefon, correu, pes, alçada, antic_alumne, missatge });
    await portador.save();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.DESTINATARI_EMAIL,
      subject: 'Nova submissió del formulari de Portadors',
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f7fa; color: #333; margin: 0; padding: 0; }
              .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .header { background-color: #b71616ff; padding: 10px; color: #ffffff; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 20px; text-align: left; }
              .footer { text-align: center; font-size: 14px; color: #b10404ff; margin-top: 20px; }
              .footer a { color: #d21212ff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nova Submissió del Formulari de Portadors</h1>
              </div>
              <div class="content">
                <h2>Detalls de la Submissió:</h2>
                <p><strong>Nom:</strong> ${nom}</p>
                <p><strong>Edat:</strong> ${edat}</p>
                <p><strong>Telèfon:</strong> ${telefon}</p>
                <p><strong>Correu:</strong> ${correu}</p>
                <p><strong>Pes:</strong> ${pes} kg</p>
                <p><strong>Alçada:</strong> ${alçada} cm</p>
                <p><strong>Antic Alumne:</strong> ${antic_alumne === 'si' ? 'Sí' : 'No'}</p>
                <p><strong>Experiencia:</strong> ${message}</p>

              </div>
              <div class="footer">
                <p>Gràcies per la teva submissió. Si tens alguna pregunta, no dubtis en posar-te en contacte amb nosaltres.</p>
                <p><a href="mailto:${process.env.GMAIL_USER}">Contacta amb nosaltres</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Formulario enviado correctamente!' });
  } catch (error) {
    console.error("Error en l'enviament:", error);
    res.status(500).json({ success: false, message: 'Error en l\'enviament del formulari.' });
  }
});




// Schema per Cursa
const cursaSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  edat: { type: Number, required: true },
  correu: { type: String, required: true },
  telefon: { type: String, required: true },
  pagament: { type: String, required: true },
  entrades: { type: Number, required: true },
  data: { type: Date, default: Date.now }
});

// Model
const Cursa = mongoose.model('Cursa', cursaSchema);

// Endpoint submit-cursa
app.post('/submit-cursa', async (req, res) => {
  console.log('Dades rebudes del formulari de cursa:', req.body);

  const { nom, edat, correu, telefon, pagament, entrades } = req.body;

  // Comprovem que tots els camps són presents
  if (!nom || !edat || !correu || !telefon || !pagament || !entrades) {
    return res.status(400).json({ success: false, message: 'Tots els camps són obligatoris.' });
  }

  try {
    // Guardem a MongoDB
    const novaCursa = new Cursa({ nom, edat, correu, telefon, pagament, entrades });
    await novaCursa.save();
    console.log('Dades de la cursa guardades correctament:', novaCursa);

    // Mail HTML
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.DESTINATARI_EMAIL,
      subject: 'Nova submissió del formulari de Cursa',
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f7fa; color: #333; margin: 0; padding: 0; }
              .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
              .header { background-color: #be0d0dff; padding: 10px; color: #fff; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 20px; text-align: left; }
              .footer { text-align: center; font-size: 14px; color: #be0d0dff; margin-top: 20px; }
              .footer a { color: #be0d0dff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nova submissió del formulari de Cursa</h1>
              </div>
              <div class="content">
                <h2>Detalls de la cursa:</h2>
                <p><strong>Nom:</strong> ${nom}</p>
                <p><strong>Edat:</strong> ${edat}</p>
                <p><strong>Correu:</strong> ${correu}</p>
                <p><strong>Telèfon:</strong> ${telefon}</p>
                <p><strong>Tipus de pagament:</strong> ${pagament}</p>
                <p><strong>Numero de entrades:</strong> ${entrades}</p>
              </div>
              <div class="footer">
                <p>Gràcies per la teva submissió. Ens posarem en contacte amb tu aviat.</p>
                <p><a href="mailto:${process.env.GMAIL_USER}">Contacta amb nosaltres</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    console.log('Enviant email amb les dades:', { nom, edat, correu, telefon, pagament, entrades });
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Formulari de cursa enviat correctament i guardat a la base de dades.' });
  } catch (error) {
    console.error('Error al enviar el formulari de cursa:', error);
    res.status(500).json({ success: false, message: `Error enviant el formulari: ${error.message}` });
  }
});



app.post('/contacte', async (req, res) => {
  console.log('Dades rebudes del formulari de contacte:', req.body); // Verifiquem les dades rebudes

  // Comprovem que les dades necessàries estan presents
  const { nom, email, missatge } = req.body;
  if (!nom || !email || !missatge) {
    return res.status(400).json({ success: false, message: 'Tots els camps són obligatoris.' });
  }

  const nouContacte = new Contacte({
    nom,
    email,
    missatge
  });

  try {
    await nouContacte.save(); // Guardem les dades al MongoDB

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.DESTINATARI_EMAIL,
      subject: 'Nou missatge de contacte',
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f7fa; color: #333; margin: 0; padding: 0; }
              .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
              .header { background-color: #3a8ad9; padding: 10px; color: #ffffff; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 20px; text-align: left; }
              .footer { text-align: center; font-size: 14px; color: #888; margin-top: 20px; }
              .footer a { color: #3a8ad9; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nou missatge de contacte</h1>
              </div>
              <div class="content">
                <h2>Detalls del missatge:</h2>
                <p><strong>Nom:</strong> ${nom}</p>
                <p><strong>Correu:</strong> ${email}</p>
                <p><strong>Missatge:</strong> ${missatge}</p>
              </div>
              <div class="footer">
                <p>Gràcies per contactar amb nosaltres. Ens posarem en contacte amb tu aviat.</p>
                <p><a href="mailto:${process.env.GMAIL_USER}">Contacta amb nosaltres</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Missatge enviat correctament' });
  } catch (error) {
    console.error('Error al desar o enviar el missatge:', error);
    res.status(500).json({ success: false, message: 'Error al desar el missatge' });
  }
});


// CORREU BENVINGUDA
// Funció per enviar correus

async function enviarBenvinguda(email, username) {
  const mailOptions = {
    from: `"Cor de Maria" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Benvingut/da a Colla Gegantera!",
    html: `
      <div style="
        font-family: 'Arial', sans-serif;
        background: #fff;
        max-width: 650px;
        margin: 40px auto;
        padding: 40px;
        border-radius: 20px;
        border: 2px solid #D52B1E;
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      ">
        <h1 style="color:#D52B1E; text-align:center; margin-bottom:20px;">Benvingut/da, ${username}!</h1>
        <hr style="border:none; height:2px; background:#D52B1E; margin:20px 0;">
        <p style="color:#333; font-size:16px; line-height:1.6; text-align:center;">
          ¡Bon dia!
          Som la colla Gegantera del Cor de Maria
          Gràcies per registrar-te amb nosaltres ala nostre web. Estem molt contents de tenir-te a la nostra comunitat!
        </p>
        <p style="color:#333; font-size:16px; line-height:1.6; text-align:center;">
          Esperem que gaudeixis de totes les activitats i experiències de la colla.
        </p>
        <div style="text-align:center; margin:30px 0;">
          <a href="http://localhost:3000" style="
            display:inline-block;
            background:#D52B1E;
            color:#fff;
            padding:12px 30px;
            border-radius:10px;
            font-weight:bold;
            text-decoration:none;
            font-size:16px;
          ">Explora la nostra web</a>
        </div>
        <p style="margin-top:40px; text-align:right; color:#D52B1E; font-weight:bold;">
          — L’equip de Cor de Maria
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}


app.post('/save-username', async (req, res) => {
  const { username, email, password } = req.body;  // Aquí estem destructurant username i password del cos de la petició

  if (!username || !password) {
    console.log('Usuari o contrasenya no vàlids');
    return res.status(400).json({ success: false, message: 'Usuari o contrasenya no vàlids.' });
  }

  try {
    const existingUser = await Usuari.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Aquest nom d\'usuari ja està en ús.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Usuari({
      username,
      email,
      password: hashedPassword,  // Guardem la contrasenya com a hash
    });

    await newUser.save();
    res.status(200).json({ success: true, message: 'Usuari registrat correctament.' });
  } catch (error) {
    console.error('Error en desar l\'usuari:', error);
    res.status(500).json({ success: false, message: 'Error en desar l\'usuari.' });
  }
});
// 📥 Registre públic d'usuaris
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Tots els camps són obligatoris." });
    }

    const userExists = await Usuari.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Usuari o correu ja existeix." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usuari({
      username,
      email,
      password: hashedPassword,
      role: "usuari"
    });

    await newUser.save();                 // 🔹 Primer guardem
    await enviarBenvinguda(email, username); // 🔹 Després enviem el correu

    res.json({ success: true, message: "Usuari registrat correctament." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creant usuari." });
  }
});


app.post('/api/register-alt', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ success: false, message: 'Tots els camps són obligatoris.' });

    const exists = await Usuari.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ success: false, message: 'Usuari o correu ja existeix.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Usuari({ username, email, password: hashedPassword });

    await newUser.save();                 // 🔹 Guardem primer
    await enviarBenvinguda(email, username); // 🔹 Enviem correu després

// Al generar el token
const token = jwt.sign(
  { userId: user._id, username: user.username },
  process.env.JWT_SECRET || "secretkey",
  { expiresIn: "365d" }
);

    res.json({ success: true, message: 'Usuari registrat correctament', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creant usuari' });
  }
});






import jwt from 'jsonwebtoken';
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Usuari.findOne({ username });
    if (!user) return res.status(400).json({ success: false, message: 'Usuari no trobat.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ success: false, message: 'Contrasenya incorrecta.' });

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || "secretkey"
    );

    user.refreshToken = refreshToken;
    await user.save();

    const info = await InfoUsuari.findOne({ user: user._id });

    return res.json({
      success: true,
      message: 'Sessió iniciada correctament.',
      token: accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        image: info?.image || 'defaultuser.png',
        nom: info?.nom || '',
        cognoms: info?.cognoms || ''
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error al fer login.' });
  }
});



app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Usuari.findOne({ username });
    if (!user) return res.json({ success: false, message: 'Usuari no trobat' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json({ success: false, message: 'Contrasenya incorrecta' });

    // ✅ Generem token immediatament
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
 const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Contrasenya incorrecta' });

  // ✅ Aquí sí tenemos 'user'
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });

  user.refreshToken = refreshToken;
  await user.save();
    // ✅ Obtenim també la info del perfil
    const info = await InfoUsuari.findOne({ user: user._id });

    // ✅ Retornem tot en un sol pas
    return res.json({
      success: true,
      message: 'Sessió iniciada correctament.',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        info: info ? info.toObject() : {}
      }
    });

  } catch (err) {
    console.error('Error al fer login:', err);
    res.status(500).json({ success: false, message: 'Error al fer login.' });
  }
});



app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await Usuari.findById(req.user.userId);
    if (!user) return res.json({ success: false });

    // Buscar informació addicional
    const info = await InfoUsuari.findOne({ user: user._id });

    res.json({ 
      success: true, 
      user: {
        ...user.toObject(),
        ...(info ? info.toObject() : {})
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error carregant perfil' });
  }
});


app.put('/api/profile', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await Usuari.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuari no trobat' });

const {
  email,
  password,
  description,
  additionalInfo,
  gender,
  roleWeb,
  facebook,
  instagram,
  nom,
  cognoms,
  naixement,
  telefon,
  poblacio
} = req.body;


    // 🔹 Actualitza dades bàsiques només si arriben
    if (email && email.trim() !== '') user.email = email.trim();
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    // 🔹 Busca o crea InfoUsuari
    let info = await InfoUsuari.findOne({ user: userId });
    if (!info) info = new InfoUsuari({ user: userId });

    // 🔹 Només actualitza si hi ha dades (evitem sobreescriure amb buit)
    if (description !== undefined && description !== '') info.description = description;
    if (additionalInfo !== undefined && additionalInfo !== '') info.additionalInfo = additionalInfo;
    if (gender !== undefined && gender !== '') info.gender = gender;
    if (roleWeb !== undefined && roleWeb !== '') info.roleWeb = roleWeb;
    if (facebook !== undefined) info.facebook = facebook;
    if (instagram !== undefined) info.instagram = instagram;
    if (req.file) info.image = req.file.filename;
    if (nom !== undefined) info.nom = nom;
    if (cognoms !== undefined) info.cognoms = cognoms;
    if (naixement) info.naixement = new Date(naixement);
    if (telefon !== undefined) info.telefon = telefon;
    if (poblacio !== undefined) info.poblacio = poblacio;


    await info.save();

    res.json({ success: true, message: 'Perfil actualitzat correctament!' });

  } catch (err) {
    console.error('❌ Error al PUT /api/profile:', err);
    res.status(500).json({ success: false, message: 'Error actualitzant perfil', error: err.message });
  }
});





  // --- Modelo de sortides ---
// --- Modelo de sortides ---
const SortidaSchema = new mongoose.Schema({
  titol: {
    type: String,
    required: true,
    unique: true
  },
  data: {
    type: Date,
    required: true
  },
  hora: {
    type: String,       // ex: "18:30"
    required: true
  },
  lloc: {
    type: String,
    required: true
  },
  ubicacioMaps: {
    type: String,     // URL de Google Maps
    required: false
  },
  descripcio: {
    type: String,
    required: false
  },
  imatge: {
    type: String,       // ruta o URL de la imagen
    required: false,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Sortida = mongoose.model("Sortida", SortidaSchema);


 


// Després de mongoose.connect(...)
const UsuariSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin","usuari","editor","membre"], default: "usuari" },
  date: { type: Date, default: Date.now },
});
const Usuari = mongoose.model('Usuari', UsuariSchema);

const InfoUsuariSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuari' },
  description: String,
  additionalInfo: String,
  gender: String,
  roleWeb: String,
  roleWebValidat: { type: Boolean, default: false },
  facebook: String,
  instagram: String,
  image: String,
  nom: String,
  cognoms: String,
  naixement: Date,
  telefon: String,
  poblacio: String
}, { strict: true });
const InfoUsuari = mongoose.model('InfoUsuari', InfoUsuariSchema);


await InfoUsuari.updateMany({}, {
  $unset: { estatCivil: "" }
});


// ✅ SECCIÓ_PORTADORS — sense res en vermell

const portadorSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  arxius: [
    {
      nom: String,
      descripcio: String,
      tipus: String,
      mida: Number,
      url: String,
      dataPujada: { type: Date, default: () => Date.now() },
    },
  ],
  videos: [
    {
      titol: String,
      descripcio: String,
      url_video: String,
      data: { type: Date, default: () => Date.now() },
    },
  ],
  tasques: [
    {
      titol: String,
      descripcio: String,
      completada: { type: Boolean, default: false },
      data: { type: Date, default: () => Date.now() },
    },
  ],
  practiques: [
    {
      ubicacio: String,
      observacions: String,
      data: { type: Date, default: () => Date.now() },
    },
  ],
  notes: [
    {
      titol: String,
      contingut: String,
      categoria: String,
      data: { type: Date, default: () => Date.now() },
    },
  ],
});
const Portadorseccio = mongoose.model('Portadorseccio', portadorSchema);




const musicSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // 🎵 PARTITURES (PDF o imatge) + àudio adjunt
  partitures: [
    {
      nom: String,                // Nom de la cançó o fitxer
      descripcio: String,         // Opcional
      tipus: String,              // MIME type: image/png, application/pdf...
      mida: Number,               // Mida en bytes
      arxiuPartitura: String,     // Nom físic del fitxer guardat al servidor
      arxiuAudio: String,         // Nom físic del fitxer d’àudio adjunt
      dataPujada: { type: Date, default: () => Date.now() },
    },
  ],

  // 🎧 ÀUDIOS independents
  audios: [
    {
      nom: String,
      descripcio: String,
      tipus: String,
      mida: Number,
      arxiu: String,              // Nom del fitxer al servidor
      dataPujada: { type: Date, default: () => Date.now() },
    },
  ],

  // 🧾 TASQUES
  tasques: [
    {
      titol: String,
      descripcio: String,
      completada: { type: Boolean, default: false },
      data: { type: Date, default: () => Date.now() },
    },
  ],

  // 🎺 ASSAIGS
  assaigs: [
    {
      ubicacio: String,
      observacions: String,
      data: { type: Date, default: () => Date.now() },
    },
  ],

tasques: [
    {
      titol: String,
      descripcio: String,
      completada: { type: Boolean, default: false },
      data: { type: Date, default: () => Date.now() },
    },
  ],
  practiques: [
    {
      ubicacio: String,
      observacions: String,
      data: { type: Date, default: () => Date.now() },
    },
  ],
  notes: [
    {
      titol: String,
      contingut: String,
      categoria: String,
      data: { type: Date, default: () => Date.now() },
    },
  ],
});


const MusicSeccio = mongoose.model("MusicSeccio", musicSchema);

export { Usuari, InfoUsuari, Portadorseccio, MusicSeccio };






const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  file: { type: String, default: null },
});

const Message = mongoose.model('Message', messageSchema);




app.use(express.json());  // Middleware para parsear JSON
app.use(express.static('public')); // Para servir archivos estáticos como imágenes

app.post('/send-message', upload.single('file'), async (req, res) => {
  const { username, message } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!message && !file) {
    return res.status(400).json({ success: false, message: 'Missatge o fitxer requerit' });
  }

  try {
    const newMessage = new Message({ username, message, file, timestamp: new Date() });
    await newMessage.save();

    res.json({ success: true, message: { username, message, file, timestamp: newMessage.timestamp } });
  } catch (err) {
    console.error('❌ Error guardant missatge:', err);
    res.status(500).json({ success: false, message: 'Error guardant missatge' });
  }
});


// 💬 Obtenir tots els missatges amb imatge de perfil
// 📨 Obtenir tots els missatges (amb foto de perfil segura)
app.get("/get-messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        try {
          // Cerquem usuari pel seu nom
          const usuari = await Usuari.findOne({ username: msg.username });
          let info = null;
          if (usuari) {
            info = await InfoUsuari.findOne({ user: usuari._id });
          }

          // Ruta segura de la imatge
          let imagePath = "/uploads/defaultuser.png";
          if (info && info.image && info.image.trim() !== "") {
            imagePath = `/uploads/${info.image}`;
          }

          return {
            ...msg.toObject(),
            image: imagePath,
          };
        } catch (err) {
          console.warn(`⚠️ No s'ha pogut carregar la imatge per ${msg.username}:`, err);
          return {
            ...msg.toObject(),
            image: "/uploads/defaultuser.png",
          };
        }
      })
    );

    res.json({ success: true, messages: enrichedMessages });
  } catch (err) {
    console.error("❌ Error obtenint missatges:", err);
    res.status(500).json({ success: false, message: "Error obtenint missatges" });
  }
});




// 👤 Retorna tots els perfils amb nom i imatge
app.get('/api/all-profiles', async (req, res) => {
  try {
    const infoUsuaris = await InfoUsuari.find({}, 'user image').populate('user', 'username');

    const users = infoUsuaris.map(info => ({
      username: info.user?.username || 'Desconegut',
      image: info.image ? `/uploads/${info.image}` : '/images/default_profile.png'
    }));

    res.json({ success: true, users });
  } catch (err) {
    console.error('❌ Error carregant perfils:', err);
    res.status(500).json({ success: false, message: 'Error carregant perfils' });
  }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir)); // primero

// Objeto temporal para almacenar códigos de recuperación: { username: { code, expires } }
const recoveryCodes = {};

// --- Rutas amigables ---
const rutas = [
  { url: '/', file: 'index.html' },
  { url: '/cercavila', file: 'cercaviles.html' },
  { url: '/chat', file: 'chat.html' },
  { url: '/cursa', file: 'cursa.html' },
  { url: '/contacte', file: 'contacte.html' },
  { url: '/membres', file: 'equip.html' },
  { url: '/experiencies', file: 'experiencies.html' },
  { url: '/carnaval', file: 'carnaval.html' },
  { url: '/festa-major', file: 'festam.html' },
  { url: '/festa-tardor', file: 'festatar.html' },
  { url: '/formulari-musica', file: 'formulari-musica.html' },
  { url: '/formulari-portador', file: 'formulari-portador.html' },
  { url: '/home', file: 'menu.html' },
  { url: '/sant-jordi', file: 'sant_jordi.html' },
  { url: '/uneixte', file: 'uneixte.html' },
  { url: '/admin', file: 'admin.html' },
  { url: '/perfil', file: 'login_profile.html' },
  {url: '/seccio-musics', file: 'seccio-musics.html'},
  {url: '/seccio-portadors', file: 'seccio-portadors.html'}


];

app.get('/:random/pagament', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pagament.html'));
});

// Funció per generar una cadena aleatòria
function generarRutaAleatoria(longitud = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let resultado = '';
  for (let i = 0; i < longitud; i++) {
    resultado += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return resultado;
}



// --- Middleware per verificar token JWT ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "Token no proporcionat" });

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, user) => {
    if (err)
      return res.status(403).json({ success: false, message: "Token invàlid" });
    req.user = user;
    next();
  });
}

// --- Middleware genèric per comprovar rol web ---
function checkRoleWeb(requiredRole) {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const info = await InfoUsuari.findOne({ user: userId });

      if (!info) {
        return res.status(403).json({ success: false, message: "Usuari sense perfil d'informació" });
      }

      if (!info.roleWebValidat) {
        return res.status(403).json({ success: false, message: "El rol web no ha estat validat" });
      }

      if (info.roleWeb !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Accés restringit. Es requereix rol: ${requiredRole}`,
        });
      }

      next();
    } catch (err) {
      console.error("Error comprovant rol web:", err);
      res.status(500).json({ success: false, message: "Error intern del servidor" });
    }
  };
}





// RECUPERAR PASSWORD CODIGOS

app.post('/api/send-recovery-code', async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'Usuari i email requerits.' });
  }

  try {
    const user = await Usuari.findOne({ username, email });
    if (!user) return res.status(404).json({ success: false, message: 'Usuari o email no trobat.' });

    // Generar código aleatorio 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en memoria con expiración de 15 min
    recoveryCodes[username] = {
      code,
      expires: Date.now() + 15 * 60 * 1000
    };

const mailOptions = {
  from: `"Cor de Maria" <${process.env.GMAIL_USER}>`,
  to: email,
  subject: 'Recuperació de contrasenya',
  html: `
    <div style="font-family: Arial, sans-serif; background:#ffffff; padding:30px; border-radius:15px; max-width:600px; margin:auto; border:2px solid #D52B1E;">
      <h2 style="text-align:center; color:#D52B1E;">Recuperació de contrasenya</h2>
      <p style="color:#333; font-size:16px; line-height:1.5;">
        Hola <strong>${username}</strong>! Hem rebut una sol·licitud per recuperar la teva contrasenya.
      </p>
      <p style="text-align:center; margin:30px 0;">
        <span style="display:inline-block; padding:15px 25px; font-size:24px; font-weight:bold; color:#ffffff; background:#D52B1E; border-radius:12px; letter-spacing:4px;">
          ${code}
        </span>
      </p>
      <p style="color:#333; font-size:14px; line-height:1.4;">
        Aquest codi és vàlid només durant 15 minuts. Si no has sol·licitat la recuperació, ignora aquest correu.
      </p>
      <p style="margin-top:30px; text-align:right; color:#D52B1E; font-weight:bold;">— L’equip de Cor de Maria</p>
    </div>
  `
};

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Codi enviat correctament al teu correu.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error enviant codi de recuperació.' });
  }
});

// VALIDAR CODIGO

app.post('/api/verify-recovery-code', (req, res) => {
  const { username, code } = req.body;

  if (!username || !code) return res.status(400).json({ success: false, message: 'Dades requerides.' });

  const record = recoveryCodes[username];
  if (!record) return res.status(404).json({ success: false, message: 'No s’ha generat cap codi per a aquest usuari.' });

  if (Date.now() > record.expires) {
    delete recoveryCodes[username];
    return res.status(400).json({ success: false, message: 'Codi caducat.' });
  }

  if (record.code !== code) return res.status(400).json({ success: false, message: 'Codi incorrecte.' });

  res.json({ success: true, message: 'Codi validat correctament.' });
});


// MODIFICAR PASS

app.post('/api/reset-password', async (req, res) => {
  let { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ success: false, message: 'Dades requerides.' });
  }

  // Trim per eliminar espais en blanc al principi i al final
  newPassword = newPassword.trim();

  try {
    const user = await Usuari.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: 'Usuari no trobat.' });

    // Regex per seguretat
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()_\-+])[A-Za-z\d@$!%*?&()_\-+]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'La contrasenya ha de tenir mínim 8 caràcters, incloure majúscules, minúscules, números i un caràcter especial.' });
    }


    // Hashem i guardem la nova contrasenya
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Eliminem codi de recuperació
    delete recoveryCodes[username];

    // Retornem JSON amb informació de redirecció
    res.json({ success: true, message: 'Contrasenya canviada correctament.', redirect: 'http://localhost:3000/home' });

  } catch (err) {
    console.error('Error al canviar la contrasenya:', err);
    res.status(500).json({ success: false, message: 'Error al canviar la contrasenya.' });
  }
});



// Generar ruta aleatòria i afegir-la a les rutes
const rutaAleatoria = '/recuperar/' + generarRutaAleatoria();
rutas.push({ url: rutaAleatoria, file: 'recuperar.html' });



app.get('/recuperar/:rutaAleatoria', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'recuperar.html'));
});













console.log('Ruta aleatòria per recuperar contrasenya:', rutaAleatoria);


rutas.forEach(route => {
  app.get(route.url, (req, res) => {
    res.sendFile(path.join(publicDir, route.file));
  });
});

app.get("/get-users", async (req, res) => {
  try {
    const users = await Usuari.find().sort({ date: -1 }).lean();
    const infos = await InfoUsuari.find().lean();

    const cleanUsers = users.map(u => {
      // Busquem info del usuari amb comparació segura d'ObjectId
      const info = infos.find(i => i.user?.toString() === u._id.toString());

      return {
        _id: u._id,
        username: u.username,
        email: u.email,
        role: u.role || "usuari",  // rol normal
        date: u.date,
        password: "********",
        roleWeb: info?.roleWeb || "No assignat", // Mostra rol web si existeix
        validacioWebRol: info ? (info.roleWebValidat ? "Validat" : "No validat") : "No validat"
      };
    });

    res.json(cleanUsers);
  } catch (err) {
    console.error("Error obtenint usuaris:", err);
    res.status(500).json({ success: false, message: "Error obtenint usuaris" });
  }
});


// 📤 Crear usuario
// 📤 Crear nuevo usuario
// 📤 Crear o actualitzar usuari amb validació del rol web
app.post("/admin/users", async (req, res) => {
  try {
    const { username, password, email, role, infoWeb } = req.body;

    if (!username || !password || !email)
      return res.status(400).json({ success: false, message: "Camps obligatoris" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const nouUsuari = new Usuari({ username, password: hashedPassword, email, role });
    await nouUsuari.save();

    // ✅ Si hi ha infoWeb, la guardem
    if (infoWeb?.roleWeb) {
      await InfoUsuari.findOneAndUpdate(
        { user: nouUsuari._id },
        {
          user: nouUsuari._id,
          roleWeb: infoWeb.roleWeb,
          roleWebValidat: infoWeb.roleWebValidat ?? false
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, user: nouUsuari });
  } catch (err) {
    console.error("Error creant usuari:", err);
    res.status(500).json({ success: false, message: "Error creant usuari" });
  }
});




// 📤 Crear usuario (si lo necesitas)
app.put('/api/profile', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Usuari.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuari no trobat' });

    const {
      email, password, description, additionalInfo, gender, roleWeb,
      facebook, instagram, nom, cognoms, naixement, telefon, poblacio
    } = req.body;

    console.log('PUT /api/profile req.body:', req.body);

    // Actualitza usuari
    if (email) user.email = email.trim();
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();

    // Troba o crea InfoUsuari
    let info = await InfoUsuari.findOne({ user: userId });
    if (!info) info = new InfoUsuari({ user: userId });

    if (description) info.description = description;
    if (additionalInfo) info.additionalInfo = additionalInfo;
    if (gender) info.gender = gender;
    if (roleWeb) info.roleWeb = roleWeb;
    if (facebook) info.facebook = facebook;
    if (instagram) info.instagram = instagram;
    if (req.file) info.image = req.file.filename;
    if (nom) info.nom = nom;
    if (cognoms) info.cognoms = cognoms;

if (naixement && naixement.trim() !== '') {
  let parsedDate = new Date(naixement);

  // Si no és vàlid, provem DD/MM/YYYY
  if (isNaN(parsedDate)) {
    const parts = naixement.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mes base 0
      const year = parseInt(parts[2], 10);
      parsedDate = new Date(year, month, day);
    }
  }

  if (!isNaN(parsedDate)) {
    info.naixement = parsedDate;
    console.log('Data de naixement guardada:', info.naixement);
  } else {
    console.warn('Data de naixement no vàlida:', naixement);
  }
}


    if (telefon) info.telefon = telefon;
    if (poblacio) info.poblacio = poblacio;

    await info.save();

    res.json({ success: true, message: 'Perfil actualitzat correctament!', naixement: info.naixement });
  } catch (err) {
    console.error('Error PUT /api/profile:', err);
    res.status(500).json({ success: false, message: 'Error actualitzant perfil', error: err.message });
  }
});


// 🗑️ Eliminar usuario
app.delete("/admin/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await Usuari.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "Usuari no trobat" });
    }

    res.json({ success: true, message: "Usuario eliminat correctament" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error actualizant usuari" });
  }
});


app.get("/admin/sortides", async (req, res) => {
  try {
    const sortides = await Sortida.find().sort({ data: -1 });
    res.json(sortides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error obtenint sortides" });
  }
});

// 📤 Crear una sortida
app.post("/admin/sortides", multer({ dest: "public/uploads" }).single("imatge"), async (req, res) => {
  try {
    const { titol, data, hora, lloc, descripcio, ubicacioMaps } = req.body;
    const imatge = req.file ? req.file.filename : null;

    const novaSortida = new Sortida({
      titol,
      data,
      hora,
      lloc,
      descripcio,
      ubicacioMaps,   // ⭐ nou camp
      imatge
    });

    await novaSortida.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creant sortida" });
  }
});

// ✏️ Actualitzar una sortida
app.put("/admin/sortides/:id", upload.single("imatge"), async (req, res) => {
  try {
    const id = req.params.id;

    const updateData = {
      titol: req.body.titol,
      data: req.body.data,
      hora: req.body.hora,
      lloc: req.body.lloc,
      descripcio: req.body.descripcio,
      ubicacioMaps: req.body.ubicacioMaps,   // ⭐ nou camp
    };

    if (req.file) {
      updateData.imatge = req.file.filename;
    }

    const sortida = await Sortida.findByIdAndUpdate(id, updateData, { new: true });
    if (!sortida) return res.status(404).json({ success: false, message: "Sortida no trobada" });

    res.json({ success: true, sortida });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});



// ✏️ Actualitzar usuari (inclou validació roleWeb)
app.put("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password, infoWeb } = req.body;

    const user = await Usuari.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "Usuari no trobat" });

    // 🔹 Actualitza dades bàsiques
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password && password !== "********") {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    // 🔹 Actualitza InfoUsuari si infoWeb arriba
    if (infoWeb) {
      const updateData = {
        user: user._id,
        roleWeb: infoWeb.roleWeb ?? undefined,
        roleWebValidat: infoWeb.roleWebValidat === true
      };

      await InfoUsuari.findOneAndUpdate(
        { user: user._id },
        updateData,
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: "Usuari actualitzat correctament" });
  } catch (err) {
    console.error("Error actualitzant usuari:", err);
    res.status(500).json({ success: false, message: "Error actualitzant usuari" });
  }
});



// 🗑️ Eliminar una sortida
app.delete("/admin/sortides/:id", async (req, res) => {
  try {
    const deletedSortida = await Sortida.findByIdAndDelete(req.params.id);
    if (!deletedSortida) {
      return res.status(404).json({ success: false, message: "Sortida no trobada" });
    }
    res.json({ success: true, message: "Sortida eliminada correctament" });
  } catch (err) {
    console.error("Error eliminant sortida:", err);
    res.status(500).json({ success: false, message: "Error eliminant sortida" });
  }
});


app.put("/admin/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, email, role } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    if (password && password !== "********") {
      // Hash de la nova contrasenya
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await Usuari.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

    if (!updatedUser) return res.status(404).json({ success: false, message: "Usuari no trobat" });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error actualitzant usuari" });
  }
});
const storageArxius = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadArxius = multer({ storage: storageArxius });

const storageVideos = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/videos/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadVideos = multer({ storage: storageVideos });
// 📁 Configuració de MULTER per a la secció MÚSICS
const storageMusics = multer.diskStorage({
  destination: (req, file, cb) => {
    // Guardem PDFs, imatges i àudios dins la carpeta "uploads/musics/"
    cb(null, 'uploads/musics/');
  },
  filename: (req, file, cb) => {
    // Evitem conflictes de noms: afegim el timestamp
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const storagePartitures = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/partitures/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const uploadPartitures = multer({ storage: storagePartitures });

const uploadAudios = multer({
  storage: storageAudios,
  limits: { fileSize: 100 * 1024 * 1024 }, // fins a 100 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "audio/mpeg", // mp3
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/webm",
      "audio/m4a",
      "audio/x-m4a",
      "audio/aac",
      "audio/flac",
    ];
    if (!allowed.includes(file.mimetype)) {
      console.warn("⛔ Fitxer rebutjat per tipus:", file.mimetype);
      return cb(new Error("Només s'accepten fitxers d'àudio"), false);
    }
    cb(null, true);
  },
});

export { uploadAudios };

const uploadMusics = multer({ storage: storageMusics });

// 📅 Ruta per obtenir sortides per mes i any
app.get("/sortides", async (req, res) => {
  try {
    const { any, mes } = req.query;
    if (!any || !mes) {
      return res.status(400).json({ success: false, message: "Falten paràmetres any o mes." });
    }

    const startDate = new Date(any, mes - 1, 1);
    const endDate = new Date(any, mes, 0, 23, 59, 59);

    const sortides = await Sortida.find({
      data: { $gte: startDate, $lte: endDate }
    }).sort({ data: 1 });

    res.json({ success: true, sortides });
  } catch (err) {
    console.error("Error obtenint sortides:", err);
    res.status(500).json({ success: false, message: "Error al obtenir les sortides." });
  }
});


// Endpoint per comprovar sessió
app.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Token vàlid', userId: req.user.userId });
});



// -----------------------------
// 🔹 Helper: crea usuari si no existeix
// -----------------------------
async function getOrCreateUser(userId) {
  let user = await Portadorseccio.findOne({ userId });

  if (!user) {
    user = await Portadorseccio.create({
      userId,
      arxius: [],
      videos: [],
      tasques: [],
      practiques: [],
      notes: [],
    });
  } else {
    if (!Array.isArray(user.arxius)) user.arxius = [];
    if (!Array.isArray(user.videos)) user.videos = [];
    if (!Array.isArray(user.tasques)) user.tasques = [];
    if (!Array.isArray(user.practiques)) user.practiques = [];
    if (!Array.isArray(user.notes)) user.notes = [];

    await user.save();
  }

  return user;
}


// --- ARXIUS ---
app.get("/api/portadors/:userId/arxius", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  res.json(user.arxius || []);
});

app.post("/api/portadors/:userId/arxius", uploadArxius.single("arxiu"), async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    if (!req.file) return res.status(400).json({ error: "Fitxer requerit" });

    user.arxius = user.arxius || [];

    // 🔒 Evita duplicats per nom (ignorant majúscules/minúscules)
    const nomNormalitzat = req.file.originalname.trim().toLowerCase();

    const jaExisteix = user.arxius.some(
      (a) => a.nom.trim().toLowerCase() === nomNormalitzat
    );

    if (jaExisteix) {
      return res.status(409).json({
        ok: false,
        error: "Aquest fitxer ja està pujat 🚫",
      });
    }

    const nouArxiu = {
      nom: req.file.originalname,
      descripcio: req.body.descripcio || "",
      tipus: req.file.mimetype,
      mida: req.file.size || 0,
      url: `/uploads/${req.file.filename}`,
      data: new Date(),
    };

    // 🧠 Guardat segur
    user.arxius.push(nouArxiu);
    await user.save();

    res.json({
      ok: true,
      missatge: "Arxiu afegit correctament ✅",
      arxiu: nouArxiu,
    });
  } catch (err) {
    console.error("Error pujant arxiu:", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

app.delete("/api/portadors/:userId/arxius/:id", async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    const arxiu = user.arxius.id(req.params.id);
    if (!arxiu) return res.status(404).json({ error: "Arxiu no trobat" });
    arxiu.deleteOne();
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminant arxiu:", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

// --- VIDEOS ---
app.get("/api/portadors/:userId/videos", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  res.json(user.videos);
});

app.post("/api/portadors/:userId/videos", uploadVideos.single("video"), async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  if (!req.file) return res.status(400).json({ error: "Vídeo requerit" });

  const nouVideo = {
    titol: req.body.titol || "",
    descripcio: req.body.descripcio || "",
    url_video: `/uploads/videos/${req.file.filename}`,
    data: new Date(),
  };

  user.videos.push(nouVideo);
  await user.save();

  res.json({
    ok: true,
    missatge: "Vídeo afegit correctament 🎬",
    video: nouVideo,
  });
});

app.delete("/api/portadors/:userId/videos/:id", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  const video = user.videos.id(req.params.id);
  if (!video) return res.status(404).json({ error: "Vídeo no trobat" });
  video.remove();
  await user.save();
  res.json({ ok: true });
});

// --- TASQUES ---
app.get("/api/portadors/:userId/tasques", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  res.json(user.tasques);
});

app.post("/api/portadors/:userId/tasques", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  user.tasques.push(req.body);
  await user.save();

  const novaTasca = user.tasques.at(-1);
  res.json({
    ok: true,
    missatge: "Tasca afegida correctament 📝",
    tasca: novaTasca,
  });
});

app.delete("/api/portadors/:userId/tasques/:id", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  const t = user.tasques.id(req.params.id);
  if (!t) return res.status(404).json({ error: "Tasca no trobada" });
  t.remove();
  await user.save();
  res.json({ ok: true });
});

// --- PRÀCTIQUES ---
app.get("/api/portadors/:userId/practiques", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  res.json(user.practiques);
});

app.post("/api/portadors/:userId/practiques", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  user.practiques.push(req.body);
  await user.save();

  const novaPractica = user.practiques.at(-1);
  res.json({
    ok: true,
    missatge: "Pràctica afegida correctament 💪",
    practica: novaPractica,
  });
});

app.delete("/api/portadors/:userId/practiques/:id", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  const p = user.practiques.id(req.params.id);
  if (!p) return res.status(404).json({ error: "Pràctica no trobada" });
  p.remove();
  await user.save();
  res.json({ ok: true });
});

// --- NOTES ---
app.get("/api/portadors/:userId/notes", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  res.json(user.notes);
});

app.post("/api/portadors/:userId/notes", async (req, res) => {
  const user = await getOrCreateUser(req.params.userId);
  user.notes.push(req.body);
  await user.save();

  const novaNota = user.notes.at(-1);
  res.json({
    ok: true,
    missatge: "Nota afegida correctament 🗒️",
    nota: novaNota,
  });
});

app.delete("/api/portadors/:userId/notes/:id", async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);

    const existent = user.notes.id(req.params.id);
    if (!existent) return res.status(404).json({ error: "Nota no trobada" });

    // 🔥 Elimina la nota de forma segura
    user.notes.pull({ _id: req.params.id });
    await user.save();

    res.json({ ok: true, missatge: "Nota eliminada correctament 🗑️" });
  } catch (err) {
    console.error("Error eliminant nota:", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

// SECCIO MUSICS

async function getOrCreateMusicUser(userId) {
  let user = await MusicSeccio.findOne({ userId });

  if (!user) {
    user = await MusicSeccio.create({
      userId,
      partitures: [],
      audios: [],
      tasques: [],
      practiques: [],
      notes: [],
    });
  } else {
    // 🔒 Assegurem que totes les propietats siguin arrays
    if (!Array.isArray(user.partitures)) user.partitures = [];
    if (!Array.isArray(user.audios)) user.audios = [];
    if (!Array.isArray(user.tasques)) user.tasques = [];
    if (!Array.isArray(user.practiques)) user.practiques = [];
    if (!Array.isArray(user.notes)) user.notes = [];
    await user.save();
  }

  return user;
}


app.get("/api/musics/:userId", async (req, res) => {
  try {
    const user = await getOrCreateMusicUser(req.params.userId);

    res.json({
      partitures: user.partitures || [],
      audios: user.audios || [],
      tasques: user.tasques || [],
      practiques: user.practiques || [],
      notes: user.notes || [],
    });
  } catch (err) {
    console.error("Error obtenint dades del músic:", err);
    res.status(500).json({ error: "Error obtenint dades del músic" });
  }
});




// ==================== MÚSICS - ARXIUS ====================

app.get("/api/musics/:userId/arxius", async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    res.json(user.arxius || []);
  } catch (err) {
    console.error("Error obtenint arxius (musics):", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

app.post("/api/musics/:userId/arxius", uploadArxius.single("arxiu"), async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    if (!req.file) return res.status(400).json({ error: "Fitxer requerit" });

    user.arxius = user.arxius || [];

    // Evita duplicats per nom
    const nomNormalitzat = req.file.originalname.trim().toLowerCase();
    const jaExisteix = user.arxius.some(
      (a) => a.nom.trim().toLowerCase() === nomNormalitzat
    );
    if (jaExisteix) {
      return res.status(409).json({
        ok: false,
        error: "Aquest fitxer ja està pujat 🚫",
      });
    }

    const nouArxiu = {
      nom: req.file.originalname,
      descripcio: req.body.descripcio || "",
      tipus: req.file.mimetype,
      mida: req.file.size || 0,
      url: `/uploads/${req.file.filename}`,
      data: new Date(),
    };

    user.arxius.push(nouArxiu);
    await user.save();

    res.json({
      ok: true,
      missatge: "Arxiu afegit correctament ✅",
      arxiu: nouArxiu,
    });
  } catch (err) {
    console.error("Error pujant arxiu (musics):", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

app.delete("/api/musics/:userId/arxius/:id", async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    const arxiu = user.arxius.id(req.params.id);
    if (!arxiu) return res.status(404).json({ error: "Arxiu no trobat" });

    arxiu.deleteOne();
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminant arxiu (musics):", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});


// ==================== PARTITURES ====================
app.get("/api/musics/:userId/partitures", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  res.json(user.partitures || []);
});

app.post(
  "/api/musics/:userId/partitures",
  uploadPartitures.fields([
    { name: "partitura" },
    { name: "audio" },
  ]),
  async (req, res) => {
    try {
      const user = await getOrCreateMusicUser(req.params.userId);

      const partituraFile = req.files["partitura"]?.[0];
      const audioFile = req.files["audio"]?.[0];

      if (!partituraFile) {
        return res.status(400).json({ error: "Partitura requerida" });
      }

      const novaPartitura = {
        nom: partituraFile.originalname,
        descripcio: req.body.descripcio || "",
        tipus: partituraFile.mimetype,
        mida: partituraFile.size,
        arxiuPartitura: `/uploads/partitures/${partituraFile.filename}`,
        arxiuAudio: audioFile ? `/uploads/audios/${audioFile.filename}` : "",
        dataPujada: new Date(),
      };

      if (!Array.isArray(user.partitures)) user.partitures = [];
      user.partitures.push(novaPartitura);
      await user.save();

      res.json({ ok: true, missatge: "Partitura pujada ✅", partitura: novaPartitura });
    } catch (err) {
      console.error("Error pujant partitura:", err);
      res.status(500).json({ error: "Error intern del servidor" });
    }
  }
);

app.delete("/api/musics/:userId/partitures/:id", async (req, res) => {
  try {
    const user = await getOrCreateMusicUser(req.params.userId);
    const partitura = user.partitures.id(req.params.id);
    if (!partitura) return res.status(404).json({ error: "Partitura no trobada" });

    partitura.deleteOne();
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminant partitura:", err);
    res.status(500).json({ error: "Error eliminant partitura" });
  }
});

// ==================== ÀUDIOS ====================
app.get("/api/musics/:userId/audios", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  res.json(user.audios || []);
});

app.post("/api/musics/:userId/audios", uploadAudios.single("audio"), async (req, res) => {
  try {
    console.log("📥 Fitxer rebut:", req.file);
    console.log("🧾 Body:", req.body);

    const user = await getOrCreateMusicUser(req.params.userId);
    if (!req.file) {
      console.log("❌ No s'ha rebut cap fitxer d'àudio!");
      return res.status(400).json({ error: "Àudio requerit" });
    }

    const nouAudio = {
      nom: req.file.originalname,
      descripcio: req.body.descripcio || "",
      tipus: req.file.mimetype,
      mida: req.file.size,
      arxiu: `/uploads/audios/${req.file.filename}`,
      dataPujada: new Date(),
    };

    if (!Array.isArray(user.audios)) user.audios = [];
    user.audios.push(nouAudio);
    await user.save();

    console.log("✅ Àudio pujat correctament:", nouAudio);
    res.json({ ok: true, missatge: "Àudio afegit correctament 🎵", audio: nouAudio });

  } catch (err) {
    console.error("💥 Error pujant àudio:", err);
    res.status(500).json({ error: "Error intern del servidor" });
  }
});


app.delete("/api/musics/:userId/audios/:id", async (req, res) => {
  try {
    const user = await getOrCreateMusicUser(req.params.userId);
    const audio = user.audios.id(req.params.id);
    if (!audio) return res.status(404).json({ error: "Àudio no trobat" });
    audio.deleteOne();
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error eliminant àudio" });
  }
});

// --- MÚSICS - VIDEOS ---
app.get("/api/musics/:userId/videos", async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    res.json(user.videos || []);
  } catch (err) {
    console.error("Error obtenint vídeos (musics):", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

app.post("/api/musics/:userId/videos", uploadVideos.single("video"), async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    if (!req.file) return res.status(400).json({ error: "Vídeo requerit" });

    const nouVideo = {
      titol: req.body.titol || "",
      descripcio: req.body.descripcio || "",
      url_video: `/uploads/videos/${req.file.filename}`,
      data: new Date(),
    };

    user.videos.push(nouVideo);
    await user.save();

    res.json({
      ok: true,
      missatge: "Vídeo afegit correctament 🎬",
      video: nouVideo,
    });
  } catch (err) {
    console.error("Error pujant vídeo (musics):", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});

app.delete("/api/musics/:userId/videos/:id", async (req, res) => {
  try {
    const user = await getOrCreateUser(req.params.userId);
    const video = user.videos.id(req.params.id);
    if (!video) return res.status(404).json({ error: "Vídeo no trobat" });
    video.deleteOne();
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminant vídeo (musics):", err);
    res.status(500).json({ ok: false, error: "Error intern del servidor" });
  }
});



// ==================== TASQUES ====================
app.get("/api/musics/:userId/tasques", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  res.json(user.tasques || []);
});

app.post("/api/musics/:userId/tasques", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  if (!Array.isArray(user.tasques)) user.tasques = [];
  user.tasques.push(req.body);
  await user.save();
  res.json({ ok: true, missatge: "Tasca afegida 📝" });
});

app.delete("/api/musics/:userId/tasques/:id", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  const tasca = user.tasques.id(req.params.id);
  if (!tasca) return res.status(404).json({ error: "Tasca no trobada" });
  tasca.deleteOne();
  await user.save();
  res.json({ ok: true });
});

// ==================== PRÀCTIQUES ====================
app.get("/api/musics/:userId/practiques", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  res.json(user.practiques || []);
});

app.post("/api/musics/:userId/practiques", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  if (!Array.isArray(user.practiques)) user.practiques = [];
  user.practiques.push(req.body);
  await user.save();
  res.json({ ok: true, missatge: "Pràctica afegida 💪" });
});

app.delete("/api/musics/:userId/practiques/:id", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  const p = user.practiques.id(req.params.id);
  if (!p) return res.status(404).json({ error: "Pràctica no trobada" });
  p.deleteOne();
  await user.save();
  res.json({ ok: true });
});

// ==================== NOTES ====================
app.get("/api/musics/:userId/notes", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  res.json(user.notes || []);
});

app.post("/api/musics/:userId/notes", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  if (!Array.isArray(user.notes)) user.notes = [];
  user.notes.push(req.body);
  await user.save();
  res.json({ ok: true, missatge: "Nota afegida 🗒️" });
});

app.delete("/api/musics/:userId/notes/:id", async (req, res) => {
  const user = await getOrCreateMusicUser(req.params.userId);
  const nota = user.notes.id(req.params.id);
  if (!nota) return res.status(404).json({ error: "Nota no trobada" });
  nota.deleteOne();
  await user.save();
  res.json({ ok: true });
});

export default app;


// PROCESOS PAGAMENTS ENTRADA/NUMERO CURSA




const stripe = new Stripe("sk_test_XXXXXXXXXXXXXXXXXXXXXXXX"); // CLAU SECRETA

app.post("/api/pagar", async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    const intent = await stripe.paymentIntents.create({
      amount: 500, // 5,00€
      currency: "eur",
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.json({ success: true, clientSecret: intent.client_secret });

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});



// Manejo de 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(publicDir, '404.html'));
});


// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});

