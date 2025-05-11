// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');

// ✅ Vérification du chargement des fonctions du contrôleur
console.log("📝 AuthController chargé avec succès");

// ✅ Route pour l'inscription (avec validation des rôles)
router.post('/register/:type', (req, res, next) => {
    const { type } = req.params;
    const validRoles = ["agent", "proprietaire", "locataire"];

    if (!validRoles.includes(type)) {
        return res.status(400).json({ error: "Rôle invalide." });
    }

    // Passe au contrôleur si le rôle est valide
    register(req, res, next);
});

// ✅ Route pour la vérification des comptes
router.get('/verify/:token', verifyEmail);

// ✅ Route pour la connexion
router.post('/login', login);

// ✅ Route pour demander un lien de réinitialisation de mot de passe
router.post('/forgot-password', forgotPassword);

// ✅ Route pour réinitialiser le mot de passe avec le token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
