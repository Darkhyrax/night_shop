import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <List component="nav">
        <ListItemButton 
          selected={isActive('/')} 
          onClick={() => handleNavigation('/')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        
        <ListItemButton 
          selected={isActive('/products')} 
          onClick={() => handleNavigation('/products')}
        >
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Productos" />
        </ListItemButton>
        
        <ListItemButton 
          selected={isActive('/inventory')} 
          onClick={() => handleNavigation('/inventory')}
        >
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Inventario" />
        </ListItemButton>
        
        <ListItemButton 
          selected={isActive('/sales')} 
          onClick={() => handleNavigation('/sales')}
        >
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Ventas" />
        </ListItemButton>
        
        <ListItemButton 
          selected={isActive('/customers')} 
          onClick={() => handleNavigation('/customers')}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Clientes" />
        </ListItemButton>
        
        {/* Mostrar opciones de administrador solo para usuarios con rol admin */}
        {user?.role === UserRole.ADMIN && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemButton 
              selected={isActive('/users')} 
              onClick={() => handleNavigation('/users')}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
            </ListItemButton>
          </>
        )}
        
        <Divider sx={{ my: 1 }} />
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </List>
    </>
  );
};

export default Sidebar;
