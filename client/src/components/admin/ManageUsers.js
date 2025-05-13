// src/components/admin/ManageUsers.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageUsers.css';

const ALL_ROLES = ['proprietaire', 'locataire', 'agent', 'super_admin'];

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        roles: []
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/auth/users', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setUsers(response.data.users);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs :", error);
            }
        };
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user.id_utilisateur);
        setFormData({
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            telephone: user.telephone || '',
            roles: user.roles ? user.roles.split(',') : []
        });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setFormData({
            nom: '',
            prenom: '',
            email: '',
            telephone: '',
            roles: []
        });
    };

    const handleRoleChange = (role) => {
        setFormData((prevFormData) => {
            const newRoles = prevFormData.roles.includes(role)
                ? prevFormData.roles.filter(r => r !== role)
                : [...prevFormData.roles, role];
            return { ...prevFormData, roles: newRoles };
        });
    };

    const handleSave = async () => {
        try {
            const updatedUser = {
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                telephone: formData.telephone,
                roles: formData.roles
            };

            await axios.put(`http://localhost:4000/api/auth/users/${editingUser}`, updatedUser, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setMessage("Utilisateur mis à jour avec succès !");
            setUsers(users.map(user =>
                user.id_utilisateur === editingUser ? { ...user, ...updatedUser, roles: formData.roles.join(",") } : user
            ));
            setEditingUser(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            setMessage("Erreur lors de la mise à jour.");
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:4000/api/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessage("Utilisateur supprimé !");
            setUsers(users.filter(user => user.id_utilisateur !== id));
        } catch (error) {
            setMessage("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="container">
            <h2>Gestion des Utilisateurs</h2>
            {message && <p className="success-message">{message}</p>}
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Rôles</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id_utilisateur}>
                            <td>{user.nom}</td>
                            <td>{user.prenom}</td>
                            <td>{user.email}</td>
                            <td>{user.telephone}</td>
                            <td>{user.roles}</td>
                            <td>
                                {editingUser === user.id_utilisateur ? (
                                    <>
                                        <button onClick={handleSave} className="save-button">Enregistrer</button>
                                        <button onClick={handleCancelEdit} className="cancel-button">Annuler</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(user)} className="edit-button">Modifier</button>
                                        <button onClick={() => deleteUser(user.id_utilisateur)} className="delete-button">Supprimer</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingUser && (
                <div className="edit-form">
                    <h3>Modifier l'Utilisateur</h3>
                    <input type="text" name="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="Nom" />
                    <input type="text" name="prenom" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} placeholder="Prénom" />
                    <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
                    <input type="text" name="telephone" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} placeholder="Téléphone" />
                    
                    <div className="role-checkboxes">
                        {ALL_ROLES.map(role => (
                            <label key={role}>
                                <input
                                    type="checkbox"
                                    checked={formData.roles.includes(role)}
                                    onChange={() => handleRoleChange(role)}
                                />
                                {role}
                            </label>
                        ))}
                    </div>

                    <button onClick={handleSave} className="save-button">Enregistrer</button>
                    <button onClick={handleCancelEdit} className="cancel-button">Annuler</button>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
