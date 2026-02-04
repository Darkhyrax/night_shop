// Tipos comunes
export type ID = string;

// Enumeraciones
export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export enum PaymentCurrency {
  USD = 'usd',
  BS = 'bs'
}

export enum SaleType {
  CREDIT = 'credit',
  CASH = 'cash'
}

export enum ChangePaymentMethod {
  USD = 'usd',
  BS = 'bs',
  MIXED = 'mixed'
}

// Interfaces de entidades
export interface User {
  id?: ID;
  userId?: ID;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dni?: string;
  role: UserRole | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  costCurrency: 'usd' | 'bs';
  totalCostBs: number;
  totalCostUsd: number;
  purchaseExchangeRateId: ID;
  purchaseExchangeRate?: ExchangeRate;
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
  effectiveDate: string;
  isActive: boolean;
  source?: string;
  notes?: string;
  rateType: 'BCV' | 'CUSTOM';
  isManuallySet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRateSyncLog {
  id: ID;
  syncedAt: string;
  success: boolean;
  errorMessage?: string | null;
  rate?: number | null;
  source: string;
}

export interface SyncStatus {
  lastSync: ExchangeRateSyncLog | null;
  success: boolean | null;
  errorMessage: string | null;
  rate: number | null;
  syncedAt: string | null;
}

export interface Sale {
  id: ID;
  status: SaleStatus;
  saleType: SaleType;
  totalAmountBs: number;
  totalAmountUsd: number;
  exchangeRateId: ID;
  exchangeRate?: ExchangeRate;
  paidAmountBs: number;
  paidAmountUsd: number;
  changeUsd: number;
  changeBS: number;
  changeTotalUsd: number;
  changePaymentMethod?: ChangePaymentMethod;
  userId: ID;
  customerId?: ID;
  customer?: Customer;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  saleDetails?: SaleDetail[];
  customerPayments?: CustomerPayment[];
}

export interface CustomerAccount {
  id: ID;
  customerId: ID;
  saleId: ID;
  debtUsd: number;
  createdAt: string;
}

export interface CustomerPayment {
  id: ID;
  customerId: ID;
  amountUsd: number;
  paidInCurrency: PaymentCurrency;
  amountPaidInOriginalCurrency: number;
  exchangeRateId?: ID;
  isInitialPayment: boolean;
  createdAt: string;
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
  product?: Product;
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
