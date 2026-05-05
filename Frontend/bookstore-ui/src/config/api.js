export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000";

export const ADMIN_APP_URL =
  process.env.REACT_APP_ADMIN_APP_URL ||
  "http://127.0.0.1:5173";

export const DEFAULT_AVATAR_URL = "/default-avatar.svg";

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export const extractResultList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  if (Array.isArray(data?.result?.content)) {
    return data.result.content;
  }

  return [];
};

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder-book.svg';
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

export const resolveAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return DEFAULT_AVATAR_URL;
  }

  if (/^https?:\/\//i.test(avatarPath)) {
    return avatarPath;
  }

  return avatarPath;
};
