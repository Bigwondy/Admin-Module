import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCircle, Menu } from 'lucide-react';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <button 
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg mr-4"
                onClick={onToggleSidebar}
            >
                <Menu size={24} className="text-slate-600" />
            </button>

            <div className="header-profile ml-auto">
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
