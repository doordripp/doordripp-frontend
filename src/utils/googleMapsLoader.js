/**
 * Google Maps API Loader
 * Dynamically loads Google Maps JavaScript API with required libraries
 */

let isLoading = false;
let isLoaded = false;
const callbacks = [];

/**
 * Load Google Maps API
 * @param {string} apiKey - Your Google Maps API key
 * @param {Array} libraries - Array of library names (default: ['places', 'geometry', 'drawing'])
 * @returns {Promise} - Resolves when Google Maps is loaded
 */
export function loadGoogleMaps(apiKey, libraries = ['places', 'geometry', 'drawing']) {
  // Return existing promise if already loaded
  if (isLoaded) {
    return Promise.resolve(window.google);
  }

  // Return promise that will resolve when loading completes
  if (isLoading) {
    return new Promise((resolve, reject) => {
      callbacks.push({ resolve, reject });
    });
  }

  // Start loading
  isLoading = true;

  return new Promise((resolve, reject) => {
    callbacks.push({ resolve, reject });

    // Check if API key is provided
    if (!apiKey) {
      const error = new Error('Google Maps API key is required');
      callbacks.forEach(cb => cb.reject(error));
      callbacks.length = 0;
      isLoading = false;
      return;
    }

    // Create callback function name
    const callbackName = 'googleMapsCallback';
    
    // Define global callback
    window[callbackName] = () => {
      isLoaded = true;
      isLoading = false;
      
      // Resolve all pending promises
      callbacks.forEach(cb => cb.resolve(window.google));
      callbacks.length = 0;
      
      // Clean up
      delete window[callbackName];
    };

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    // Handle errors
    script.onerror = () => {
      const error = new Error('Failed to load Google Maps API');
      callbacks.forEach(cb => cb.reject(error));
      callbacks.length = 0;
      isLoading = false;
      delete window[callbackName];
    };

    // Append script to document
    document.head.appendChild(script);
  });
}

/**
 * Check if Google Maps API is loaded
 * @returns {boolean}
 */
export function isGoogleMapsLoaded() {
  return isLoaded && window.google && window.google.maps;
}

/**
 * Get Google Maps object (returns null if not loaded)
 * @returns {Object|null}
 */
export function getGoogleMaps() {
  return isGoogleMapsLoaded() ? window.google : null;
}

export default {
  loadGoogleMaps,
  isGoogleMapsLoaded,
  getGoogleMaps
};
