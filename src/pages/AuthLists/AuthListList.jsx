import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, GitMerge } from 'lucide-react';
import { db } from '../../services/mockData';
import './AuthLists.css';

const AuthListList = () => {
    const [lists, setLists] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [listsData, rolesData] = await Promise.all([
                db.getAuthLists(),
                db.getRoles()
            ]);
            setLists(listsData);
            setRoles(rolesData);
        } catch (error) {
            console.error("Error loading auth lists:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleName = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        return role ? role.name : 'Unknown Role';
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this authorization workflow?')) {
            const success = await db.deleteAuthList(id);
            if (success) {
                loadData();
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Authorization Lists</h1>
                <Link to="/dashboard/auth-lists/new" className="action-btn">
                    <Plus size={20} />
                    Create Workflow
                </Link>
            </div>

            <div className="data-table-container">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading workflows...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Request Type</th>
                                <th>Approval Levels</th>
                                <th>Approver Chain</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lists.map(list => (
                                <tr key={list.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                                <GitMerge size={16} />
                                            </div>
                                            <span className="font-medium">{list.requestType}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-semibold">
                                            {list.approvalLevel} Step{list.approvalLevel > 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td className="text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-600">1. {getRoleName(list.level1Role)}</span>
                                            {list.approvalLevel >= 2 && <span className="text-slate-600">2. {getRoleName(list.level2Role)}</span>}
                                            {list.approvalLevel >= 3 && <span className="text-slate-600">3. {getRoleName(list.level3Role)}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button 
                                                className="action-icon-btn"
                                                onClick={() => navigate(`/dashboard/auth-lists/edit/${list.id}`)}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                className="action-icon-btn delete"
                                                onClick={() => handleDelete(list.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {lists.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-500">
                                        No authorization workflows defined.
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

export default AuthListList;
