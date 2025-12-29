import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { db } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import './Users.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setIsLoading(true);
        // Simulate network
        setTimeout(() => {
            const data = db.getUsers();
            setUsers(data);
            setIsLoading(false);
        }, 500);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const success = db.deleteUser(id);
            if (success) {
                loadUsers();
            }
        }
    };

    const getRoleName = (roleId) => {
        // In real app, we'd look this up from roles list
        return roleId.replace('role_', '').replace(/_/g, ' ').toUpperCase();
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Users</h1>
                <Link to="/dashboard/users/new" className="action-btn">
                    <Plus size={20} />
                    Add User
                </Link>
            </div>

            <div className="data-table-container">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading users...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Email Address</th>
                                <th>Role</th>
                                <th>Access Level</th>
                                <th>Date Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {u.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium">{u.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold">
                                            {getRoleName(u.roleId)}
                                        </span>
                                    </td>
                                    <td>{u.accessLevel}</td>
                                    <td className="text-slate-500">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button 
                                                className="action-icon-btn"
                                                onClick={() => navigate(`/dashboard/users/edit/${u.id}`)}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                className="action-icon-btn delete"
                                                onClick={() => handleDelete(u.id)}
                                                title="Delete"
                                                disabled={u.id === currentUser?.id} // Prevent self-delete
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserList;
