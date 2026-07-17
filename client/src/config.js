// Central place for the backend base URL.
// In dev, Vite loads client/.env (VITE_API_URL=http://localhost:5000).
// In production, set VITE_API_URL in your hosting provider's env settings
// to your deployed backend URL (e.g. https://metro-alarm-api.onrender.com).
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';