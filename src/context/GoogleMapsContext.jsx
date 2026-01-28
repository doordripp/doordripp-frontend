import React, { createContext, useContext } from 'react';
import { LoadScript } from '@react-google-maps/api';

const GoogleMapsContext = createContext(null);

const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry', 'drawing', 'marker'];

/**
 * Google Maps Provider
 * Loads Google Maps API once for the entire app
 * Prevents duplicate script loading and handles async/defer automatically
 */
export function GoogleMapsProvider({ children }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
    return children;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={<div>Loading Maps...</div>}
      preventGoogleFontsLoading={true}
      // Prevents duplicate loading in React StrictMode
      id="google-maps-script"
    >
      <GoogleMapsContext.Provider value={{ isLoaded: true }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
}

/**
 * Hook to access Google Maps loading state
 */
export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  return context || { isLoaded: false };
}

export default GoogleMapsContext;
