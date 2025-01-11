// src/hooks/useRoleMenu.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuHeadGudang, menuItems, menuKasirToko, userOptions, menuAdminGudang, menuKaryawan, menuKaryawanTransport, menuKaryawanProduksi, menuOwner, menuFinance } from '../data/menu';

export const useRoleMenu = () => {
    const navigate = useNavigate();
    const [roleMenu, setRoleMenu] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (!userData) {
            navigate('/login');
            return;
        }

        setUser(userData);
        
        switch(userData.role) {
            case 'headgudang':
                setRoleMenu(menuHeadGudang);
                break;
            case 'admin':
                setRoleMenu(menuItems);
                break;
            case 'kasirtoko':
                setRoleMenu(menuKasirToko);
                break;
            case 'admingudang':
                setRoleMenu(menuAdminGudang);
                break;
            case 'karyawanumum':
                setRoleMenu(menuKaryawan)
                break
            case 'karyawanlogistik':
                setRoleMenu(menuKaryawan)
                break
            case 'karyawanproduksi':
                setRoleMenu(menuKaryawanProduksi)
                break
            case 'karyawantransportasi':
                setRoleMenu(menuKaryawanTransport)
                break
            case 'owner':
                setRoleMenu(menuOwner)
                break
            case 'finance':
                setRoleMenu(menuFinance)
                break
            default:
                setRoleMenu([]);
        }
    }, [navigate]);

    return {
        menus: roleMenu,
        userOptions,
        user
    };
};