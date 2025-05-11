// server/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Configuration du transporteur d'emails
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

// ✅ Rôles valides
const VALID_ROLES = ["agent", "proprietaire", "locataire"];

// 🔑 Fonction de connexion
async function login(req, res) {
    const { email, password } = req.body;

    try {
        db.query(
            `SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.mot_de_passe, u.is_verified, GROUP_CONCAT(r.nom_role) AS roles
            FROM utilisateurs u
            JOIN utilisateur_roles ur ON u.id_utilisateur = ur.id_utilisateur
            JOIN roles r ON ur.id_role = r.id_role
            WHERE u.email = ?
            GROUP BY u.id_utilisateur`,
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

                if (user.is_verified != 1) {
                    return res.status(403).json({ error: "Votre compte n'est pas encore vérifié." });
                }

                const isMatch = await bcrypt.compare(password, user.mot_de_passe);

                if (!isMatch) {
                    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
                }

                const token = jwt.sign(
                    { id: user.id_utilisateur, roles: user.roles.split(",") },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                res.status(200).json({
                    message: "Connexion réussie",
                    token,
                    user: {
                        id: user.id_utilisateur,
                        nom: user.nom,
                        prenom: user.prenom,
                        roles: user.roles.split(",")
                    }
                });
            }
        );
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// 🔑 Fonction d'inscription
async function register(req, res) {
    const { nom, prenom, email, password, confirmPassword, telephone } = req.body;
    const { type } = req.params;

    if (!VALID_ROLES.includes(type)) {
        return res.status(400).json({ error: "Rôle invalide." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
    }

    try {
        db.query(
            `SELECT * FROM utilisateurs WHERE email = ? OR telephone = ?`,
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
                    `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, verification_token, is_verified) 
                     VALUES (?, ?, ?, ?, ?, ?, 0)`,
                    [nom, prenom, email, hashedPassword, telephone, verificationToken],
                    (err, result) => {
                        if (err) {
                            console.error("Erreur serveur :", err);
                            return res.status(500).json({ error: "Erreur lors de la création du compte." });
                        }

                        const userId = result.insertId;

                        db.query(
                            `SELECT id_role FROM roles WHERE nom_role = ?`,
                            [type],
                            (err, roleResults) => {
                                if (err || roleResults.length === 0) {
                                    console.error("Erreur de rôle :", err);
                                    return res.status(500).json({ error: "Erreur lors de l'association du rôle." });
                                }

                                const roleId = roleResults[0].id_role;

                                db.query(
                                    `INSERT INTO utilisateur_roles (id_utilisateur, id_role) VALUES (?, ?)`,
                                    [userId, roleId],
                                    (err) => {
                                        if (err) {
                                            console.error("Erreur d'association de rôle :", err);
                                            return res.status(500).json({ error: "Erreur lors de l'association du rôle." });
                                        }

                                        const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify/${verificationToken}`;
                                        const mailOptions = {
                                            from: process.env.EMAIL_USER,
                                            to: email,
                                            subject: "Vérification de votre compte",
                                            html: `<p>Veuillez vérifier votre compte en cliquant ici : <a href="${verificationUrl}">Cliquez ici pour vérifier votre compte</a></p>`
                                        };

                                        transporter.sendMail(mailOptions, (error) => {
                                            if (error) {
                                                console.error("Erreur d'envoi d'email :", error);
                                                return res.status(500).json({ error: "Erreur lors de l'envoi de l'email de vérification." });
                                            }

                                            res.status(201).json({ message: "Compte créé. Vérifiez votre email pour confirmer votre inscription." });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// Fonction de vérification d'email avec redirection
function verifyEmail(req, res) {
    const { token } = req.params;

    db.query(
        `UPDATE utilisateurs SET is_verified = 1 WHERE verification_token = ?`,
        [token],
        (err, result) => {
            if (err) {
                console.error("Erreur serveur :", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }

            if (result.affectedRows === 0) {
                return res.status(400).send(`
                    <h2>⚠️ Lien de vérification invalide ou expiré.</h2>
                    <p>Veuillez demander un nouveau lien de vérification.</p>
                `);
            }

            // ✅ Redirection après vérification
            res.redirect(`${process.env.FRONTEND_URL}/login/proprietaire`);
        }
    );
}

// 🔑 Fonction pour demander un lien de réinitialisation
async function forgotPassword(req, res) {
    const { email } = req.body;

    try {
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

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

// 🔑 Fonction pour réinitialiser le mot de passe
async function resetPassword(req, res) {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            `UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ?`,
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

// 🔑 Exports
module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword
};
