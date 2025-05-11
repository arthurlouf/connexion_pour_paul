// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import VerifyAccount from './components/VerifyAccount/VerifyAccount';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Page d'accueil redirigeant vers Register */}
                <Route path="/" element={<Navigate to="/register" />} />
                
                {/* Authentification */}
                <Route path="/login/:type" element={<LoginForm />} />
                <Route path="/register/:type" element={<RegisterForm />} />
                <Route path="/login" element={<Navigate to="/login/proprietaire" />} />
                <Route path="/register" element={<Navigate to="/register/proprietaire" />} />

                {/* Vérification de compte */}
                <Route path="/verify/:type/:token" element={<VerifyAccount />} />

                {/* Tableaux de bord sécurisés */}
                <Route path="/dashboard/:type/:id" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                {/* Système de mot de passe oublié */}
                <Route path="/forgot-password/:type" element={<ForgotPassword />} />
                <Route path="/reset-password/:type/:token" element={<ResetPassword />} />

                {/* Page 404 */}
                <Route path="*" element={<h2>404 - Page non trouvée</h2>} />
            </Routes>
        </Router>
    );
}

export default App;
