// src/components/Auth/ResetPassword.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword = () => {
    const { type, token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`http://localhost:4000/api/auth/reset-password/${type}/${token}`, formData);
        setMessage(response.data.message);
        setError('');
        setTimeout(() => navigate(`/login/${type}`), 3000);
    } catch (error) {
        console.error(error);
        setMessage('');
        setError("⚠️ Le lien de réinitialisation est invalide ou a expiré. Veuillez réessayer.");
    }
};

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Réinitialiser votre mot de passe</h2>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                <input
                    type="password"
                    name="password"
                    placeholder="Nouveau mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Réinitialiser le mot de passe</button>
                <p className="auth-link" onClick={() => navigate('/login')}>
                    Retour à la connexion
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;
