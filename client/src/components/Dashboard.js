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

    const goToManageUsers = () => {
        if (type === 'super_admin') {
            navigate(`/admin/manage-users`);
        } else {
            alert("Vous n'avez pas les permissions pour accéder à cette page.");
        }
    };

    return (
        <div>
            <h2>Tableau de bord - {type.toUpperCase()}</h2>
            <p>Bienvenue utilisateur ID : {id}</p>
            
            {type === 'super_admin' && (
                <button onClick={goToManageUsers} style={{ marginBottom: '15px' }}>
                    Gérer les utilisateurs
                </button>
            )}

            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
};

export default Dashboard;
