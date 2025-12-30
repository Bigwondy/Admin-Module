import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import './Roles.css';

const MODULES = ['Lyra CMS', 'Lyra Prepaid', 'Lyra Credit', 'FIP'];

const PERMISSIONS_CONFIG = {
    'Lyra CMS': [
        'Authorization Queue Menu',
        'Branch Delivery',
        'Card Fee',
        'Card Scheme',
        'Card Profile',
        'Central Stock',
        'Branch Stock',
        'Card Processing',
        'Card Issuance',
        'Cards'
    ],
    'Lyra Prepaid': ['Product Management', 'Audit Log'],
    'Lyra Credit': ['Product Management', 'Audit Log'],
    'FIP': ['Product Management', 'Audit Log']
};

const ACTIONS = ['Create', 'View', 'Edit', 'Delete'];

const RoleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        module: 'Lyra CMS',
    });
    
    // Permissions state: { 'CategoryName': ['Create', 'View'] }
    const [permissions, setPermissions] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const init = async () => {
             if (isEditMode) {
                const roles = await db.getRoles();
                const role = roles.find(r => r.id === id);
                if (role) {
                    setFormData({ name: role.name, module: role.module });
                    setPermissions(role.permissions || {});
                }
            }
        };
        init();
    }, [id, isEditMode]);

    const handleModuleChange = (e) => {
        const moduleName = e.target.value;
        setFormData(prev => ({ ...prev, module: moduleName }));
        // Reset permissions when module changes
        setPermissions({});
    };

    const togglePermission = (category, action) => {
        setPermissions(prev => {
            const current = prev[category] || [];
            const exists = current.includes(action);
            
            let updated;
            if (exists) {
                updated = current.filter(a => a !== action);
            } else {
                updated = [...current, action];
            }

            return {
                ...prev,
                [category]: updated
            };
        });
    };

    const toggleCategoryAll = (category) => {
        setPermissions(prev => {
            const current = prev[category] || [];
            const allSelected = current.length === ACTIONS.length;

            return {
                ...prev,
                [category]: allSelected ? [] : [...ACTIONS]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            if (!formData.name) throw new Error('Role name is required');

            // Mock save delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const roleData = {
                ...formData,
                permissions
            };

            if (isEditMode) {
                await db.addRequest('Role Modification', {
                    id: id,
                    data: roleData
                }, user?.email || 'unknown@bank.com');
                alert('Role modification request submitted for approval.');
            } else {
                await db.addRequest('Role Creation', roleData, user?.email || 'unknown@bank.com');
                alert('Role creation request submitted for approval.');
            }

            navigate('/dashboard/roles');
        } catch (err) {
            console.error("Error submitting role request:", err);
            alert(`Error: ${err.message || "Failed to submit role request."}`);
        } finally {
            setIsSaving(false);
        }
    };

    const styles = {
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{isEditMode ? 'Edit Role' : 'Create New Role'}</h1>
                <button 
                    onClick={() => navigate('/dashboard/roles')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to Roles
                </button>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Role Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Branch Manager"
                        />
                    </div>

                    <div className="form-group">
                        <label>Module Scope <span className="text-red-500">*</span></label>
                        <select
                            className="input-field"
                            value={formData.module}
                            onChange={handleModuleChange}
                        >
                            {MODULES.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="permissions-section">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Permissions for {formData.module}
                        </h3>

                        {PERMISSIONS_CONFIG[formData.module]?.map(category => {
                            const currentPerms = permissions[category] || [];
                            const allSelected = currentPerms.length === ACTIONS.length;

                            return (
                                <div key={category} className="permission-category">
                                    <div className="category-header">
                                        <span className="category-title">{category}</span>
                                        <label className="select-all-label">
                                            <input 
                                                type="checkbox" 
                                                checked={allSelected} 
                                                onChange={() => toggleCategoryAll(category)}
                                                style={{ display: 'none' }}
                                            />
                                            {allSelected ? 'Unselect All' : 'Select All'}
                                        </label>
                                    </div>
                                    <div className="permission-grid">
                                        {ACTIONS.map(action => (
                                            <label key={action} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={currentPerms.includes(action)}
                                                    onChange={() => togglePermission(category, action)}
                                                />
                                                {action}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard/roles')}
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
                                    {isEditMode ? 'Update Role' : 'Create Role'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleForm;
