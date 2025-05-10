// src/components/PrivateRoute.js

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const { id, type } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate(`/login/${type}`);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.id !== parseInt(id) || decoded.type !== type) {
                localStorage.removeItem('token');
                navigate(`/login/${type}`);
            }
        } catch (error) {
            console.error("Token invalide :", error);
            localStorage.removeItem('token');
            navigate(`/login/${type}`);
        }
    }, [id, type, navigate]);

    return children;
};

export default PrivateRoute;
