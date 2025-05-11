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
            console.log("🔒 Pas de token, redirection...");
            navigate(`/login/${type}`);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            console.log("🔑 Token décodé :", decoded);

            // ✅ Vérifiez l'ID et le type
            if (decoded.id !== parseInt(id) || !decoded.roles.includes(type)) {
                console.log("🔒 Token invalide, suppression...");
                localStorage.removeItem('token');
                navigate(`/login/${type}`);
                return;
            }
        } catch (error) {
            console.error("❌ Token invalide :", error);
            localStorage.removeItem('token');
            navigate(`/login/${type}`);
            return;
        }
    }, [id, type, navigate]);

    return children;
};

export default PrivateRoute;
