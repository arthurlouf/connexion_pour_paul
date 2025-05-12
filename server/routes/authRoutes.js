// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    verifyEmail, 
    forgotPassword, 
    resetPassword, 
    requestRoleConfirmation, 
    confirmRole 
} = require('../controllers/authController');

// ✅ Vérification du chargement des fonctions du contrôleur
console.log("📝 AuthController chargé avec succès");

// ✅ Rôles valides
const VALID_ROLES = ["agent", "proprietaire", "locataire"];

// ✅ Route pour l'inscription (avec validation des rôles)
router.post('/register/:type', (req, res, next) => {
    try {
        const { type } = req.params;
        console.log(`📝 Tentative d'inscription avec le rôle : ${type}`);

        if (!VALID_ROLES.includes(type)) {
            console.log(`⚠️ Rôle invalide : ${type}`);
            return res.status(400).json({ error: "Rôle invalide." });
        }

        // Passe au contrôleur si le rôle est valide
        console.log(`✅ Rôle valide : ${type} - Enregistrement en cours...`);
        register(req, res, next);
    } catch (error) {
        console.error("🚨 Erreur lors de l'inscription :", error);
        res.status(500).json({ error: "Erreur lors de l'inscription." });
    }
});

// ✅ Route pour la vérification des comptes
router.get('/verify/:token', (req, res, next) => {
    console.log(`🔍 Vérification du token : ${req.params.token}`);
    verifyEmail(req, res, next);
});

// ✅ Route pour la connexion
router.post('/login', (req, res, next) => {
    console.log("🔑 Tentative de connexion");
    login(req, res, next);
});

// ✅ Route pour demander un lien de réinitialisation de mot de passe
router.post('/forgot-password', (req, res, next) => {
    console.log("🔑 Demande de réinitialisation de mot de passe");
    forgotPassword(req, res, next);
});

// ✅ Route pour réinitialiser le mot de passe avec le token
router.post('/reset-password/:token', (req, res, next) => {
    console.log(`🔄 Tentative de réinitialisation avec le token : ${req.params.token}`);
    resetPassword(req, res, next);
});

// ✅ Route pour demander la confirmation d'ajout de rôle
router.post('/request-role-confirmation', (req, res, next) => {
    console.log("📝 Demande de confirmation pour l'ajout de rôle");
    requestRoleConfirmation(req, res, next);
});

// ✅ Route pour confirmer l'ajout du rôle
router.get('/confirm-role/:token', (req, res, next) => {
    console.log(`🔒 Confirmation du rôle avec le token : ${req.params.token}`);
    confirmRole(req, res, next);
});

module.exports = router;
