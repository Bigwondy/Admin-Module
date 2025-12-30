import React, { useState, useEffect } from 'react';
import { db } from '../../services/mockData';
import { CheckCircle, XCircle } from 'lucide-react';
import './Reporting.css';

const HistoryList = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
                                <th>Request Type</th>
                                <th>Customer & Branch</th>
                                <th>Final Status</th>
                                <th>Date</th>
                                <th>History Log</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(req => (
                                <tr key={req.id}>
                                    <td>
                                        <span className="font-semibold text-slate-700">{req.type}</span>
                                    </td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{req.customerName}</span>
                                            <span className="text-xs text-slate-500">{req.branch}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-cell ${req.status === 'Approved' ? 'status-approved' : 'status-declined'}`}>
                                            {req.status === 'Approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="text-slate-500">
                                        {new Date(req.date).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="text-xs text-slate-500 max-w-[200px]">
                                            {req.history.map((h, i) => (
                                                <div key={i} className="mb-1">
                                                    <span className="font-semibold">{h.action}:</span> {h.actor}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {history.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-500">
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
