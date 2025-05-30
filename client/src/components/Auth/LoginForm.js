// src/Auth/LoginForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Auth.css';

const logoPath = process.env.PUBLIC_URL + '/logo.png';

function LoginForm() {
    const navigate = useNavigate();
    const { type } = useParams();
    const [selectedType, setSelectedType] = useState(type || 'proprietaire');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.type === selectedType) {
                    navigate(`/dashboard/${decoded.type}/${decoded.id}`);
                }
            } catch (error) {
                console.error("Token invalide, suppression...");
                localStorage.removeItem('token');
            }
        }
    }, [navigate, selectedType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:4000/api/auth/login/${selectedType}`, formData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            navigate(`/dashboard/${user.type}/${user.id}`);
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);

            if (error.response) {
                const status = error.response.status;
                const serverMessage = error.response.data.error || "";

                if (status === 403) {
                    setErrorMessage(serverMessage || "⚠️ Votre compte n'est pas encore vérifié. Veuillez vérifier votre email.");
                } else if (status === 401) {
                    setErrorMessage(serverMessage || "❌ Email ou mot de passe incorrect. Veuillez réessayer.");
                } else {
                    setErrorMessage(serverMessage || "🛠️ Erreur serveur. Veuillez réessayer plus tard.");
                }
            } else {
                setErrorMessage("🌐 Erreur réseau. Vérifiez votre connexion.");
            }
        }
    };

    const handleTypeSelect = (newType) => {
        setSelectedType(newType);
        setErrorMessage('');
        navigate(`/login/${newType}`);
    };

    return (
        <>
            <div className="logo-container" onClick={() => navigate('/')}>
                <img src={logoPath} alt="Logo" />
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Connexion {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</h2>

                <div className="account-type-buttons">
                    {['proprietaire', 'locataire', 'agent'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={selectedType === type ? 'active' : ''}
                            onClick={() => handleTypeSelect(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Se connecter</button>

                <p className="auth-link" onClick={() => navigate('/register')}>
                    Je n'ai pas encore de compte
                </p>

                <p className="auth-link" onClick={() => navigate(`/forgot-password/${selectedType}`)}>
                    Mot de passe oublié ?
                </p>
            </form>
        </>
    );
}

export default LoginForm;
