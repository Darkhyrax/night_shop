import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    TextField,
    InputAdornment,
    TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import usersApi from '../../services/usersApi';
import MainLayout from '../../components/layout/MainLayout';
import { User, UserRole } from '../../types';
import UserFormDialog from './UserFormDialog';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog';
import { useAuth } from '../../context/AuthContext';

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { user: currentUser } = useAuth();

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []);

    // Función para filtrar usuarios según el término de búsqueda
    const filterUsers = useCallback(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const filtered = users.filter(user =>
            (user.username?.toLowerCase().includes(term) || false) ||
            (user.email?.toLowerCase().includes(term) || false) ||
            (user.firstName?.toLowerCase().includes(term) || false) ||
            (user.lastName?.toLowerCase().includes(term) || false) ||
            (user.dni?.toLowerCase().includes(term) || false) ||
            (user.phoneNumber?.includes(term) || false)
        );

        setFilteredUsers(filtered);
        setPage(0); // Resetear a la primera página cuando se filtra
    }, [searchTerm, users, setPage]);

    // Efecto para filtrar usuarios cuando cambia el término de búsqueda
    useEffect(() => {
        filterUsers();
    }, [filterUsers]);

    // Manejar cambios en el campo de búsqueda
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Manejar cambio de página
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Manejar cambio de filas por página
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Función para cargar usuarios
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await usersApi.getAll();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar usuarios');
            console.error('Error al cargar usuarios:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Abrir formulario para crear usuario
    const handleCreateUser = () => {
        setSelectedUser(null);
        setIsFormOpen(true);
    };

    // Abrir formulario para editar usuario
    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    // Abrir diálogo de confirmación para eliminar
    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    // Eliminar usuario
    const handleDeleteConfirm = async () => {
        if (!selectedUser || !selectedUser.id) return;

        setIsLoading(true);
        try {
            await usersApi.delete(selectedUser.id);
            setUsers(users.filter(user => user.id !== selectedUser.id));
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
        } catch (err: any) {
            setError(err.message || 'Error al eliminar usuario');
            console.error('Error al eliminar usuario:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Guardar usuario (crear o actualizar)
    const handleSaveUser = async (userData: any) => {
        setIsLoading(true);
        setFormError(null); // Limpiar error del formulario
        setError(null); // Limpiar error general
        setSuccessMessage(null); // Limpiar mensaje de éxito
        setShowSuccess(false); // Ocultar alerta de éxito

        try {
            if (selectedUser && selectedUser.id) {
                // Actualizar usuario existente
                const updatedUser = await usersApi.update(selectedUser.id, userData);
                setUsers(users.map(user => user.id === selectedUser.id ? updatedUser : user));
                // Mostrar mensaje de éxito
                setSuccessMessage(`Usuario ${updatedUser.username} actualizado exitosamente`);
            } else {
                // Crear nuevo usuario
                const newUser = await usersApi.create(userData);
                setUsers([...users, newUser]);
                // Mostrar mensaje de éxito
                setSuccessMessage(`Usuario ${newUser.username} creado exitosamente`);
            }
            setIsFormOpen(false); // Cerrar el diálogo inmediatamente
            setShowSuccess(true); // Mostrar la alerta de éxito
        } catch (err: any) {
            // Establecer el error en el estado del formulario, no en el estado general
            setFormError(err.message || 'Error al guardar usuario');
            console.error('Error al guardar usuario:', err);
            // Propagar el error para que el componente del formulario pueda manejarlo
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Cambiar estado de activación
    const handleToggleActive = async (user: User) => {
        if (!user.id) return;
        try {
            const updatedUser = await usersApi.toggleActive(user.id, !user.isActive);
            setUsers(users.map(u => u.id === user.id ? updatedUser : u));
        } catch (err: any) {
            setError(err.message || 'Error al cambiar estado del usuario');
            console.error('Error al cambiar estado del usuario:', err);
        }
    };

    return (
        <MainLayout title="Gestión de Usuarios">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        Gestión de Usuarios
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateUser}
                        disabled={isLoading}
                    >
                        Nuevo Usuario
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Buscar por nombre, usuario, email, DNI o teléfono"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper elevation={2}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ 
                                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#f5f5f5'
                                }}>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>DNI</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            {users.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron resultados para la búsqueda'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.dni}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={<PersonIcon />}
                                                        label={user.role === UserRole.ADMIN ? 'Administrador' : 'Empleado'}
                                                        color={user.role === UserRole.ADMIN ? 'primary' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.isActive ? 'Activo' : 'Inactivo'}
                                                        color={user.isActive ? 'success' : 'error'}
                                                        size="small"
                                                        onClick={() => handleToggleActive(user)}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleEditUser(user)}
                                                        disabled={currentUser?.id === user.id && currentUser?.role !== UserRole.ADMIN}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteClick(user)}
                                                        disabled={currentUser?.id === user.id || (user.role === UserRole.ADMIN && currentUser?.role !== UserRole.ADMIN)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={filteredUsers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página:"
                        />
                    </TableContainer>
                </Paper>
            </Box>

            {/* Diálogo de formulario para crear/editar usuario */}
            <UserFormDialog
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setFormError(null); // Limpiar errores al cerrar
                }}
                onSave={handleSaveUser}
                user={selectedUser}
                isLoading={isLoading}
                error={formError}
            />

            {/* Diálogo de confirmación para eliminar */}
            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Usuario"
                content={`¿Estás seguro de que deseas eliminar al usuario ${selectedUser?.username}? Esta acción no se puede deshacer.`}
                isLoading={isLoading}
            />

            {/* Alerta de éxito */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
};

export default Users;
