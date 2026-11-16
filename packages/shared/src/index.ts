/** Shared constants and types for The Maternity Home apps. */

export const APP_NAME = 'The Maternity Home';
export const CURRENCY = 'PKR' as const;

/** Business WhatsApp (Pakistan). Digits-only for wa.me deep links. */
export const STORE_WHATSAPP_DISPLAY = '+92 3454105452';
export const STORE_WHATSAPP_E164 = '+923454105452';
export const STORE_WHATSAPP_DIGITS = '923454105452';
export const STORE_WHATSAPP_URL = `https://wa.me/${STORE_WHATSAPP_DIGITS}`;
export const STORE_PHONE_DISPLAY = '+92 3454105452';

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
