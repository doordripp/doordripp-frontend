import React, { useEffect, useRef, useState } from 'react';
import './DeliveryZoneMapDrawer.css';

/**
 * DeliveryZoneMapDrawer Component
 * Admin interface for drawing and editing delivery zones using Google Maps Drawing Tools
 */
const DeliveryZoneMapDrawer = ({ 
  onZoneSave, 
  existingZone = null,
  defaultCenter = { lat: 28.6139, lng: 77.2090 },
  defaultZoom = 13
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const currentShapeRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [zoneData, setZoneData] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);

  /**
   * Initialize Google Map with Drawing Manager
   */
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.drawing) {
      console.warn('Google Maps or Drawing library not loaded yet');
      return;
    }
    
    if (!mapRef.current) {
      console.warn('Map container ref not ready');
      return;
    }

    // Create map instance
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Initialize Drawing Manager
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.CIRCLE,
        ],
      },
      polygonOptions: {
        fillColor: '#FF6B35',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#FF6B35',
        editable: true,
        draggable: true,
      },
      circleOptions: {
        fillColor: '#4ECDC4',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#4ECDC4',
        editable: true,
        draggable: true,
      },
    });

    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    // Listen for shape completion
    window.google.maps.event.addListener(
      drawingManager,
      'overlaycomplete',
      handleOverlayComplete
    );

    // Load existing zone if provided
    if (existingZone) {
      loadExistingZone(map, existingZone);
    }

    return () => {
      if (drawingManager) {
        window.google.maps.event.clearInstanceListeners(drawingManager);
        drawingManager.setMap(null);
      }
    };
  }, []);

  /**
   * Handle shape drawing completion
   */
  const handleOverlayComplete = (event) => {
    setIsDrawing(false);

    // Remove previous shape if exists
    if (currentShapeRef.current) {
      currentShapeRef.current.setMap(null);
    }

    const shape = event.overlay;
    currentShapeRef.current = shape;

    // Disable drawing mode after completing a shape
    drawingManagerRef.current.setDrawingMode(null);

    // Extract zone data based on type
    if (event.type === window.google.maps.drawing.OverlayType.POLYGON) {
      handlePolygonComplete(shape);
    } else if (event.type === window.google.maps.drawing.OverlayType.CIRCLE) {
      handleCircleComplete(shape);
    }
  };

  /**
   * Handle polygon completion
   */
  const handlePolygonComplete = (polygon) => {
    const path = polygon.getPath();
    const coordinates = [];

    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      coordinates.push({
        lat: latLng.lat(),
        lng: latLng.lng(),
      });
    }

    const data = {
      type: 'polygon',
      polygon: coordinates,
      center: null,
      radiusKm: null,
    };

    setZoneData(data);
    setDrawingMode('polygon');

    // Add listeners for editing
    window.google.maps.event.addListener(path, 'set_at', () => {
      handlePolygonComplete(polygon);
    });

    window.google.maps.event.addListener(path, 'insert_at', () => {
      handlePolygonComplete(polygon);
    });
  };

  /**
   * Handle circle completion
   */
  const handleCircleComplete = (circle) => {
    const center = circle.getCenter();
    const radius = circle.getRadius(); // in meters

    const data = {
      type: 'radius',
      polygon: null,
      center: {
        lat: center.lat(),
        lng: center.lng(),
      },
      radiusKm: (radius / 1000).toFixed(2), // Convert to km
    };

    setZoneData(data);
    setDrawingMode('radius');

    // Add listeners for editing
    window.google.maps.event.addListener(circle, 'center_changed', () => {
      handleCircleComplete(circle);
    });

    window.google.maps.event.addListener(circle, 'radius_changed', () => {
      handleCircleComplete(circle);
    });
  };

  /**
   * Load existing zone on map
   */
  const loadExistingZone = (map, zone) => {
    if (zone.type === 'polygon' && zone.polygon && zone.polygon.length >= 3) {
      const polygonCoords = zone.polygon.map(p => ({
        lat: p.lat,
        lng: p.lng
      }));

      const polygon = new window.google.maps.Polygon({
        paths: polygonCoords,
        fillColor: '#FF6B35',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#FF6B35',
        editable: true,
        draggable: true,
        map: map,
      });

      currentShapeRef.current = polygon;
      handlePolygonComplete(polygon);

      // Fit map to polygon bounds
      const bounds = new window.google.maps.LatLngBounds();
      polygonCoords.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds);

    } else if (zone.type === 'radius' && zone.center && zone.radiusKm) {
      const circle = new window.google.maps.Circle({
        center: zone.center,
        radius: zone.radiusKm * 1000, // Convert km to meters
        fillColor: '#4ECDC4',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#4ECDC4',
        editable: true,
        draggable: true,
        map: map,
      });

      currentShapeRef.current = circle;
      handleCircleComplete(circle);

      // Center map on circle
      map.setCenter(zone.center);
      map.fitBounds(circle.getBounds());
    }
  };

  /**
   * Clear current drawing
   */
  const handleClearDrawing = () => {
    if (currentShapeRef.current) {
      currentShapeRef.current.setMap(null);
      currentShapeRef.current = null;
    }
    setZoneData(null);
    setDrawingMode(null);
    drawingManagerRef.current.setDrawingMode(null);
  };

  /**
   * Save zone data
   */
  const handleSaveZone = () => {
    if (!zoneData) {
      alert('Please draw a zone first');
      return;
    }

    if (onZoneSave) {
      onZoneSave(zoneData);
    }
  };

  /**
   * Get zone info display
   */
  const getZoneInfo = () => {
    if (!zoneData) return null;

    if (zoneData.type === 'polygon') {
      return (
        <div className="zone-info polygon-info">
          <div className="info-header">
            <span className="info-icon">📐</span>
            <span className="info-title">Polygon Zone</span>
          </div>
          <div className="info-details">
            <p><strong>Points:</strong> {zoneData.polygon.length}</p>
            <p className="info-hint">Drag points to adjust area</p>
          </div>
        </div>
      );
    }

    if (zoneData.type === 'radius') {
      return (
        <div className="zone-info radius-info">
          <div className="info-header">
            <span className="info-icon">⭕</span>
            <span className="info-title">Radius Zone</span>
          </div>
          <div className="info-details">
            <p><strong>Center:</strong> {zoneData.center.lat.toFixed(4)}, {zoneData.center.lng.toFixed(4)}</p>
            <p><strong>Radius:</strong> {zoneData.radiusKm} km</p>
            <p className="info-hint">Drag circle or edges to adjust</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="delivery-zone-map-drawer">
      {/* Map Container */}
      <div ref={mapRef} className="map-canvas"></div>

      {/* Control Panel */}
      <div className="map-controls-panel">
        <div className="controls-header">
          <h3>🗺️ Draw Delivery Zone</h3>
          <p className="controls-hint">
            Use the drawing tools above the map to create polygon or circle zones
          </p>
        </div>

        {/* Zone Information */}
        {getZoneInfo()}

        {/* Action Buttons */}
        <div className="controls-actions">
          <button
            className="btn btn-primary"
            onClick={handleSaveZone}
            disabled={!zoneData}
          >
            💾 Save Zone
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleClearDrawing}
            disabled={!zoneData}
          >
            🗑️ Clear Drawing
          </button>
        </div>

        {/* Instructions */}
        <div className="controls-instructions">
          <h4>📋 Instructions:</h4>
          <ol>
            <li>Select <strong>Polygon</strong> or <strong>Circle</strong> from drawing tools</li>
            <li>Click on map to draw your delivery zone</li>
            <li>Drag points/edges to adjust the shape</li>
            <li>Click <strong>Save Zone</strong> to persist</li>
          </ol>
          <div className="tip-box">
            <strong>💡 Tip:</strong> Only one zone can be active at a time. Drawing a new zone will replace the previous one.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryZoneMapDrawer;
