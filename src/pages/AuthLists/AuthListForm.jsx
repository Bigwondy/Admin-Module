import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '../../services/mockData';
import './AuthLists.css';

const REQUEST_TYPES = [
    'Card Request', 
    'Branch Stock Request',
    'User Creation',
    'User Modification',
    'Role Creation',
    'Role Modification'
];

const AuthListForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        requestType: 'Card Request',
        approvalLevel: 1,
        level1Role: '',
        level2Role: '',
        level3Role: '',
    });
    const [roles, setRoles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setRoles(db.getRoles());
        if (isEditMode) {
            const list = db.getAuthLists().find(l => l.id === id);
            if (list) {
                setFormData(list);
            }
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'approvalLevel' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (isEditMode) {
            db.updateAuthList(id, formData);
        } else {
            db.addAuthList(formData);
        }

        navigate('/dashboard/auth-lists');
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{isEditMode ? 'Edit Workflow' : 'Create Workflow'}</h1>
                <button 
                    onClick={() => navigate('/dashboard/auth-lists')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to List
                </button>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Request Type <span className="text-red-500">*</span></label>
                        <select
                            name="requestType"
                            className="input-field"
                            value={formData.requestType}
                            onChange={handleChange}
                            required
                        >
                            {REQUEST_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number of Approval Levels <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="approvalLevel"
                            className="input-field"
                            min="1"
                            max="10"
                            value={formData.approvalLevel}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Configure Approvers</h3>
                        {Array.from({ length: Math.max(1, formData.approvalLevel) }).map((_, index) => {
                            const level = index + 1;
                            const fieldName = `level${level}Role`;
                            return (
                                <div key={level} className="form-group">
                                    <label>Level {level} Approver Role <span className="text-red-500">*</span></label>
                                    <select
                                        name={fieldName}
                                        className="input-field"
                                        value={formData[fieldName] || ''}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Role...</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard/auth-lists')}
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
                                    {isEditMode ? 'Update Workflow' : 'Create Workflow'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthListForm;
