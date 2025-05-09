// src/Auth/LoginForm.js


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css';
import axios from 'axios';

const logoPath = process.env.PUBLIC_URL + '/logo.png';

function LoginForm() {
    const navigate = useNavigate();
    const { type } = useParams();
    const [selectedType, setSelectedType] = useState(type || 'proprietaire');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        // Définit un type par défaut si aucun type n'est fourni
        if (!type) {
            setSelectedType('proprietaire');
        }
    }, [type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        navigate(`/login/${type}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:4000/api/auth/login/${selectedType}`, formData);
            alert(`Bienvenue, ${response.data.user.nom} !`);
            localStorage.setItem('token', response.data.token);
            window.location.href = `/dashboard/${selectedType}`;
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la connexion. Veuillez réessayer plus tard.");
        }
    };

    const title = `Connexion ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`;

    return (
        <>
        <div className="logo-container">
                <img src={logoPath} alt="Logo" onClick={() => navigate('/')} />
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>{title}</h2>

            {/* Boutons de sélection du type de compte */}
            <div className="account-type-buttons">
                <button type="button" className={selectedType === 'proprietaire' ? 'active' : ''} onClick={() => handleTypeSelect('proprietaire')}>Propriétaire</button>
                <button type="button" className={selectedType === 'locataire' ? 'active' : ''} onClick={() => handleTypeSelect('locataire')}>Locataire</button>
                <button type="button" className={selectedType === 'agent' ? 'active' : ''} onClick={() => handleTypeSelect('agent')}>Agent</button>
            </div>

            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} required />
            <button type="submit">Se connecter</button>
            <p className="auth-link" onClick={() => navigate('/register')}>
                Je n'ai pas encore de compte
            </p>
        </form>
        </>
    );
}

export default LoginForm;


// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import '../../App.css';

// function LoginForm() {
//     const { type } = useParams();  // Récupère le type depuis l'URL
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             // Appel dynamique à l'API en fonction du type
//             const response = await axios.post(`http://localhost:4000/api/auth/login/${type}`, formData);
//             alert(`Bienvenue, ${response.data.user.nom} !`);
//             localStorage.setItem('token', response.data.token);

//             // Redirection dynamique selon le type
//             window.location.href = `/dashboard/${type}`;
//         } catch (error) {
//             console.error(error);
//             if (error.response && error.response.data && error.response.data.error) {
//                 alert(error.response.data.error);
//             } else {
//                 alert("Erreur inconnue. Veuillez réessayer plus tard.");
//             }
//         }
//     };

//     // Titre dynamique pour le formulaire
//     const title = `Connexion ${type.charAt(0).toUpperCase() + type.slice(1)}`;

//     return (
//         <form onSubmit={handleSubmit} className="login-form">
//             <h2>{title}</h2>
//             <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
//             <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} required />
//             <button type="submit">Se connecter</button>
//         </form>
//     );
// }

// export default LoginForm;
