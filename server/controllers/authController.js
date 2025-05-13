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
const VALID_ROLES = ["proprietaire", "locataire"];

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

// 🔑 Fonction d'inscription avec gestion des multi-rôles
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
        // Vérification de l'existence de l'utilisateur
        db.query(
            `SELECT u.id_utilisateur, u.email, GROUP_CONCAT(r.nom_role) AS roles
            FROM utilisateurs u
            LEFT JOIN utilisateur_roles ur ON u.id_utilisateur = ur.id_utilisateur
            LEFT JOIN roles r ON ur.id_role = r.id_role
            WHERE u.email = ? OR u.telephone = ?
            GROUP BY u.id_utilisateur`,
            [email, telephone],
            async (err, results) => {
                if (err) {
                    console.error("Erreur serveur :", err);
                    return res.status(500).json({ error: "Erreur lors de la vérification des données." });
                }

                // ✅ Ajout de rôle si l'utilisateur existe déjà
                if (results.length > 0) {
                    const existingRoles = results[0].roles ? results[0].roles.split(",") : [];
                    
                    // 🔍 Vérifie si le rôle est déjà associé
                    if (existingRoles.includes(type)) {
                        return res.status(409).json({ error: `Cet utilisateur est déjà enregistré en tant que ${type}.` });
                    }

                    const userId = results[0].id_utilisateur;
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

                                    res.status(201).json({ message: `✅ Rôle ${type} ajouté avec succès.` });
                                }
                            );
                        }
                    );

                    return;
                }
                // ✅ Création d'un nouvel utilisateur
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

                                        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${verificationToken}`;
                                        const mailOptions = {
                                            from: process.env.EMAIL_USER,
                                            to: email,
                                            subject: "Vérification de votre compte",
                                            html: `<p>Veuillez vérifier votre compte en cliquant sur ce lien : <a href="${verificationUrl}">Cliquez ici</a></p>`
                                        };

                                        transporter.sendMail(mailOptions, (error) => {
                                            if (error) {
                                                console.error("Erreur d'envoi d'email :", error);
                                                return res.status(500).json({ error: "Erreur lors de l'envoi de l'email de vérification." });
                                            }

                                            res.status(201).json({ message: "Compte créé avec succès. Vérifiez votre email pour confirmer l'inscription." });
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

// ✅ Fonction de vérification d'email avec logs détaillés
function verifyEmail(req, res) {
    const { token } = req.params;
    console.log("🔍 Début de la vérification du token :", token);

    // Vérifie que le token est fourni
    if (!token) {
        console.log("⚠️ Token non fourni !");
        return res.status(400).json({ error: "⚠️ Aucun token fourni." });
    }

    db.query(
        `SELECT id_utilisateur, is_verified, verification_token FROM utilisateurs WHERE verification_token = ?`,
        [token],
        (err, results) => {
            console.log("🔄 1 - Requête SQL exécutée pour trouver le token");
            if (err) {
                console.error("🚨 Erreur serveur lors de la vérification :", err);
                return res.status(500).json({ error: "🚨 Erreur serveur." });
            }

            console.log("🔎 Résultats de la recherche du token :", results);

            // Vérifie si le token est trouvé
            if (results.length === 0) {
                console.log("⚠️ Token non trouvé ou déjà utilisé :", token);
                return res.status(400).json({ error: "⚠️ Lien de vérification invalide ou expiré." });
            }

            const user = results[0];
            console.log("✅ Utilisateur trouvé :", user.id_utilisateur, ", vérifié :", user.is_verified);

            // Vérifie si le compte est déjà vérifié
            if (user.is_verified === 1) {
                console.log("⚠️ Compte déjà vérifié :", user.id_utilisateur);
                return res.status(200).json({ message: "✅ Votre compte est déjà vérifié." });
            }

            // ✅ Marque le compte comme vérifié
            db.query(
                `UPDATE utilisateurs SET is_verified = 1, verification_token = NULL WHERE id_utilisateur = ?`,
                [user.id_utilisateur],
                (err) => {
                    console.log("🔄 2 - Début de la mise à jour de l'utilisateur");
                    if (err) {
                        console.error("🚨 Erreur serveur lors de la mise à jour :", err);
                        return res.status(500).json({ error: "🚨 Erreur serveur." });
                    }

                    console.log("🔄 3 - Requête SQL exécutée pour mettre à jour l'utilisateur");
                    console.log("✅ Compte vérifié avec succès :", user.id_utilisateur);
                    console.log("🛑 Fin du traitement, pas de double vérification");
                    res.status(200).json({ message: "✅ Votre compte a été vérifié avec succès." });
                }
            );
        }
    );
}

// ✅ Fonction pour envoyer le lien de réinitialisation
async function forgotPassword(req, res) {
    const { email } = req.body;
    console.log("📧 Demande de réinitialisation pour :", email);

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
                console.error("❌ Erreur lors de l'envoi de l'email :", error);
                return res.status(500).json({ error: "Erreur lors de l'envoi de l'email." });
            }

            console.log("✅ Email de réinitialisation envoyé avec succès à :", email);
            res.status(200).json({ message: "Un lien de réinitialisation a été envoyé à votre adresse email." });
        });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// ✅ Fonction pour réinitialiser le mot de passe
async function resetPassword(req, res) {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    console.log("🔑 Tentative de réinitialisation avec le token :", token);

    if (password !== confirmPassword) {
        console.warn("⚠️ Les mots de passe ne correspondent pas.");
        return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token décodé avec succès :", decoded);

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            `UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ?`,
            [hashedPassword, decoded.email],
            (err) => {
                if (err) {
                    console.error("❌ Erreur lors de la mise à jour du mot de passe :", err);
                    return res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe." });
                }

                console.log("✅ Mot de passe réinitialisé avec succès pour :", decoded.email);
                res.status(200).json({ message: "Votre mot de passe a été réinitialisé avec succès." });
            }
        );
    } catch (error) {
        console.error("❌ Token invalide ou expiré :", error);
        res.status(400).json({ error: "Le lien de réinitialisation est invalide ou a expiré." });
    }
}

// ✅ Fonction pour envoyer un lien de confirmation pour l'ajout de rôle
function requestRoleConfirmation(req, res) {
    const { email, role } = req.body;

    // Vérifie si le rôle est valide
    const validRoles = ["agent", "proprietaire", "locataire"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Rôle invalide." });
    }

    // Vérifie si l'utilisateur existe déjà
    db.query(
        `SELECT u.id_utilisateur, u.email, GROUP_CONCAT(r.nom_role) AS roles
        FROM utilisateurs u
        LEFT JOIN utilisateur_roles ur ON u.id_utilisateur = ur.id_utilisateur
        LEFT JOIN roles r ON ur.id_role = r.id_role
        WHERE u.email = ?
        GROUP BY u.id_utilisateur`,
        [email],
        (err, results) => {
            if (err) {
                console.error("Erreur serveur :", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }

            const user = results[0];
            const existingRoles = user.roles ? user.roles.split(",") : [];

            // Vérifie si l'utilisateur a déjà ce rôle
            if (existingRoles.includes(role)) {
                return res.status(409).json({ error: `Cet utilisateur est déjà enregistré en tant que ${role}.` });
            }

            // ✅ Génère un token de confirmation
            const token = jwt.sign(
                { id: user.id_utilisateur, role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // ✅ Envoie l'email de confirmation
            const verificationUrl = `${process.env.FRONTEND_URL}/confirm-role/${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Confirmation de l'ajout de rôle",
                html: `<p>Veuillez cliquer sur ce lien pour confirmer l'ajout du rôle <strong>${role}</strong> : <a href="${verificationUrl}">Confirmer le rôle</a></p>`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error("Erreur d'envoi d'email :", error);
                    return res.status(500).json({ error: "Erreur lors de l'envoi de l'email de confirmation." });
                }

                console.log("✅ Email de confirmation envoyé avec succès.");
                res.status(200).json({ message: "✅ Email de confirmation envoyé avec succès." });
            });
        }
    );
}

