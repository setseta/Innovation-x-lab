const defaultApiBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';

export const apiBaseUrl = import.meta.env.VITE_API_URL || defaultApiBaseUrl;

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};
