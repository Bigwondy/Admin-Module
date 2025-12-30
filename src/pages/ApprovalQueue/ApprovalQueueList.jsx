import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { db } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import './ApprovalQueue.css';

const ApprovalQueueList = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const pending = await db.getPendingRequestsForRole(user.roleId);
            setRequests(pending);
        } catch (error) {
            console.error("Error loading requests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Approve this request?')) {
            const success = await db.approveRequest(id, user.email);
            if (success) {
                loadRequests();
            }
        }
    };

    const handleDecline = async (id) => {
        if (window.confirm('Decline this request?')) {
            const success = await db.declineRequest(id, user.email);
            if (success) {
                loadRequests();
            }
        }
    };

    const renderPayload = (req) => {
        const data = req.type.includes('Modification') && req.payload.data ? req.payload.data : req.payload;

        if (req.type.includes('User')) {
            return (
                <div className="payload-grid">
                    <div className="payload-item">
                        <label>Email Address</label>
                        <span>{data.email}</span>
                    </div>
                    <div className="payload-item">
                        <label>Access Level</label>
                        <span>{data.accessLevel}</span>
                    </div>
                    <div className="payload-item">
                        <label>Role ID</label>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">{data.roleId}</span>
                    </div>
                    {data.password && (
                         <div className="payload-item">
                            <label>Password</label>
                            <span className="text-slate-400 italic">●●●●●●●●</span>
                        </div>
                    )}
                </div>
            );
        }

        if (req.type.includes('Role')) {
             return (
                <div className="space-y-4">
                    <div className="payload-grid">
                         <div className="payload-item">
                            <label>Role Name</label>
                            <span>{data.name}</span>
                        </div>
                         <div className="payload-item">
                            <label>Module Access</label>
                            <span>{data.module}</span>
                        </div>
                    </div>
                    <div>
                         <label className="text-xs text-slate-500 block mb-2">Assigned Permissions</label>
                         <div className="space-y-3">
                            {data.permissions && Object.entries(data.permissions).map(([category, perms]) => (
                                <div key={category}>
                                    <span className="text-xs font-semibold text-slate-500 block mb-1 uppercase">{category}</span>
                                    <div className="flex flex-wrap gap-1">
                                        {Array.isArray(perms) && perms.map((p, idx) => (
                                            <span key={idx} className="permission-tag">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            );
        }

        // Fallback for others (Card/Stock)
        return (
             <div className="payload-grid">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="payload-item">
                        <label>{key}</label>
                        <span className="break-words">{typeof value === 'object' ? JSON.stringify(value) : value.toString()}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Approval Queue</h1>
            </div>

            <div className="queue-container">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">checking for pending requests...</div>
                ) : (
                    <>
                        {requests.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">All Caught Up!</h3>
                                <p className="text-slate-500 mt-2">You have no pending approvals at this time.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="queue-card">
                                    <div className="request-meta">
                                        <span className="request-type-badge">{req.type}</span>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Clock size={16} />
                                            <span>{new Date(req.date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="request-details">
                                        <h3>Request for {req.customerName}</h3>
                                        <div className="detail-row">
                                            <span><strong>Type:</strong> {req.type}</span>
                                            <span><strong>Current Stage:</strong> Level {req.currentLevel}</span>
                                        </div>
                                        
                                        {/* Payload Preview */}
                                        {req.payload && (
                                            <div className="payload-container">
                                                <div className="payload-header">Request Full Details</div>
                                                <div className="payload-content">
                                                    {renderPayload(req)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="queue-actions">
                                        <button 
                                            className="btn-decline"
                                            onClick={() => handleDecline(req.id)}
                                        >
                                            <XCircle size={18} />
                                            Decline
                                        </button>
                                        <button 
                                            className="btn-approve"
                                            onClick={() => handleApprove(req.id)}
                                        >
                                            <CheckCircle size={18} />
                                            Approve Request
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ApprovalQueueList;
