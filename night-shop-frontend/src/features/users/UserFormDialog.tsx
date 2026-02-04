import React, { useEffect, useState } from 'react';
import FocusTrap from '../../components/ui/FocusTrap';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    CircularProgress,
    Switch,
    FormControlLabel,
    Alert,
    Typography,
    Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { User, UserFormData } from './types';
import { UserRole } from '../../types/common';

interface UserFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (userData: UserFormData) => Promise<void>;
    user: User | null;
    isLoading: boolean;
    error?: string | null;
}

// Esquema de validación
const validationSchema = yup.object({
    username: yup.string().required('El nombre de usuario es requerido'),
    email: yup.string().email('Ingrese un email válido').required('El email es requerido'),
    firstName: yup.string().required('El nombre es requerido'),
    lastName: yup.string().required('El apellido es requerido'),
    phoneNumber: yup.string().required('El teléfono es requerido'),
    dni: yup.string().required('El DNI es requerido'),
    password: yup.string().when('isNew', {
        is: true,
        then: (schema) => schema.min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
        otherwise: (schema) => schema.notRequired(),
    }),
    role: yup.string().required('El rol es requerido'),
});

const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onClose, onSave, user, isLoading, error }) => {
    const isNewUser = !user;

    const [formError, setFormError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            username: user?.username || '',
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            dni: user?.dni || '',
            password: '',
            role: user?.role || UserRole.EMPLOYEE,
            isActive: user?.isActive ?? true,
            isNew: isNewUser,
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            // Limpiar error previo
            setFormError(null);

            // Eliminar el campo isNew antes de enviar
            const { isNew, ...userData } = values as { isNew: boolean } & UserFormData;

            // Si no es un nuevo usuario y no se proporciona contraseña, eliminarla
            if (!isNew && !userData.password) {
                delete userData.password;
            }

            try {
                await onSave(userData);
                // El diálogo se cerrará automáticamente desde el componente padre
            } catch (err: any) {
                // Capturar y mostrar el error en el formulario
                setFormError(err.message || 'Error al guardar el usuario');
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
                    <DialogTitle>{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
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
                                    id="username"
                                    name="username"
                                    label="Nombre de Usuario"
                                    value={formik.values.username}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.username && Boolean(formik.errors.username)}
                                    helperText={formik.touched.username && formik.errors.username}
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
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    label="Teléfono *"
                                    value={formik.values.phoneNumber}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                                    helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
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
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="password"
                                    name="password"
                                    label={isNewUser ? "Contraseña *" : "Contraseña (dejar en blanco para mantener)"}
                                    type="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)}>
                                    <InputLabel id="role-label">Rol *</InputLabel>
                                    <Select
                                        labelId="role-label"
                                        id="role"
                                        name="role"
                                        value={formik.values.role}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        label="Rol"
                                        disabled={isLoading}
                                    >
                                        <MenuItem value={UserRole.ADMIN}>Administrador</MenuItem>
                                        <MenuItem value={UserRole.EMPLOYEE}>Empleado</MenuItem>
                                    </Select>
                                    {formik.touched.role && formik.errors.role && (
                                        <FormHelperText>{formik.errors.role as string}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid size={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formik.values.isActive}
                                            onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                                            name="isActive"
                                            color="primary"
                                            disabled={isLoading}
                                        />
                                    }
                                    label="Usuario Activo"
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
                            {isLoading ? <CircularProgress size={24} /> : user ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </FocusTrap>
    );
};

export default UserFormDialog;
