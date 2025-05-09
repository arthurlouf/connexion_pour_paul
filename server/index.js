// server/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Configuration CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

// Utilisation des routes pour chaque type d'utilisateur
app.use('/api/auth', require('./routes/authRoutes'));


app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
