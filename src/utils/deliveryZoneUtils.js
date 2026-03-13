/**
 * Delivery Zone Validation Utilities
 * Helper functions for validating locations against delivery zones
 */

/**
 * Check if a point is inside a polygon using ray-casting algorithm
 * @param {Object} point - {lat: number, lng: number}
 * @param {Array} polygon - Array of {lat: number, lng: number} objects
 * @returns {boolean} - True if point is inside polygon
 */
export function isInsidePolygon(point, polygon) {
  if (!point || !polygon || polygon.length < 3) {
    return false;
  }

  let inside = false;
  const x = point.lat;
  const y = point.lng;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Check if a point is inside a radius using Haversine formula
 * @param {Object} point - {lat: number, lng: number}
 * @param {Object} center - {lat: number, lng: number}
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} - True if point is inside radius
 */
export function isInsideRadius(point, center, radiusKm) {
  if (!point || !center || radiusKm <= 0) {
    return false;
  }

  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} point1 - {lat: number, lng: number}
 * @param {Object} point2 - {lat: number, lng: number}
 * @returns {number} - Distance in kilometers
 */
export function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} - Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Validate if a location is inside any delivery zone
 * @param {Object} point - {lat: number, lng: number}
 * @param {Array} zones - Array of delivery zone objects
 * @returns {Object} - {isInZone: boolean, zone: object|null}
 */
export function validateDeliveryLocation(point, zones) {
  if (!point || !zones || zones.length === 0) {
    return { isInZone: false, zone: null };
  }

  for (const zone of zones) {
    if (!zone.isActive) continue;

    let isInZone = false;

    if (zone.type === 'polygon' && zone.polygon && zone.polygon.length >= 3) {
      isInZone = isInsidePolygon(point, zone.polygon);
    } else if (zone.type === 'radius' && zone.center && zone.radiusKm > 0) {
      isInZone = isInsideRadius(point, zone.center, zone.radiusKm);
    }

    if (isInZone) {
      return { isInZone: true, zone };
    }
  }

  return { isInZone: false, zone: null };
}

/**
 * Validate using Google Maps API geometry library (if available)
 * This is more accurate than the custom implementation
 * @param {Object} point - {lat: number, lng: number}
 * @param {Array} zones - Array of delivery zone objects
 * @param {Object} google - Google Maps API object
 * @returns {Object} - {isInZone: boolean, zone: object|null}
 */
export function validateWithGoogleMaps(point, zones, google) {
  if (!google || !google.maps || !google.maps.geometry) {
    // Fallback to custom implementation
    return validateDeliveryLocation(point, zones);
  }

  const latLng = new google.maps.LatLng(point.lat, point.lng);

  for (const zone of zones) {
    if (!zone.isActive) continue;

    let isInZone = false;

    if (zone.type === 'polygon' && zone.polygon && zone.polygon.length >= 3) {
      // Create Google Maps Polygon
      const polygonCoords = zone.polygon.map(p => 
        new google.maps.LatLng(p.lat, p.lng)
      );
      
      // Check if point is inside polygon
      isInZone = google.maps.geometry.poly.containsLocation(
        latLng,
        new google.maps.Polygon({ paths: polygonCoords })
      );
    } else if (zone.type === 'radius' && zone.center && zone.radiusKm > 0) {
      // Check if point is inside radius
      const centerLatLng = new google.maps.LatLng(zone.center.lat, zone.center.lng);
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        latLng,
        centerLatLng
      );
      
      // Convert meters to kilometers and compare
      isInZone = (distance / 1000) <= zone.radiusKm;
    }

    if (isInZone) {
      return { isInZone: true, zone };
    }
  }

  return { isInZone: false, zone: null };
}

/**
 * Format delivery zone for display
 * @param {Object} zone - Delivery zone object
 * @returns {string} - Formatted zone description
 */
export function formatZoneDescription(zone) {
  if (!zone) return '';

  const parts = [zone.name];

  if (zone.deliveryFee > 0) {
    parts.push(`₹${zone.deliveryFee} delivery fee`);
  } else {
    parts.push('Free delivery');
  }

  if (zone.minOrderValue > 0) {
    parts.push(`Min order: ₹${zone.minOrderValue}`);
  }

  if (zone.estimatedDeliveryTime) {
    parts.push(`${zone.estimatedDeliveryTime} mins`);
  }

  return parts.join(' • ');
}

/**
 * Get the closest delivery zone to a point (even if outside all zones)
 * Useful for showing "nearest zone" information
 * @param {Object} point - {lat: number, lng: number}
 * @param {Array} zones - Array of delivery zone objects
 * @returns {Object|null} - Closest zone object
 */
export function getClosestZone(point, zones) {
  if (!point || !zones || zones.length === 0) {
    return null;
  }

  let closestZone = null;
  let minDistance = Infinity;

  for (const zone of zones) {
    if (!zone.isActive) continue;

    let distance;

    if (zone.type === 'radius' && zone.center) {
      distance = calculateDistance(point, zone.center);
    } else if (zone.type === 'polygon' && zone.polygon && zone.polygon.length > 0) {
      // For polygon, calculate distance to polygon center
      const center = getPolygonCenter(zone.polygon);
      distance = calculateDistance(point, center);
    } else {
      continue;
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestZone = zone;
    }
  }

  return closestZone;
}

/**
 * Calculate the center point of a polygon
 * @param {Array} polygon - Array of {lat: number, lng: number} objects
 * @returns {Object} - {lat: number, lng: number}
 */
function getPolygonCenter(polygon) {
  if (!polygon || polygon.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let latSum = 0;
  let lngSum = 0;

  for (const point of polygon) {
    latSum += point.lat;
    lngSum += point.lng;
  }

  return {
    lat: latSum / polygon.length,
    lng: lngSum / polygon.length
  };
}

export default {
  isInsidePolygon,
  isInsideRadius,
  calculateDistance,
  validateDeliveryLocation,
  validateWithGoogleMaps,
  formatZoneDescription,
  getClosestZone
};
