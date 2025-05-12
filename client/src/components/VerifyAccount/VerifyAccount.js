// src/components/Auth/VerifyAccount.js

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const verificationStarted = useRef(false); // ✅ Nouvelle vérification anti-double appel

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                // ✅ Empêche les appels multiples
                if (verificationStarted.current) return;
                verificationStarted.current = true;

                console.log("🔄 Début de la vérification du compte avec token :", token);
                
                const response = await axios.get(`http://localhost:4000/api/auth/verify/${token}`);
                
                console.log("✅ Réponse du serveur :", response.data);
                
                setMessage(response.data.message || "✅ Votre compte a été vérifié avec succès.");
                
                // ✅ Redirige après 3 secondes si succès
                console.log("🔄 Redirection prévue dans 3 secondes...");
                setTimeout(() => navigate('/login/proprietaire'), 3000);
            } catch (error) {
                console.error("🚨 Erreur attrapée :", error.response?.data?.error || error.message);
                
                // ✅ Affichage d'un message plus clair
                setMessage(error.response?.data?.error || "⚠️ Lien de vérification invalide ou expiré.");
            }
        };

        // ✅ Vérifie que le token est présent
        if (token && !verificationStarted.current) {
            console.log("🔄 Token trouvé, lancement de la vérification");
            verifyAccount();
        } else {
            console.log("⚠️ Aucun token trouvé ou déjà vérifié");
        }
    }, [token, navigate]);

    return (
        <div className="auth-container">
            <h2>Vérification du Compte</h2>
            <p>{message}</p>
        </div>
    );
};

export default VerifyAccount;