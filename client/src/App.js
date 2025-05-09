// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import VerifyAccount from './components/VerifyAccount/VerifyAccount';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirection par défaut vers Register */}
                <Route path="/" element={<Navigate to="/register" />} />
                
                {/* Pages principales */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />

                {/* Formulaires dynamiques */}
                <Route path="/login/:type" element={<LoginForm />} />
                <Route path="/register/:type" element={<RegisterForm />} />

                {/* Vérification de compte */}
                <Route path="/verify/:type/:token" element={<VerifyAccount />} />

                {/* Page 404 (Optionnel) */}
                <Route path="*" element={<h2>404 - Page non trouvée</h2>} />
            </Routes>
        </Router>
    );
}

export default App;






// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import LoginForm from './components/Auth/LoginForm';
// import RegisterForm from './components/Auth/RegisterForm';
// import VerifyAccount from './components/VerifyAccount/VerifyAccount';
// import './App.css';

// function App() {
//     return (
//         <Router>
//             <div className="App">
//                 <h1>Bienvenue sur Gest-ISEN</h1>
//                 <nav>
//                     <Link to="/register/proprietaire">Créer un compte Propriétaire</Link> |
//                     <Link to="/register/locataire">Créer un compte Locataire</Link> |
//                     <Link to="/register/agent">Créer un compte Agent</Link> |
//                     <Link to="/login/proprietaire">Connexion Propriétaire</Link> |
//                     <Link to="/login/locataire">Connexion Locataire</Link> |
//                     <Link to="/login/agent">Connexion Agent</Link> |
//                 </nav>

//                 <Routes>
//                     <Route path="/register/:type" element={<RegisterForm />} />
//                     <Route path="/login/:type" element={<LoginForm />} />
//                     <Route path="/verify/:type/:token" element={<VerifyAccount />} />
//                 </Routes>
//             </div>
//         </Router>
//     );
// }

// export default App;
