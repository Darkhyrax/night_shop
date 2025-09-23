import { UserRole } from '../../types/common';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dni: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dni: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}
