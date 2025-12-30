import React, { useState, useEffect } from 'react';
import { db } from '../../services/mockData';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './Reporting.css';

const HistoryList = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState(new Set());

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const allRequests = await db.getRequests();
            // Filter for Approved or Declined
            const closedRequests = allRequests.filter(r => r.status !== 'Pending');
            setHistory(closedRequests);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const renderPayload = (req) => {
        const data = req.type.includes('Modification') && req.payload.data ? req.payload.data : req.payload;

        if (req.type.includes('User')) {
            return (
                <div className="payload-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
                    <div className="payload-item">
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Email Address</label>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{data.email}</span>
                    </div>
                    <div className="payload-item">
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Access Level</label>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{data.accessLevel}</span>
                    </div>
                    <div className="payload-item">
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Role ID</label>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{data.roleId}</span>
                    </div>
                </div>
            );
        }

        if (req.type.includes('Role')) {
            return (
                <div style={{ marginTop: '12px' }}>
                    <div className="payload-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
                        <div className="payload-item">
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Role Name</label>
                            <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>{data.name}</span>
                        </div>
                        <div className="payload-item">
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Module Access</label>
                            <span style={{ fontSize: '13px', color: '#1e293b' }}>{data.module}</span>
                        </div>
                    </div>
                    {data.permissions && Object.keys(data.permissions).length > 0 && (
                        <div>
                            <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Assigned Permissions</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(data.permissions).map(([category, perms]) => (
                                    <div key={category}>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{category}</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                            {Array.isArray(perms) && perms.map((p, idx) => (
                                                <span key={idx} style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Fallback for other types
        return (
            <div className="payload-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="payload-item">
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{key}</label>
                        <span style={{ fontSize: '13px', color: '#1e293b', wordBreak: 'break-words' }}>
                            {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Approval History</h1>
            </div>

            <div className="report-container">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">Loading history...</div>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Request Type</th>
                                <th>Submitted By</th>
                                <th>Final Status</th>
                                <th>Approved/Declined By</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(req => {
                                const isExpanded = expandedRows.has(req.id);
                                const finalAction = req.history && req.history.length > 0 
                                    ? req.history[req.history.length - 1] 
                                    : null;
                                
                                return (
                                    <React.Fragment key={req.id}>
                                        <tr style={{ cursor: 'pointer' }} onClick={() => toggleRow(req.id)}>
                                            <td>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </td>
                                            <td>
                                                <span className="font-semibold text-slate-700">{req.type}</span>
                                            </td>
                                            <td>
                                                <span className="font-medium">{req.customerName}</span>
                                            </td>
                                            <td>
                                                <span className={`status-cell ${req.status === 'Approved' ? 'status-approved' : 'status-declined'}`}>
                                                    {req.status === 'Approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm text-slate-600">
                                                    {finalAction ? finalAction.actor : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="text-slate-500">
                                                {new Date(req.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="6" style={{ background: '#f8fafc', padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                                                    <div style={{ maxWidth: '800px' }}>
                                                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>Request Details</h4>
                                                        {renderPayload(req)}
                                                        
                                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Approval Timeline</h4>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                {req.history && req.history.map((h, i) => (
                                                                    <div key={i} style={{ fontSize: '12px', color: '#64748b' }}>
                                                                        <span style={{ fontWeight: '600', color: h.action === 'Approved' ? '#16a34a' : h.action === 'Declined' ? '#dc2626' : '#64748b' }}>
                                                                            {h.action}
                                                                        </span>
                                                                        {' by '}
                                                                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{h.actor}</span>
                                                                        {h.date && (
                                                                            <span style={{ marginLeft: '8px', color: '#94a3b8' }}>
                                                                                ({new Date(h.date).toLocaleString()})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-500">
                                        No historical records found.
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

export default HistoryList;
