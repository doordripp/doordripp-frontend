import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLoadScript, StandaloneSearchBox } from '@react-google-maps/api';
import { validateWithGoogleMaps } from '../utils/deliveryZoneUtils';
import { apiGet, apiPost } from '../services/apiClient';
import { toast } from 'react-hot-toast';
import './AddressSelector.css';

const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry', 'drawing', 'marker'];

// Extract common address fields from a Google geocoder result
const extractAddressFields = (result) => {
  const components = result?.address_components || [];
  const pick = (type) => {
    const part = components.find((c) => c.types.includes(type));
    return part ? part.long_name : '';
  };

  const streetNumber = pick('street_number');
  const route = pick('route');
  const city = pick('locality') || pick('sublocality_level_1') || pick('administrative_area_level_2');
  const state = pick('administrative_area_level_1');
  const zip = pick('postal_code');

  const line1 = [streetNumber, route].filter(Boolean).join(' ').trim() || result?.formatted_address || '';

  return {
    line1,
    line2: '',
    city,
    state,
    zip
  };
};

/**
 * AddressSelector Component
 * Complete address selection with Google Maps, autocomplete, and delivery zone validation
 * Uses modern Google Maps APIs: AdvancedMarkerElement and Places API
 */
const AddressSelector = ({ 
  onAddressSelect, 
  onClose,
  initialLocation = null 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);

  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isInDeliveryZone, setIsInDeliveryZone] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [addressFields, setAddressFields] = useState({ line1: '', line2: '', city: '', state: '', zip: '' });
  const [isValidating, setIsValidating] = useState(false);

  // Default center (you can change this to your city)
  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi

  // Load Google Maps with proper async/defer handling and React 19 compatibility
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
    preventGoogleFontsLoading: true,
    id: 'google-maps-address-selector',
  });

  /**
   * Load delivery zones from backend
   */
  useEffect(() => {
    const loadDeliveryZones = async () => {
      try {
        const data = await apiGet('/delivery-settings');
        
        if (data.success) {
          setDeliveryZones(data.zones);
        }
      } catch (error) {
        console.error('Error loading delivery zones:', error);
        toast.error('Failed to load delivery settings');
      }
    };

    loadDeliveryZones();
  }, []);

  /**
   * Initialize Google Map with AdvancedMarkerElement
   */
  useEffect(() => {
    if (!isLoaded || !window.google || !mapRef.current) return;

    const center = selectedLocation || defaultCenter;

    // Create map with Map ID (required for AdvancedMarkerElement)
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      mapId: 'DOORDRIPP_MAP', // Required for AdvancedMarkerElement
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Create draggable marker using modern AdvancedMarkerElement
    // Note: AdvancedMarkerElement requires google.maps.marker namespace
    const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
    
    // Create custom pin with better styling
    const pin = new PinElement({
      background: '#000000',
      borderColor: '#ffffff',
      glyphColor: '#ffffff',
      scale: 1.2,
    });

    const marker = new AdvancedMarkerElement({
      map,
      position: center,
      gmpDraggable: true,
      title: 'Drag to adjust location',
      content: pin.element,
    });

    markerRef.current = marker;

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.position;
      const location = {
        lat: position.lat,
        lng: position.lng
      };
      
      map.panTo(location);
      handleLocationChange(location);
    });

    // Handle map click
    map.addListener('click', (event) => {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      
      marker.position = location;
      handleLocationChange(location);
    });

    // Initial validation if location provided
    if (selectedLocation) {
      handleLocationChange(selectedLocation);
    }

    // Cleanup
    return () => {
      if (marker) {
        marker.map = null;
      }
    };
  }, [isLoaded]);

  /**
   * Handle places selection from search box
   */
  const handlePlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    
    if (!place.geometry || !place.geometry.location) {
      toast.error('No details available for the selected place');
      return;
    }

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(15);
      markerRef.current.position = location;
    }

    handleLocationChange(location);
  };

  /**
   * Handle location change (from marker drag, map click, or autocomplete)
   */
  const handleLocationChange = useCallback(async (location) => {
    setSelectedLocation(location);
    setIsValidating(true);

    try {
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setFormattedAddress(results[0].formatted_address);
          setAddressFields(extractAddressFields(results[0]));
        }
      });

      // Client-side validation (fast)
      const localValidation = validateWithGoogleMaps(
        location,
        deliveryZones,
        window.google
      );

      let finalIsInZone = localValidation.isInZone;
      let finalZone = localValidation.zone;

      // Server-side validation (authoritative)
      try {
        const data = await apiPost('/validate-location', { 
          latitude: location.lat, 
          longitude: location.lng 
        });

        if (data) {
          if (data?.success) {
            finalIsInZone = !!data.isInDeliveryZone;
            finalZone = data.zone || finalZone;
          }
        }
      } catch (serverErr) {
        console.warn('Delivery zone server validation failed, using local result', serverErr);
      }

      setIsInDeliveryZone(finalIsInZone);
      setCurrentZone(finalZone);

      // Only show out-of-zone warning if we actually have zones to validate against
      const hasZones = Array.isArray(deliveryZones) && deliveryZones.length > 0;
      if (!finalIsInZone && hasZones) {
        toast('🚀 We are coming soon in your area!', {
          icon: '📍',
          duration: 4000,
          style: {
            background: '#FFF3CD',
            color: '#856404',
            border: '1px solid #FFEAA7'
          }
        });
      } else if (finalIsInZone) {
        toast.success('✅ This location is in our delivery area!');
      }
    } catch (error) {
      console.error('Error validating location:', error);
      toast.error('Failed to validate location');
    } finally {
      setIsValidating(false);
    }
  }, [deliveryZones]);

  /**
   * Get current location using browser geolocation
   */
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    // Browser blocks geolocation on non-secure origins (except localhost)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isSecure = window.location.protocol === 'https:';
    if (!isSecure && !isLocalhost) {
      toast.error('Enable HTTPS to use current location, or search manually.');
      return;
    }

    toast.loading('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss();
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
          markerRef.current.position = location;
        }

        handleLocationChange(location);
        toast.success('Location detected!');
      },
      (error) => {
        toast.dismiss();
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please search manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Confirm and save address
   */
  const handleConfirmAddress = async () => {
    if (!isInDeliveryZone) {
      toast.error('Please select a location within our delivery area');
      return;
    }

    if (!selectedLocation || !formattedAddress) {
      toast.error('Please select a valid address');
      return;
    }

    try {
      toast.loading('Saving address...');

      const data = await apiPost('/save-address', {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        formattedAddress,
        addressLine1: addressFields.line1,
        addressLine2: addressFields.line2,
        city: addressFields.city,
        state: addressFields.state,
        postalCode: addressFields.zip,
        label: 'Home'
      });

      toast.dismiss();

      if (data.success) {
        toast.success('Address saved successfully!');
        if (onAddressSelect) {
          onAddressSelect({
            location: selectedLocation,
            formattedAddress,
            line1: addressFields.line1 || formattedAddress,
            line2: addressFields.line2 || '',
            city: addressFields.city || '',
            state: addressFields.state || '',
            zip: addressFields.zip || '',
            zone: currentZone,
            addressId: data.address.id
          });
        }
        if (onClose) {
          onClose();
        }
      } else {
        toast.error(data.message || 'Failed to save address');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error saving address:', error);
      toast.error('Failed to save address. Please try again.');
    }
  };

  // Handle loading and error states
  if (loadError) {
    return (
      <div className="address-selector-overlay">
        <div className="address-selector-container">
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">Error loading Google Maps</p>
            <button onClick={onClose} className="confirm-button">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="address-selector-overlay">
        <div className="address-selector-container">
          <div className="map-loader">
            <div className="spinner"></div>
            <p className="loader-text">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="address-selector-overlay">
      <div className="address-selector-container">
        {/* Header */}
        <div className="address-selector-header">
          <div>
            <h2>Select Delivery Address</h2>
            <p className="header-subtitle">Choose your location for accurate delivery</p>
          </div>
          {onClose && (
            <button className="close-button" onClick={onClose} aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Box with StandaloneSearchBox */}
        <div className="address-search-box">
          <StandaloneSearchBox
            onLoad={ref => searchBoxRef.current = ref}
            onPlacesChanged={handlePlacesChanged}
            options={{
              componentRestrictions: { country: 'in' }
            }}
          >
            <div className="search-input-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for your address..."
                className="address-search-input"
              />
            </div>
          </StandaloneSearchBox>
          <button
            className="current-location-button"
            onClick={handleGetCurrentLocation}
            title="Use current location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Current Location</span>
          </button>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <div ref={mapRef} className="google-map"></div>
          {isValidating && (
            <div className="validating-overlay">
              <div className="validating-badge">
                <div className="pulse-dot"></div>
                <span>Validating location...</span>
              </div>
            </div>
          )}
        </div>

        {/* Address Display */}
        {formattedAddress && (
          <div className={`address-display ${isInDeliveryZone ? 'in-zone' : 'out-zone'}`}>
            <div className="address-icon">
              {isInDeliveryZone ? (
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <div className="address-details">
              <p className="address-text">{formattedAddress}</p>
              {currentZone && isInDeliveryZone && (
                <div className="zone-info">
                  <span className="zone-badge">{currentZone.name}</span>
                  <span className="zone-divider">•</span>
                  <span className="delivery-fee">
                    {currentZone.deliveryFee > 0 
                      ? `₹${currentZone.deliveryFee} delivery` 
                      : 'Free delivery'}
                  </span>
                  {currentZone.estimatedDeliveryTime && (
                    <>
                      <span className="zone-divider">•</span>
                      <span className="delivery-time">{currentZone.estimatedDeliveryTime} mins</span>
                    </>
                  )}
                </div>
              )}
              {!isInDeliveryZone && selectedLocation && (
                <p className="out-zone-text">
                  We're not delivering here yet, but we're expanding soon!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="address-selector-actions">
          <button
            className={`confirm-button ${!isInDeliveryZone || isValidating ? 'disabled' : ''}`}
            onClick={handleConfirmAddress}
            disabled={!isInDeliveryZone || isValidating}
          >
            {isValidating ? (
              <>
                <div className="button-spinner"></div>
                <span>Validating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Confirm Address</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="address-instructions">
          <svg className="instruction-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Drag the marker or search for your exact location</p>
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
