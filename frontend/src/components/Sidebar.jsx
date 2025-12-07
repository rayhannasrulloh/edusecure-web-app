import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings, LogOut, ShieldCheck } from 'lucide-react'; // <--- Import Icon
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('username');
            navigate('/login');
        }
    };

    return (
        <div className="sidebar">
            {/* LOGO AREA */}
            <div className="sidebar-logo">
                <ShieldCheck size={40} color="#1a56db" strokeWidth={2} />
            </div>
            
            <nav className="sidebar-menu">
                {/* Dashboard */}
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    <LayoutDashboard size={24} className="icon" />
                    <span className="label">Dashboard</span>
                </NavLink>
                
                {/* Modules */}
                <NavLink to="/modules" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    <BookOpen size={24} className="icon" />
                    <span className="label">Modules</span>
                </NavLink>

                {/* Settings */}
                <NavLink to="/settings" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
                    <Settings size={24} className="icon" />
                    <span className="label">Settings</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                {/* Logout */}
                <button onClick={handleLogout} className="menu-item logout">
                    <LogOut size={24} className="icon" />
                    <span className="label">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;