// src/VerifyAccount/VerifyAccount.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';

const VerifyAccount = () => {
    const { type, token } = useParams();
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (token) {
            console.log("🔑 Token reçu depuis l'URL :", token);

            fetch(`http://localhost:4000/api/auth/verify/${type}/${token}`)
                .then((res) => {
                    const contentType = res.headers.get("content-type");
                    if (res.ok && contentType && contentType.includes("application/json")) {
                        return res.json();
                    } else {
                        throw new Error("Lien de vérification invalide ou expiré.");
                    }
                })
                .then((data) => {
                    if (data.message) {
                        setMessage("🎉 Votre compte a été vérifié avec succès !");
                        setStatus("success");
                        setTimeout(() => {
                            window.location.href = `/login/${type}`;
                        }, 3000);
                    } else {
                        setMessage("⚠️ Le lien de vérification est invalide ou a expiré.");
                        setStatus("error");
                    }
                })
                .catch((err) => {
                    console.error("🚨 Erreur attrapée :", err.message);
                    setMessage("⚠️ Le lien de vérification est invalide ou a expiré.");
                    setStatus("error");
                });
        }
    }, [type, token]);

    return (
        <div className={`verify-container ${status}`}>
            <h2>{message}</h2>
        </div>
    );
};

export default VerifyAccount;
