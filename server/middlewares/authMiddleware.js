// server/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function isSuperAdmin(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(403).json({ error: "Accès refusé. Token manquant." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifie si l'utilisateur a le rôle "super_admin"
        if (!decoded.roles.includes("super_admin")) {
            return res.status(403).json({ error: "Accès refusé. Vous n'êtes pas un super admin." });
        }

        // Ajoute les données du token à la requête pour une utilisation future
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erreur d'authentification :", error);
        return res.status(403).json({ error: "Token invalide ou expiré." });
    }
}

module.exports = isSuperAdmin;
