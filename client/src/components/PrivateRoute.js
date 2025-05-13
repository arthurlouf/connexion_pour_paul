// src/components/PrivateRoute.js

import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const { id, type } = useParams();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log("🔒 Pas de token, redirection...");
            navigate(`/login/${type || 'proprietaire'}`);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            console.log("🔑 Token décodé :", decoded);

            // ✅ Vérifie les routes avec ID et type (ex: /dashboard/super_admin/2)
            if (id && type) {
                if (decoded.id !== parseInt(id) || !decoded.roles.includes(type)) {
                    console.log("🔒 Token invalide, suppression...");
                    localStorage.removeItem('token');
                    navigate(`/login/${type}`);
                    return;
                }
            }

            // ✅ Vérifie les routes admin (ex: /admin/manage-users)
            if (location.pathname.startsWith('/admin') && !decoded.roles.includes('super_admin')) {
                console.log("🔒 Accès refusé pour l'admin, redirection...");
                localStorage.removeItem('token');
                navigate(`/login/super_admin`);
                return;
            }

        } catch (error) {
            console.error("❌ Token invalide :", error);
            localStorage.removeItem('token');
            navigate(`/login/${type || 'proprietaire'}`);
            return;
        }
    }, [id, type, navigate, location]);

    return children;
};

export default PrivateRoute;
