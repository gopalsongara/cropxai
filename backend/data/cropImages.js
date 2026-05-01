const Q = 'auto=format&fit=crop&w=1800&q=82';

const cropImages = {
  wheat: `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?${Q}`,
  rice: `https://images.unsplash.com/photo-1595837046899-144575881736?${Q}`,
  maize: `https://images.unsplash.com/photo-1567375698348-02451c70351e?${Q}`,
  mustard: `https://images.unsplash.com/photo-1598514982841-5fdf9a6e7e3c?${Q}`,
  cotton: `https://images.unsplash.com/photo-1625246333195-78d9c38ad316?${Q}`,
};

const defaultCropImage = `https://images.unsplash.com/photo-1500382017468-9049fed747ef?${Q}`;

module.exports = {
  cropImages,
  defaultCropImage,
};
