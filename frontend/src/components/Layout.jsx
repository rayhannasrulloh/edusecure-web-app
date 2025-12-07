import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: '80px', width: '100%', minHeight: '100vh', background: '#f8fafc' }}>
                {children}
            </div>
        </div>
    );
};

export default Layout;