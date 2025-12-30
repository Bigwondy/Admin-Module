import React, { useState, useEffect } from 'react';
import { db } from '../../services/mockData';
import { Activity, Shield, User, FileText, Lock } from 'lucide-react';
import '../History/Reporting.css'; // Reuse styles

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Subscribe to real-time updates
        const unsubscribe = db.subscribeToActivity((newLogs) => {
            setLogs(newLogs);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const getIcon = (action) => {
        if (action.includes('USER')) return <User size={20} />;
        if (action.includes('ROLE')) return <Shield size={20} />;
        if (action.includes('REQUEST')) return <FileText size={20} />;
        if (action.includes('LOGIN') || action.includes('LOGOUT')) return <Lock size={20} />;
        return <Activity size={20} />;
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Activity Logs</h1>
            </div>

            <div className="report-container">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">Loading activity...</div>
                ) : (
                    <div>
                        {logs.map(log => (
                            <div key={log.id} className="log-entry">
                                <div className="log-icon">
                                    {getIcon(log.action)}
                                </div>
                                <div className="log-content">
                                    <div className="flex justify-between items-start">
                                        <span className="log-title">
                                            <span className="font-bold">{log.actor}</span> performed {log.action} on <span className="font-semibold text-slate-800">{log.target}</span>
                                        </span>
                                        <span className="log-time">
                                            {log.timestamp && new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="log-meta">
                                        {log.details}
                                    </div>
                                </div>
                            </div>
                        ))}
                         {logs.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                No activity recorded.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
