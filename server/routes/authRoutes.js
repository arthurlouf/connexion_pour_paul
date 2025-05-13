// server/routes/authRoutes.js
// -----------------------------------------------------------------------------
// Routes d'authentification et de gestion d'utilisateur
// -----------------------------------------------------------------------------

const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  requestRoleConfirmation,
  confirmRole,
  assignAgentRole,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

// -----------------------------------------------------------------------------
// Middleware & constantes
// -----------------------------------------------------------------------------

const isSuperAdmin = require("../middlewares/authMiddleware"); // ✅ Import du middleware


/**
 * Rôles autorisés pour l'inscription.
 * Ajoutez ici un nouveau rôle pour l'activer dans l'API.
 */
const VALID_ROLES = ["proprietaire", "locataire"]; // ✅ Correction ici

/**
 * Vérifie que :type est bien un rôle reconnu.
 */
function validateRole(req, res, next) {
  const { type } = req.params;
  if (!VALID_ROLES.includes(type)) {
    console.warn(`⚠️  Rôle invalide reçu : ${type}`);
    return res.status(400).json({ error: "Rôle invalide." });
  }
  console.info(`✅ Rôle validé : ${type}`);
  next();
}

// -----------------------------------------------------------------------------
// Définition des routes
// -----------------------------------------------------------------------------

// Inscription avec rôle obligatoire
router.post("/register/:type", validateRole, register);

// Vérification de compte (email)
router.get("/verify/:token", verifyEmail);

// Connexion
router.post("/login", login);

// Demande de lien de réinitialisation de mot de passe
router.post("/forgot-password", forgotPassword);

// Réinitialisation du mot de passe via token
router.post("/reset-password/:token", resetPassword);

// Demande d'ajout de rôle
router.post("/request-role-confirmation", requestRoleConfirmation);

// Confirmation de l'ajout de rôle
router.get("/confirm-role/:token", confirmRole);

// ✅ Route protégée (seulement pour super admins)
router.post("/assign-agent", isSuperAdmin, assignAgentRole);

router.get("/users", isSuperAdmin, getAllUsers);
router.put('/users/:id', isSuperAdmin, updateUser);
router.delete('/users/:id', isSuperAdmin, deleteUser);

module.exports = router;
