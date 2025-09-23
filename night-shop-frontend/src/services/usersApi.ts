import api from './api';
import { User, UserFormData } from '../features/users/types';

const BASE_URL = '/users';

export const usersApi = {
  // Obtener todos los usuarios
  getAll: async (): Promise<User[]> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  // Obtener un usuario por ID
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Crear un nuevo usuario
  create: async (userData: UserFormData): Promise<User> => {
    const response = await api.post(BASE_URL, userData);
    return response.data;
  },

  // Actualizar un usuario existente
  update: async (id: string, userData: Partial<UserFormData>): Promise<User> => {
    const response = await api.put(`${BASE_URL}/${id}`, userData);
    return response.data;
  },

  // Eliminar un usuario
  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // Cambiar estado de activación de un usuario
  toggleActive: async (id: string, isActive: boolean): Promise<User> => {
    const response = await api.put(`${BASE_URL}/${id}`, { isActive });
    return response.data;
  }
};

export default usersApi;
