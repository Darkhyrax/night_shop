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
    Box,
    Typography
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Product } from '../../types';

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (productData: Partial<Product>) => Promise<void>;
    product: Product | null;
    isLoading: boolean;
    error?: string | null;
}

// Esquema de validación
const validationSchema = yup.object({
    name: yup.string().required('El nombre es requerido'),
    description: yup.string().notRequired(),
    imageUrl: yup.string().url('Ingrese una URL válida').notRequired(),
});

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({ open, onClose, onSave, product, isLoading, error }) => {
    const [formError, setFormError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            name: product?.name || '',
            description: product?.description || '',
            imageUrl: product?.imageUrl || '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            // Limpiar error previo
            setFormError(null);

            try {
                await onSave(values);
            } catch (err: any) {
                setFormError(err.message || 'Error al guardar producto');
                throw err;
            }
        },
        enableReinitialize: true,
    });

    // Resetear el formulario y errores cuando se cierra el diálogo
    useEffect(() => {
        if (!open) {
            // formik.resetForm();
            setFormError(null);
        }
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
                    <DialogTitle>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
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
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Nombre del Producto *"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    id="description"
                                    name="description"
                                    label="Descripción"
                                    multiline
                                    rows={3}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.description && Boolean(formik.errors.description)}
                                    helperText={formik.touched.description && formik.errors.description}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    id="imageUrl"
                                    name="imageUrl"
                                    label="URL de la Imagen"
                                    value={formik.values.imageUrl}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
                                    helperText={formik.touched.imageUrl && formik.errors.imageUrl}
                                    disabled={isLoading}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Nota: Los precios y el stock se definirán posteriormente al ingresar el producto en el inventario.
                                </Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                            {isLoading ? <CircularProgress size={24} /> : product ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </FocusTrap>
    );
};

export default ProductFormDialog;
