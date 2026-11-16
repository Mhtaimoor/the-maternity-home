/** Shared constants and types for The Maternity Home apps. */

export const APP_NAME = 'The Maternity Home';
export const CURRENCY = 'PKR' as const;

export type UserRole = 'OWNER' | 'ORDER_STAFF' | 'CONTENT_MANAGER' | 'CUSTOMER';

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'GATEWAY';

export interface ApiHealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}
