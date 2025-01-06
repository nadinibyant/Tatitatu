// src/components/LayoutWithNav.jsx
import React from 'react';
import Navbar from './Navbar';
import { useRoleMenu } from '../hooks/userRoleMenu';

const LayoutWithNav = ({ children }) => {
    const { menus, userOptions, user } = useRoleMenu();

    if (!user) return null;

    return (
        <Navbar menuItems={menus} userOptions={userOptions}>
            {children}
        </Navbar>
    );
};

export default LayoutWithNav;