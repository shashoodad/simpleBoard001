export const APP_ENV = (import.meta.env.VITE_APP_ENV || __APP_ENV__ || 'development').toString();
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').toString();

export const isProd = APP_ENV === 'production';
export const isDev = !isProd;
