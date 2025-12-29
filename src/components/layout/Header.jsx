import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <div className="header-profile">
                <div className="profile-info">
                    <span className="profile-name">{user?.email || 'Admin User'}</span>
                    <span className="profile-role">{user?.accessLevel || 'Administrator'}</span>
                </div>
                <UserCircle size={32} className="text-slate-400" />
                
                <button 
                    onClick={logout} 
                    className="logout-btn" 
                    title="Logout"
                    style={{ marginLeft: '1rem' }}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
};

export default Header;
