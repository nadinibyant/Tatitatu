// src/hooks/useRoleMenu.js - fixed version
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getMenuHeadGudang, 
  getMenuItems, 
  getMenuKasirToko, 
  getMenuAdminGudang, 
  getMenuKaryawan,
  getMenuKaryawanTransport,
  getMenuKaryawanProduksi,
  getMenuOwner,
  getMenuFinance,
  getMenuManajer,
  getMenuKaryawanHybrid,
  userOptions,
  updateMenuIcons
} from '../data/menu';

export const useRoleMenu = () => {
    const navigate = useNavigate();
    const [roleMenu, setRoleMenu] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = () => {
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            if (!userData) {
                navigate('/login');
                return;
            }

            setUser(userData);
            
            // Update menu icons timestamp to force reload of icons
            updateMenuIcons();
            
            // Use the dynamic menu getters to ensure fresh menus with correct theming
            switch(userData.role) {
                case 'headgudang':
                    setRoleMenu(getMenuHeadGudang());
                    break;
                case 'admin':
                    setRoleMenu(getMenuItems());
                    break;
                case 'kasirtoko':
                    setRoleMenu(getMenuKasirToko());
                    break;
                case 'admingudang':
                    setRoleMenu(getMenuAdminGudang());
                    break;
                case 'karyawanumum':
                    setRoleMenu(getMenuKaryawan());
                    break;
                case 'karyawanlogistik':
                    setRoleMenu(getMenuKaryawan());
                    break;
                case 'karyawanproduksi':
                    setRoleMenu(getMenuKaryawanProduksi());
                    break;
                case 'karyawantransportasi':
                    setRoleMenu(getMenuKaryawanTransport());
                    break;
                case 'owner':
                    setRoleMenu(getMenuOwner());
                    break;
                case 'finance':
                    setRoleMenu(getMenuFinance());
                    break;
                case 'manajer':
                    setRoleMenu(getMenuManajer());
                    break;
                case 'timhybrid':
                    setRoleMenu(getMenuKaryawanHybrid());
                    break;
                default:
                    setRoleMenu([]);
            }
        };

        fetchUserData();

        // Add an event listener to detect login or role changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'userData' || event.key === 'token') {
                fetchUserData();
            }
        });

        return () => {
            window.removeEventListener('storage', () => {});
        };
    }, [navigate]);

    return {
        menus: roleMenu,
        userOptions,
        user
    };
};