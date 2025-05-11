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
router.post('/login', authController.login);

// Route pour demander un lien de réinitialisation de mot de passe
router.post('/forgot-password/:type', authController.forgotPassword);

// Route pour réinitialiser le mot de passe avec le token
router.post('/reset-password/:type/:token', authController.resetPassword);

module.exports = router;
