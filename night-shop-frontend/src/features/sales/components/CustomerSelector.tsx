import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Autocomplete,
  Paper,
} from '@mui/material';
import { Customer } from '../../../types';
import api from '../../../services/api';

interface CustomerSelectorProps {
  selectedCustomerId: string | null;
  newCustomer: Partial<Customer> | null;
  onCustomerSelect: (customerId: string | null) => void;
  onCustomerSelectFull?: (customer: Customer | null) => void;
  onNewCustomer: (customer: Partial<Customer> | null) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomerId,
  newCustomer,
  onCustomerSelect,
  onCustomerSelectFull,
  onNewCustomer,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) {
      onNewCustomer(null);
    } else {
      onCustomerSelect(null);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    onCustomerSelect(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer && onCustomerSelectFull) {
      onCustomerSelectFull(customer);
    }
  };

  const handleFormChange = (field: keyof Customer, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onNewCustomer(updated);
  };


  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Cliente Existente" />
        <Tab label="Nuevo Cliente" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.dni})`}
              value={customers.find(c => c.id === selectedCustomerId) || null}
              onChange={(event, value) => {
                if (value) {
                  handleCustomerSelect(value.id);
                } else {
                  onCustomerSelect(null);
                  if (onCustomerSelectFull) {
                    onCustomerSelectFull(null);
                  }
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Cliente"
                  placeholder="Nombre, apellido o DNI..."
                />
              )}
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.toLowerCase();
                return options.filter(option =>
                  `${option.firstName} ${option.lastName}`.toLowerCase().includes(inputValue) ||
                  (option.dni && option.dni.toLowerCase().includes(inputValue)) ||
                  (option.phone && option.phone.toLowerCase().includes(inputValue))
                );
              }}
              noOptionsText="No hay clientes disponibles"
            />
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Información del Cliente
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nombre *"
              value={formData.firstName || ''}
              onChange={(e) => handleFormChange('firstName', e.target.value)}
              placeholder="Ej: Juan"
            />

            <TextField
              fullWidth
              label="Apellido *"
              value={formData.lastName || ''}
              onChange={(e) => handleFormChange('lastName', e.target.value)}
              placeholder="Ej: Pérez"
            />

            <TextField
              fullWidth
              label="DNI *"
              value={formData.dni || ''}
              onChange={(e) => handleFormChange('dni', e.target.value)}
              placeholder="Ej: 12345678"
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="Ej: juan@example.com"
            />

            <TextField
              fullWidth
              label="Teléfono *"
              value={formData.phone || ''}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              placeholder="Ej: +58 412 1234567"
            />

            <TextField
              fullWidth
              label="Dirección"
              value={formData.address || ''}
              onChange={(e) => handleFormChange('address', e.target.value)}
              placeholder="Ej: Calle Principal 123"
              multiline
              rows={2}
            />

            {newCustomer && (
              <Paper sx={{ p: 2, backgroundColor: '#e8f5e9', mt: 2 }}>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                  ✓ Cliente se creará al registrar la venta
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomerSelector;
