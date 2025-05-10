// src/Auth/ForgotPassword.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { type } = useParams();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:4000/api/auth/forgot-password/${type}`, { email });
            setMessage(response.data.message);
            setError('');
        } catch (error) {
            console.error(error);
            setMessage('');
            setError("⚠️ Impossible d'envoyer le lien de réinitialisation. Vérifiez votre adresse email et réessayez.");
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