// ✅ Fonction pour confirmer l'ajout de rôle
function confirmRole(req, res) {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { id, role } = decoded;

        // Ajout du rôle
        db.query(
            `SELECT id_role FROM roles WHERE nom_role = ?`,
            [role],
            (err, roleResults) => {
                if (err || roleResults.length === 0) {
                    console.error("Erreur de rôle :", err);
                    return res.status(500).json({ error: "Erreur lors de l'association du rôle." });
                }

                const roleId = roleResults[0].id_role;

                db.query(
                    `INSERT INTO utilisateur_roles (id_utilisateur, id_role) VALUES (?, ?)`,
                    [id, roleId],
                    (err) => {
                        if (err) {
                            console.error("Erreur d'association de rôle :", err);
                            return res.status(500).json({ error: "Erreur lors de l'association du rôle." });
                        }

                        res.status(200).json({ message: `✅ Rôle ${role} ajouté avec succès.` });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Token invalide ou expiré :", error);
        res.status(400).json({ error: "Le lien de confirmation est invalide ou a expiré." });
    }
}

// Ajouter le rôle "agent" pour un utilisateur existant (super admin uniquement)
async function assignAgentRole(req, res) {
    const { email } = req.body;

    try {
        // Vérifie si l'utilisateur existe
        db.query(
            `SELECT id_utilisateur FROM utilisateurs WHERE email = ?`,
            [email],
            (err, results) => {
                if (err || results.length === 0) {
                    return res.status(404).json({ error: "Utilisateur non trouvé." });
                }

                const userId = results[0].id_utilisateur;

                // Vérifie si le rôle "agent" est déjà attribué
                db.query(
                    `SELECT r.nom_role FROM utilisateur_roles ur 
                     JOIN roles r ON ur.id_role = r.id_role 
                     WHERE ur.id_utilisateur = ? AND r.nom_role = 'agent'`,
                    [userId],
                    (err, roleResults) => {
                        if (err) return res.status(500).json({ error: "Erreur serveur." });

                        if (roleResults.length > 0) {
                            return res.status(409).json({ error: "L'utilisateur est déjà un agent." });
                        }

                        // Assigner le rôle "agent"
                        db.query(
                            `INSERT INTO utilisateur_roles (id_utilisateur, id_role) 
                             SELECT ?, id_role FROM roles WHERE nom_role = 'agent'`,
                            [userId],
                            (err) => {
                                if (err) return res.status(500).json({ error: "Erreur d'association de rôle." });
                                res.status(200).json({ message: "Rôle agent attribué avec succès." });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// ✅ Récupération de tous les utilisateurs avec leurs rôles
async function getAllUsers(req, res) {
    try {
        db.query(`
            SELECT u.id_utilisateur, u.nom, u.prenom, u.email, u.telephone, GROUP_CONCAT(r.nom_role) AS roles
            FROM utilisateurs u
            LEFT JOIN utilisateur_roles ur ON u.id_utilisateur = ur.id_utilisateur
            LEFT JOIN roles r ON ur.id_role = r.id_role
            GROUP BY u.id_utilisateur
        `, (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération des utilisateurs :", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }
            res.status(200).json({ users: results });
        });
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// ✅ Mettre à jour les informations d'un utilisateur
async function updateUser(req, res) {
    const { id } = req.params;
    const { nom, prenom, email, telephone, roles } = req.body;

    try {
        // ✅ Vérifie que les rôles sont sous forme de tableau
        const rolesArray = typeof roles === 'string' ? roles.split(',').map(role => role.trim()) : [];

        // ✅ Mise à jour des informations de base
        db.query(`
            UPDATE utilisateurs 
            SET nom = ?, prenom = ?, email = ?, telephone = ?
            WHERE id_utilisateur = ?
        `, [nom, prenom, email, telephone, id], (err) => {
            if (err) {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
                return res.status(500).json({ error: "Erreur serveur." });
            }

            // ✅ Mise à jour des rôles
            db.query(`DELETE FROM utilisateur_roles WHERE id_utilisateur = ?`, [id], (err) => {
                if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour des rôles." });

                if (rolesArray.length > 0) {
                    const roleQueries = rolesArray.map(role => `
                        INSERT INTO utilisateur_roles (id_utilisateur, id_role) 
                        SELECT ?, id_role FROM roles WHERE nom_role = ?
                    `);

                    const params = rolesArray.flatMap(role => [id, role]);

                    db.query(roleQueries.join("; "), params, (err) => {
                        if (err) return res.status(500).json({ error: "Erreur lors de l'ajout des rôles." });
                        res.status(200).json({ message: "Utilisateur mis à jour avec succès." });
                    });
                } else {
                    res.status(200).json({ message: "Utilisateur mis à jour avec succès." });
                }
            });
        });
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

// ✅ Supprimer un utilisateur
async function deleteUser(req, res) {
    const { id } = req.params;
    try {
        db.query(`DELETE FROM utilisateurs WHERE id_utilisateur = ?`, [id], (err) => {
            if (err) return res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
            res.status(200).json({ message: "Utilisateur supprimé avec succès." });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur." });
    }
}


// 🔑 Exports
module.exports = {
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
};