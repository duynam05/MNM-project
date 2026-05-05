export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
export const USER_APP_LOGIN_URL =
  import.meta.env.VITE_USER_APP_LOGIN_URL || 'http://127.0.0.1:3000/#/login';

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  if (imagePath.startsWith('storage/')) {
    return `${API_BASE_URL}/${imagePath}`;
  }

  return imagePath;
};
