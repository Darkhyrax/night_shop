import api from './api';
import { Product } from '../types';

const BASE_URL = '/products';

export const productsApi = {
  /**
   * Obtiene todos los productos
   */
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get(BASE_URL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener productos');
    }
  },

  /**
   * Obtiene un producto por su ID
   */
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener producto');
    }
  },

  /**
   * Crea un nuevo producto
   */
  create: async (productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.post(BASE_URL, productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear producto');
    }
  },

  /**
   * Actualiza un producto existente
   */
  update: async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar producto');
    }
  },

  /**
   * Elimina un producto
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE_URL}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar producto');
    }
  }
};
