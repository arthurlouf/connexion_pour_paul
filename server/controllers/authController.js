// server/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Fonction utilitaire pour les réponses JSON
const sendResponse = (res, statusCode, message, isError = false) => {
    res.status(statusCode).json({
        success: !isError,
        message: message,
        error: isError ? message : null
    });
};


// Fonction d'inscription
exports.register = async (req, res) => {
    const { nom, prenom, email, password, confirmPassword, telephone } = req.body;
    const { type } = req.params;

    try {
        db.query(
            `SELECT * FROM ${type} WHERE email = ?`,
            [email],
            async (err, results) => {
                if (err) {
                    console.error("Erreur serveur :", err);
                    return res.status(500).json({ error: "Erreur serveur." });
                }

                if (results.length === 0) {
                    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
                }

                const user = results[0];

                if (user.is_verified !== 1) {
                    console.log("🔒 Compte non vérifié :", user.email);
                    return res.status(403).json({ error: "Votre compte n'est pas encore vérifié. Veuillez vérifier votre email." });
                }

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    console.log("❌ Mot de passe incorrect pour :", user.email);
                    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
                }

                const token = jwt.sign(
                    { id: user.id, type: type },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                console.log("✅ Connexion réussie pour :", user.email);

                res.status(200).json({
                    message: "Connexion réussie",
                    token,
                    user: {
                        id: user.id,
                        nom: user.nom,
                        prenom: user.prenom,
                        type: type
                    }
                });
            }
        );
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// Fonction de vérification d'email
function verifyEmail(req, res) {
    const { type, token } = req.params;

    db.query(
        `UPDATE ${type} SET is_verified = 1 WHERE verification_token = ?`,
        [token],
        (err, result) => {
            if (err) {
                console.error("❌ Erreur SQL :", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }

            if (result.affectedRows === 0) {
                return res.status(400).json({ error: "Lien de vérification invalide ou expiré." });
            }

            res.status(200).json({ message: "Vérification réussie." });
        }
    );
}

// Fonction d'inscription
async function register(req, res) {
    const { nom, prenom, email, password, confirmPassword, telephone } = req.body;
    const { type } = req.params;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
    }

    try {
        db.query(
            `SELECT * FROM ${type} WHERE email = ? OR telephone = ?`,
            [email, telephone],
            async (err, results) => {
                if (err) {
                    console.error("Erreur serveur :", err);
                    return res.status(500).json({ error: "Erreur lors de la vérification des données." });
                }

                if (results.length > 0) {
                    return res.status(409).json({ error: "Cet e-mail ou ce numéro de téléphone est déjà utilisé." });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const verificationToken = require('crypto').randomBytes(32).toString('hex');

                db.query(
                    `INSERT INTO ${type} (nom, prenom, email, password, telephone, verification_token, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)`,
                    [nom, prenom, email, hashedPassword, telephone, verificationToken],
                    (err) => {
                        if (err) {
                            console.error("Erreur serveur :", err);
                            return res.status(500).json({ error: "Erreur lors de la création du compte." });
                        }

                        const verificationUrl = `${process.env.FRONTEND_URL}/verify/${type}/${verificationToken}`;
                        const mailOptions = {
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: "Vérification de votre compte",
                            html: `<p>Veuillez cliquer sur ce lien pour vérifier votre compte : <a href="${verificationUrl}">${verificationUrl}</a></p>`
                        };

                        transporter.sendMail(mailOptions, (error) => {
                            if (error) {
                                console.error("Erreur lors de l'envoi de l'email :", error);
                                return res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
                            }

                            res.status(201).json({ message: "Compte créé. Vérifiez votre email pour confirmer votre inscription." });
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// Fonction pour demander un lien de réinitialisation
async function forgotPassword(req, res) {
    const { type } = req.params;
    const { email } = req.body;

    try {
        const resetToken = jwt.sign({ email, type }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${type}/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            html: `<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetUrl}">${resetUrl}</a></p>`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Erreur lors de l'envoi de l'email :", error);
                return res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
            }

            res.status(200).json({ message: "Un lien de réinitialisation a été envoyé à votre adresse email." });
        });
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// Fonction pour réinitialiser le mot de passe
async function resetPassword(req, res) {
    const { type, token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            `UPDATE ${type} SET password = ? WHERE email = ?`,
            [hashedPassword, decoded.email],
            (err) => {
                if (err) {
                    console.error("Erreur serveur :", err);
                    return res.status(500).json({ error: "Erreur lors de la réinitialisation du mot de passe." });
                }

                res.status(200).json({ message: "Votre mot de passe a été réinitialisé avec succès." });
            }
        );
    } catch (error) {
        console.error("Token invalide ou expiré :", error);
        res.status(400).json({ error: "Le lien de réinitialisation est invalide ou a expiré." });
    }
}

// Exports
module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword
};
