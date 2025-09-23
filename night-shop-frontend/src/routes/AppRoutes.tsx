import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Importación de páginas (se crearán después)
const Login = React.lazy(() => import('../features/auth/Login'));
const Dashboard = React.lazy(() => import('../features/dashboard/Dashboard'));
const Products = React.lazy(() => import('../features/products/Products'));
const Inventory = React.lazy(() => import('../features/inventory/Inventory'));
const Sales = React.lazy(() => import('../features/sales/Sales'));
const Customers = React.lazy(() => import('../features/customers/Customers'));
const Users = React.lazy(() => import('../features/users/Users'));
const NotFound = React.lazy(() => import('../components/layout/NotFound'));

// Componente de protección de rutas
interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />

                {/* Rutas protegidas */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <Products />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventory"
                    element={
                        <ProtectedRoute>
                            <Inventory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/sales"
                    element={
                        <ProtectedRoute>
                            <Sales />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customers"
                    element={
                        <ProtectedRoute>
                            <Customers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <Users />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta para páginas no encontradas */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </React.Suspense>
    );
};

export default AppRoutes;
