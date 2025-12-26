import React, { useEffect, useRef, useState, useCallback } from 'react';
import { validateWithGoogleMaps } from '../utils/deliveryZoneUtils';
import { toast } from 'react-hot-toast';
import './AddressSelector.css';

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
 */
const AddressSelector = ({ 
  onAddressSelect, 
  onClose,
  initialLocation = null 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);

  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isInDeliveryZone, setIsInDeliveryZone] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [addressFields, setAddressFields] = useState({ line1: '', line2: '', city: '', state: '', zip: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  // Default center (you can change this to your city)
  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi

  /**
   * Load delivery zones from backend
   */
  useEffect(() => {
    const loadDeliveryZones = async () => {
      try {
        const response = await fetch('/api/delivery-settings');
        const data = await response.json();
        
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
   * Initialize Google Map
   */
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const center = selectedLocation || defaultCenter;

    // Create map
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Create draggable marker
    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: 'Drag to adjust location'
    });

    markerRef.current = marker;

    // Initialize autocomplete
    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          fields: ['formatted_address', 'geometry', 'name'],
          componentRestrictions: { country: 'in' } // Restrict to India
        }
      );

      autocomplete.bindTo('bounds', map);
      autocompleteRef.current = autocomplete;

      // Handle place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          toast.error('No details available for the selected place');
          return;
        }

        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        map.setCenter(location);
        map.setZoom(15);
        marker.setPosition(location);
        handleLocationChange(location);
      });
    }

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      const location = {
        lat: position.lat(),
        lng: position.lng()
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
      
      marker.setPosition(location);
      handleLocationChange(location);
    });

    // Initial validation if location provided
    if (selectedLocation) {
      handleLocationChange(selectedLocation);
    }

    setIsLoading(false);

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

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
        const response = await fetch('/api/validate-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: location.lat, longitude: location.lng })
        });

        if (response.ok) {
          const data = await response.json();
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
          markerRef.current.setPosition(location);
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

      const response = await fetch('/api/save-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          formattedAddress,
          label: 'Home'
        })
      });

      const data = await response.json();
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

  return (
    <div className="address-selector-overlay">
      <div className="address-selector-container">
        {/* Header */}
        <div className="address-selector-header">
          <h2>Select Delivery Address</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {/* Search Box */}
        <div className="address-search-box">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for your address..."
            className="address-search-input"
          />
          <button
            className="current-location-button"
            onClick={handleGetCurrentLocation}
            title="Use current location"
          >
            📍 Current Location
          </button>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <div ref={mapRef} className="google-map"></div>
          {isLoading && (
            <div className="map-loader">
              <div className="spinner"></div>
              <p>Loading map...</p>
            </div>
          )}
        </div>

        {/* Address Display */}
        {formattedAddress && (
          <div className={`address-display ${isInDeliveryZone ? 'in-zone' : 'out-zone'}`}>
            <div className="address-icon">
              {isInDeliveryZone ? '✅' : '📍'}
            </div>
            <div className="address-details">
              <p className="address-text">{formattedAddress}</p>
              {currentZone && (
                <p className="zone-info">
                  {currentZone.name} • 
                  {currentZone.deliveryFee > 0 
                    ? ` ₹${currentZone.deliveryFee} delivery` 
                    : ' Free delivery'}
                  {currentZone.estimatedDeliveryTime && 
                    ` • ${currentZone.estimatedDeliveryTime} mins`
                  }
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
            {isValidating ? 'Validating...' : 'Confirm Address'}
          </button>
          
          {!isInDeliveryZone && selectedLocation && (
            <p className="out-zone-message">
              🚀 We are coming soon in your area! 
              <br />
              Please select a location within our delivery zone.
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="address-instructions">
          <p>💡 Tip: Drag the marker or search for your exact location</p>
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
