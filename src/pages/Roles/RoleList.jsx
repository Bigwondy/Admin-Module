import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { db } from '../../services/mockData';
import './Roles.css';

const RoleList = () => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const data = await db.getRoles();
            setRoles(data);
        } catch (error) {
            console.error("Error loading roles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            const success = await db.deleteRole(id);
            if (success) {
                loadRoles();
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Roles & Permissions</h1>
                <Link to="/dashboard/roles/new" className="action-btn">
                    <Plus size={20} />
                    Create Role
                </Link>
            </div>

            <div className="data-table-container">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading roles...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Module Scope</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Shield size={16} />
                                            </div>
                                            <span className="font-medium">{role.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-semibold">
                                            {role.module || 'All Modules'}
                                        </span>
                                    </td>
                                    <td className="text-slate-500">
                                        {new Date(role.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button 
                                                className="action-icon-btn"
                                                onClick={() => navigate(`/dashboard/roles/edit/${role.id}`)}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                className="action-icon-btn delete"
                                                onClick={() => handleDelete(role.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default RoleList;
