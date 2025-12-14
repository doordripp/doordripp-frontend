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
