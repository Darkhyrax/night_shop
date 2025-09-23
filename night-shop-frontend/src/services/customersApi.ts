import api from './api';
import { Customer } from '../types';

const BASE_URL = '/customers';

// Exportar como objeto con nombre en lugar de default export
export const customersApi = {
  /**
   * Obtiene todos los clientes
   */
  getAll: async (): Promise<Customer[]> => {
    try {
      const response = await api.get(BASE_URL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener clientes');
    }
  },

  /**
   * Obtiene un cliente por su ID
   */
  getById: async (id: string): Promise<Customer> => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener cliente');
    }
  },

  /**
   * Crea un nuevo cliente
   */
  create: async (customerData: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.post(BASE_URL, customerData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear cliente');
    }
  },

  /**
   * Actualiza un cliente existente
   */
  update: async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, customerData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar cliente');
    }
  },

  /**
   * Elimina un cliente
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE_URL}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar cliente');
    }
  }
};

// No es necesario exportar por defecto ya que usamos exportación con nombre
