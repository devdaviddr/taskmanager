// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Environment-aware CORS configuration
export const getCorsOrigins = (): string[] => {
  return isProduction
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];
};