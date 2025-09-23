import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import MainLayout from '../../components/layout/MainLayout';
import { customersApi } from '../../services/customersApi';
import { Customer } from '../../types';
import CustomerFormDialog from './CustomerFormDialog';
import DeleteConfirmDialog from '../../components/ui/DeleteConfirmDialog';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Función para filtrar clientes según el término de búsqueda
  const filterCustomers = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = customers.filter(customer =>
      customer.firstName.toLowerCase().includes(term) ||
      (customer.lastName && customer.lastName.toLowerCase().includes(term)) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.phone && customer.phone.includes(term)) ||
      (customer.dni && customer.dni.toLowerCase().includes(term)) ||
      (customer.address && customer.address.toLowerCase().includes(term))
    );

    setFilteredCustomers(filtered);
    setPage(0); // Resetear a la primera página cuando se filtra
  }, [searchTerm, customers, setPage]);

  // Efecto para filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    filterCustomers();
  }, [filterCustomers]);

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Función para cargar clientes
  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
      console.error('Error al cargar clientes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir formulario para crear cliente
  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  // Abrir formulario para editar cliente
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  // Abrir diálogo de confirmación para eliminar
  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  // Eliminar cliente
  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    setIsLoading(true);
    try {
      await customersApi.delete(selectedCustomer.id);
      setCustomers(customers.filter(customer => customer.id !== selectedCustomer.id));
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
      setSuccessMessage(`Cliente ${selectedCustomer.firstName} ${selectedCustomer.lastName} eliminado exitosamente`);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cliente');
      console.error('Error al eliminar cliente:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar cliente (crear o actualizar)
  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    setIsLoading(true);
    setFormError(null); // Limpiar error del formulario
    setError(null); // Limpiar error general
    setSuccessMessage(null); // Limpiar mensaje de éxito
    setShowSuccess(false); // Ocultar alerta de éxito

    try {
      if (selectedCustomer) {
        // Actualizar cliente existente
        const updatedCustomer = await customersApi.update(selectedCustomer.id, customerData);
        setCustomers(customers.map(customer => customer.id === selectedCustomer.id ? updatedCustomer : customer));
        // Mostrar mensaje de éxito
        setSuccessMessage(`Cliente ${updatedCustomer.firstName} ${updatedCustomer.lastName} actualizado exitosamente`);
      } else {
        // Crear nuevo cliente
        const newCustomer = await customersApi.create(customerData);
        setCustomers([...customers, newCustomer]);
        // Mostrar mensaje de éxito
        setSuccessMessage(`Cliente ${newCustomer.firstName} ${newCustomer.lastName} creado exitosamente`);
      }
      setIsFormOpen(false); // Cerrar el diálogo inmediatamente
      setShowSuccess(true); // Mostrar la alerta de éxito
    } catch (err: any) {
      // Establecer el error en el estado del formulario, no en el estado general
      setFormError(err.message || 'Error al guardar cliente');
      console.error('Error al guardar cliente:', err);
      // Propagar el error para que el componente del formulario pueda manejarlo
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <MainLayout title="Gestión de Clientes">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Gestión de Clientes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCustomer}
          disabled={isLoading}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre, email, teléfono, DNI o dirección"
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

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>DNI</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((customer) => (
                      <TableRow hover key={customer.id}>
                        <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.dni}</TableCell>
                        <TableCell>{customer.email || 'N/A'}</TableCell>
                        <TableCell>{customer.address || 'N/A'}</TableCell>
                        <TableCell>{formatDate(customer.createdAt)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditCustomer(customer)}
                              disabled={isLoading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(customer)}
                              disabled={isLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {customers.length === 0 ? 'No hay clientes disponibles' : 'No se encontraron resultados para la búsqueda'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCustomers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </>
        )}
      </Paper>

      {/* Diálogo de formulario para crear/editar cliente */}
      <CustomerFormDialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormError(null); // Limpiar errores al cerrar
        }}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
        isLoading={isLoading}
        error={formError}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cliente"
        content={`¿Estás seguro de que deseas eliminar al cliente ${selectedCustomer?.firstName} ${selectedCustomer?.lastName}? Esta acción no se puede deshacer.`}
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

export default Customers;
