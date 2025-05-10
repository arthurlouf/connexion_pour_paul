import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Auth.css';
import axios from 'axios';

const logoPath = process.env.PUBLIC_URL + '/logo.png';

// Vérification de la robustesse du mot de passe
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})(?!.*\s)/;
    return passwordRegex.test(password);
};

function RegisterForm() {
    const navigate = useNavigate();
    const { type } = useParams();
    const [selectedType, setSelectedType] = useState(type || 'proprietaire');
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrorMessage('');
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        navigate(`/register/${type}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:4000/api/auth/register/${selectedType}`, formData);
            setSuccessMessage(response.data.message);
            navigate('/login');
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Erreur lors de l'inscription. Veuillez réessayer plus tard.");
            }
        }
    };

    return (
        <>
            <div className="logo-container">
                <img src={logoPath} alt="Logo" onClick={() => navigate('/')} />
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Créer un compte {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</h2>

                {/* Boutons de sélection du type de compte */}
                <div className="account-type-buttons">
                    <button type="button" className={selectedType === 'proprietaire' ? 'active' : ''} onClick={() => handleTypeSelect('proprietaire')}>Propriétaire</button>
                    <button type="button" className={selectedType === 'locataire' ? 'active' : ''} onClick={() => handleTypeSelect('locataire')}>Locataire</button>
                    <button type="button" className={selectedType === 'agent' ? 'active' : ''} onClick={() => handleTypeSelect('agent')}>Agent</button>
                </div>

            <div className="form-grid">
            <input name="nom" placeholder="Nom" onChange={handleChange} required />
            <input name="prenom" placeholder="Prénom" onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
            <input name="telephone" placeholder="Téléphone" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} required />
            <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" onChange={handleChange} required />
            </div>
            {/* Affichage du message d'erreur */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit">Créer un compte</button>
            <p className="auth-link" onClick={() => navigate('/login')}>
                J'ai déjà un compte
            </p>
        </form>
        </>
    );
}

export default RegisterForm;
