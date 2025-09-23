// Tipos comunes
export type ID = string;

// Enumeraciones
export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CurrencyType {
  USD = 'usd',
  BS = 'bs',
  MIXED = 'mixed'
}

// Interfaces de entidades
export interface User {
  id: ID;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dni: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: ID;
  name: string;
  description?: string;
  imageUrl?: string;
  currentCostPrice: number;
  currentProfitPercentage: number;
  currentSellingPrice: number;
  totalStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBatch {
  id: ID;
  productId: ID;
  batchCode: string;
  totalCostBs: number;
  totalCostUsd: number;
  purchaseExchangeRateId: ID;
  initialQuantity: number;
  currentQuantity: number;
  profitPercentage: number;
  unitCostUsd: number;
  unitCostBs: number;
  sellingPriceUsd: number;
  purchaseDate: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: ID;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dni?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: ID;
  rate: number;
  date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: ID;
  status: SaleStatus;
  currency: CurrencyType;
  totalAmountBs: number;
  totalAmountUsd: number;
  exchangeRateId: ID;
  paidAmountBs: number;
  paidAmountUsd: number;
  userId: ID;
  customerId?: ID;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  saleDetails?: SaleDetail[];
}

export interface SaleDetail {
  id: ID;
  saleId: ID;
  productId: ID;
  quantity: number;
  unitPriceBs: number;
  unitPriceUsd: number;
  subtotalBs: number;
  subtotalUsd: number;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Interfaces para respuestas de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
