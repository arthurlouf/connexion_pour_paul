// src/Auth/RegisterForm.js


import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Auth.css';
import axios from 'axios';

const logoPath = process.env.PUBLIC_URL + '/logo.png';

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
    const [successMessage, setSuccessMessage] = useState('');
    


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        navigate(`/register/${type}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');  // Réinitialise les messages d'erreur
        setSuccessMessage(''); // Réinitialise les messages de succès
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
            {successMessage && <p className="success-message">{successMessage}</p>}
            <button type="submit">Créer un compte</button>
            <p className="auth-link" onClick={() => navigate('/login')}>
                J'ai déjà un compte
            </p>
        </form>
        </>
    );
}

export default RegisterForm;


// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import '../../App.css';

// function RegisterForm() {
//     const { type } = useParams();  // Récupère le type depuis l'URL
//     const [formData, setFormData] = useState({
//         nom: '',
//         prenom: '',
//         email: '',
//         telephone: '',
//         password: '',
//         confirmPassword: '',
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await axios.post(`http://localhost:4000/api/auth/register/${type}`, formData);
//             alert(response.data.message);
//         } catch (error) {
//             console.error(error);
//             if (error.response && error.response.data && error.response.data.error) {
//                 alert(error.response.data.error);
//             } else {
//                 alert("Erreur inconnue. Veuillez réessayer plus tard.");
//             }
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="register-form">
//             <h2>Créer un compte {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
//             <input name="nom" placeholder="Nom" onChange={handleChange} required />
//             <input name="prenom" placeholder="Prénom" onChange={handleChange} required />
//             <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
//             <input name="telephone" placeholder="Téléphone" onChange={handleChange} required />
//             <input name="password" type="password" placeholder="Mot de passe" onChange={handleChange} required />
//             <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" onChange={handleChange} required />
//             <button type="submit">Créer un compte</button>
//         </form>
//     );
// }

// export default RegisterForm;
