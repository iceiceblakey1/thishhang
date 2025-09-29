// Shared utility functions

// Generate unique ID
export const generateUUID = () => crypto.randomUUID();

// API Base URL - standardized across services
export const API_BASE_URL = 'https://housewives-backend-853345739699.us-central1.run.app/api';

// Format date utility
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Error handling utility
export const handleApiError = (error: any, fallbackMessage: string = 'An error occurred') => {
  console.error('API Error:', error);
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};