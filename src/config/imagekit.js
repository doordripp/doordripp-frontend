// ImageKit configuration from environment variables
export const imagekitConfig = {
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'your_public_key_here',
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/your_imagekit_id',
  authenticationEndpoint: import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT || `${import.meta.env.VITE_API_URL}/imagekit-auth`,
};

// Check if ImageKit is properly configured
export const isImageKitConfigured = () => {
  return (
    imagekitConfig.publicKey !== 'your_public_key_here' &&
    imagekitConfig.urlEndpoint !== 'https://ik.imagekit.io/your_imagekit_id'
  );
};

/**
 * Add ImageKit transformations to optimize images
 * @param {string} imageUrl - The original image URL
 * @param {object} options - Transformation options
 * @param {number} options.width - Width in pixels (e.g., 800)
 * @param {number} options.height - Height in pixels (e.g., 600)
 * @param {number} options.quality - Quality 1-100 (default: 80)
 * @param {string} options.format - Image format: 'auto', 'webp', 'jpg', 'png' (default: 'auto')
 * @param {string} options.crop - Crop mode: 'maintain_ratio', 'force', 'at_least', 'at_max' (default: 'maintain_ratio')
 * @param {string} options.focus - Focus area: 'center', 'top', 'left', 'bottom', 'right', 'auto'
 * @returns {string} - Optimized image URL with transformations
 */
export const optimizeImage = (imageUrl, options = {}) => {
  // If not an ImageKit URL or empty, return as-is
  if (!imageUrl || !imageUrl.includes('ik.imagekit.io')) {
    return imageUrl;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    crop = 'maintain_ratio',
    focus = 'auto'
  } = options;

  // Build transformation string
  const transformations = [];
  
  if (width) transformations.push(`w-${width}`);
  if (height) transformations.push(`h-${height}`);
  transformations.push(`q-${quality}`);
  transformations.push(`f-${format}`);
  if (crop) transformations.push(`c-${crop}`);
  if (focus) transformations.push(`fo-${focus}`);

  const transformString = `tr:${transformations.join(',')}`;

  // Check if URL already has transformations
  if (imageUrl.includes('/tr:')) {
    // Replace existing transformations
    return imageUrl.replace(/\/tr:[^/]+/, `/${transformString}`);
  }

  // Insert transformations after the ImageKit domain
  // ImageKit URL format: https://ik.imagekit.io/your_id/path/to/image.jpg
  // Should become: https://ik.imagekit.io/your_id/tr:w-800.../path/to/image.jpg
  
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/').filter(p => p); // Remove empty strings
    
    // pathParts[0] is the imagekit ID, rest is the file path
    if (pathParts.length > 0) {
      // Insert transformation after the ID
      pathParts.splice(1, 0, transformString);
      url.pathname = '/' + pathParts.join('/');
      return url.toString();
    }
  } catch (error) {
    console.warn('Failed to parse ImageKit URL:', error);
  }

  return imageUrl;
};
