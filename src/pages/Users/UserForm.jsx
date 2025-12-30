import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '../../services/mockData';
import './Users.css';

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        email: '',

        accessLevel: 'Branch Level',
        roleId: '',
    });
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const init = async () => {
            // Load roles
            const availableRoles = await db.getRoles();
            setRoles(availableRoles);

            if (isEditMode) {
                await loadUser(id);
            }
        };
        init();
    }, [id, isEditMode]);

    const loadUser = async (userId) => {
        setIsLoading(true);
        try {
            // Inefficient but matches previous logic; better to have getUserById
            const allUsers = await db.getUsers(); 
            const user = allUsers.find(u => u.id === userId);
            
            if (user) {
                setFormData({
                    email: user.email,
                    accessLevel: user.accessLevel,
                    roleId: user.roleId,
                });
            } else {
                setError('User not found');
            }
        } catch (error) {
            console.error("Error loading user:", error);
            setError("Failed to load user details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            // Validate
            if (!formData.email || !formData.roleId) {
                throw new Error('Please fill in all required fields');
            }



            // Simulate save delay
            await new Promise(resolve => setTimeout(resolve, 600));

            if (isEditMode) {
                // Submit Modification Request
                await db.addRequest('User Modification', {
                    id: id,
                    data: {
                        email: formData.email,
                        accessLevel: formData.accessLevel,
                        roleId: formData.roleId
                    }
                }, 'current_user@bank.com');
                
                alert('User modification request submitted for approval.');
                navigate('/dashboard/users');
            } else {
                const existingUser = await db.findUserByEmail(formData.email);
                if (existingUser) {
                    throw new Error('User with this email already exists');
                }
                
                await db.addRequest('User Creation', formData, 'current_user@bank.com'); 
                
                alert('User creation request submitted for approval.');
                navigate('/dashboard/users'); // Go back to list
            }
        } catch (err) {
            setError(err.message);
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading user details...</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
                <button 
                    onClick={() => navigate('/dashboard/users')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Users
                </button>
            </div>

            <div className="form-card">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>



                    <div className="form-group">
                        <label>Access Level <span className="text-red-500">*</span></label>
                        <select
                            name="accessLevel"
                            className="input-field"
                            value={formData.accessLevel}
                            onChange={handleChange}
                        >
                            <option value="Branch Level">Branch Level</option>
                            <option value="Bank-wide">Bank-wide</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Assign Role <span className="text-red-500">*</span></label>
                        <select
                            name="roleId"
                            className="input-field"
                            value={formData.roleId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a role...</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard/users')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="action-btn"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {isEditMode ? 'Update User' : 'Create User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
