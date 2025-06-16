// src/components/LayoutWithNav.jsx
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { useRoleMenu } from '../hooks/userRoleMenu';
import { updateMenuIcons } from '../data/menu';

const LayoutWithNav = ({ children }) => {
    const { menus, userOptions, user } = useRoleMenu();

    // Force icon update when component mounts
    useEffect(() => {
        if (user) {
            // Update the icon timestamp to force refresh
            updateMenuIcons();
        }
    }, [user]);

    if (!user) return null;

    return (
        <Navbar 
            menuItems={menus} 
            userOptions={userOptions}
            label={children.props?.label || ''}
        >
            {children}
        </Navbar>
    );
};

export default LayoutWithNav;