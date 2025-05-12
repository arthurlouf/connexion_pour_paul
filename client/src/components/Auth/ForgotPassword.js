// src/Auth/ForgotPassword.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { type } = useParams();  // Récupère le type (agent, proprietaire, locataire) depuis l'URL
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // ✅ Envoi de l'email pour réinitialiser le mot de passe
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`http://localhost:4000/api/auth/forgot-password/${type}`, { email });

            // ✅ Vérifie que le serveur a bien répondu
            if (response.status === 200) {
                setMessage(response.data.message || "✅ Un lien de réinitialisation a été envoyé à votre adresse email.");
                setError('');
            }
        } catch (error) {
            console.error(error);

            // ✅ Affichage d'un message d'erreur plus précis
            if (error.response && error.response.data && error.response.data.error) {
                setError(`⚠️ ${error.response.data.error}`);
            } else {
                setError("⚠️ Impossible d'envoyer le lien de réinitialisation. Vérifiez votre adresse email et réessayez.");
            }

            setMessage('');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Mot de passe oublié ({type.charAt(0).toUpperCase() + type.slice(1)})</h2>
                
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                
                <input 
                    type="email" 
                    placeholder="Entrez votre adresse email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                
                <button type="submit">Envoyer le lien de réinitialisation</button>
                
                <p className="auth-link" onClick={() => navigate(`/login/${type}`)}>
                    Retour à la connexion
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;
