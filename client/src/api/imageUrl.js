const uploadBase = import.meta.env.VITE_UPLOAD_URL || '';

export const imageUrl = (path) => (path ? `${uploadBase}${path}` : null);
