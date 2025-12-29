import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
    Users, 
    Shield, 
    FileSignature, 
    ListTodo, 
    History, 
    Activity, 
    User
} from 'lucide-react';
import './Sidebar.css';
import { db } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const location = useLocation();
    const [imgError, setImgError] = useState(false);

    const navItems = [
        { path: '/dashboard/users', label: 'Users', icon: Users },
        { path: '/dashboard/roles', label: 'Roles', icon: Shield },
        { path: '/dashboard/auth-lists', label: 'Auth Lists', icon: FileSignature },
        { path: '/dashboard/approval-queue', label: 'Approval Queue', icon: ListTodo },
        { path: '/dashboard/history', label: 'Approval History', icon: History },
        { path: '/dashboard/activity', label: 'Activity Logs', icon: Activity },
    ];

    useEffect(() => {
        // Safety check: ensure user exists
        if (!user || !user.roleId) return;

        const checkPending = () => {
            try {
                // Defensive call
                const requests = db.getPendingRequestsForRole(user.roleId);
                setPendingCount(requests ? requests.length : 0);
            } catch (err) {
                console.error("Error fetching pending count:", err);
            }
        };

        checkPending();
        const interval = setInterval(checkPending, 2000);

        return () => clearInterval(interval);
    }, [user]);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="flex items-center gap-3 px-2">
                    {!imgError ? (
                        <img 
                            src="https://logo.clearbit.com/providusbank.com" 
                            alt="Providus Bank" 
                            className="h-8 w-8 object-contain"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-xl font-bold tracking-tight text-white">Providus Bank</span>
                    )}
                    {!imgError && <span className="text-xl font-bold tracking-tight text-white">Providus Bank</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    const isQueue = item.path === '/dashboard/approval-queue';
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onClose && onClose()}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                            {isQueue && pendingCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.email || 'User'}</span>
                        <span className="user-role">{user?.accessLevel || 'Admin'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
