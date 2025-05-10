// src/components/Dashboard.js

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const { type, id } = useParams();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate(`/login/${type}`);
    };

    return (
        <div>
            <h2>Tableau de bord - {type.toUpperCase()}</h2>
            <p>Bienvenue utilisateur ID : {id}</p>
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
};

export default Dashboard;
