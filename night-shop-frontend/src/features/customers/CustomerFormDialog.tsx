import React, { useEffect, useState } from 'react';
import FocusTrap from '../../components/ui/FocusTrap';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    CircularProgress,
    Alert,
    Typography,
    Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Customer } from '../../types';

interface CustomerFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (customerData: Partial<Customer>) => Promise<void>;
    customer: Customer | null;
    isLoading: boolean;
    error?: string | null;
}

// Esquema de validación
const validationSchema = yup.object({
    firstName: yup.string().required('El nombre es requerido'),
    lastName: yup.string().required('El apellido es requerido'),
    email: yup.string().email('Ingrese un email válido').notRequired(),
    phone: yup.string().required('El teléfono es requerido'),
    address: yup.string().notRequired(),
    dni: yup.string().required('El DNI es requerido')
});

const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({ open, onClose, onSave, customer, isLoading, error }) => {
    // La variable isNewCustomer se usa para determinar si estamos creando o editando un cliente
    // y se utiliza en la UI para mostrar el título adecuado
    const [formError, setFormError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            firstName: customer?.firstName || '',
            lastName: customer?.lastName || '',
            email: customer?.email || '',
            phone: customer?.phone || '',
            address: customer?.address || '',
            dni: customer?.dni || '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            // Limpiar error previo
            setFormError(null);

            try {
                await onSave(values);
                // El diálogo se cerrará automáticamente desde el componente padre
            } catch (err: any) {
                // Capturar y mostrar el error en el formulario
                setFormError(err.message || 'Error al guardar el cliente');
            }
        },
        enableReinitialize: true,
    });

    // Resetear el formulario y errores cuando se cierra el diálogo
    useEffect(() => {
        if (!open) {
            formik.resetForm();
            setFormError(null);
        }
    }, [open, formik]);

    // Actualizar el error del formulario si viene desde props
    useEffect(() => {
        if (error) {
            setFormError(error);
        }
    }, [error]);

    return (
        <FocusTrap isOpen={open}>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>{customer ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                Los campos marcados con <span style={{ color: 'error.main' }}>*</span> son obligatorios
                            </Typography>
                        </Box>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                                {formError}
                            </Alert>
                        )}
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="firstName"
                                    name="firstName"
                                    label="Nombre *"
                                    value={formik.values.firstName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                    helperText={formik.touched.firstName && formik.errors.firstName}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="lastName"
                                    name="lastName"
                                    label="Apellido *"
                                    value={formik.values.lastName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                    helperText={formik.touched.lastName && formik.errors.lastName}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="phone"
                                    name="phone"
                                    label="Teléfono *"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                                    helperText={formik.touched.phone && formik.errors.phone}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="dni"
                                    name="dni"
                                    label="DNI *"
                                    value={formik.values.dni}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.dni && Boolean(formik.errors.dni)}
                                    helperText={formik.touched.dni && formik.errors.dni}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    id="address"
                                    name="address"
                                    label="Dirección"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.address && Boolean(formik.errors.address)}
                                    helperText={formik.touched.address && formik.errors.address}
                                    disabled={isLoading}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                          onClick={onClose} 
                          disabled={isLoading}
                          variant="outlined"
                          sx={{
                            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
                              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                            {isLoading ? <CircularProgress size={24} /> : customer ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </FocusTrap>
    );
};

export default CustomerFormDialog;
