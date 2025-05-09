// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Vérifie que authController est bien un objet avec des fonctions
console.log("📝 authController :", authController);

// Route pour l'inscription
router.post('/register/:type', authController.register);

// Route de vérification pour les comptes
router.get('/verify/:type/:token', authController.verifyEmail);

// Route pour la connexion
router.post('/login/:type', authController.login);

module.exports = router;
