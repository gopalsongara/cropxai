/**
 * Crop slug → real field/agronomy photos (Unsplash). Keys align with backend `/api/crop/:cropName`.
 */
const Q = 'auto=format&fit=crop&w=1800&q=82';

export const cropImages = {
  wheat: `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?${Q}`,
  rice: `https://images.unsplash.com/photo-1595837046899-144575881736?${Q}`,
  maize: `https://images.unsplash.com/photo-1567375698348-02451c70351e?${Q}`,
  mustard: `https://images.unsplash.com/photo-1598514982841-5fdf9a6e7e3c?${Q}`,
  cotton: `https://images.unsplash.com/photo-1625246333195-78d9c38ad316?${Q}`,
};

export const DEFAULT_CROP_IMAGE = `https://images.unsplash.com/photo-1500382017468-9049fed747ef?${Q}`;

export const getCropImage = (cropSlugOrName) => {
  if (!cropSlugOrName) return DEFAULT_CROP_IMAGE;
  const key = String(cropSlugOrName).trim().toLowerCase();
  if (key.includes('wheat') || key === 'गेहूं') return cropImages.wheat;
  if (key.includes('rice') || key.includes('paddy') || key === 'चावल' || key === 'धान')
    return cropImages.rice;
  if (key.includes('maize') || key.includes('corn') || key === 'मक्का') return cropImages.maize;
  if (key.includes('mustard') || key.includes('rapeseed') || key === 'सरसों') return cropImages.mustard;
  if (key.includes('cotton') || key === 'कपास') return cropImages.cotton;
  return cropImages[key] || DEFAULT_CROP_IMAGE;
};
