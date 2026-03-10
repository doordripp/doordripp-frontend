/**
 * Proof of Delivery Upload Component
 * Allows delivery partner to upload photo proof when marking order as delivered
 */

import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProofOfDelivery.css';

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const API_URL = import.meta.env.VITE_API_URL || runtimeOrigin;

const ProofOfDelivery = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const capturePhoto = () => {
    // Trigger file input with camera capture on mobile
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select or capture a photo');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('signature', signature);
      formData.append('notes', notes);

      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/delivery/orders/${orderId}/proof`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.ok) {
        alert('✅ Proof of delivery uploaded successfully!');
        navigate('/delivery/orders');
      }
    } catch (err) {
      console.error('Error uploading proof:', err);
      setError(err.response?.data?.error || 'Failed to upload proof of delivery');
    } finally {
      setUploading(false);
    }
  };

  const clearPhoto = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="proof-of-delivery">
      <div className="proof-header">
        <button onClick={() => navigate(`/delivery/track/${orderId}`)} className="btn-back">
          ← Back
        </button>
        <h1>Proof of Delivery</h1>
      </div>

      <div className="proof-container">
        <form onSubmit={handleSubmit} className="proof-form">
          {/* Photo Upload Section */}
          <div className="photo-section">
            <h3>📸 Delivery Photo</h3>
            <p className="section-description">
              Take a clear photo of the delivered package or customer receiving the order
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {!previewUrl ? (
              <div className="photo-upload-area">
                <div className="upload-placeholder">
                  <span className="camera-icon">📷</span>
                  <p>No photo selected</p>
                  <div className="upload-buttons">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="btn-capture"
                    >
                      📸 Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-upload"
                    >
                      📁 Upload from Gallery
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="photo-preview-area">
                <img src={previewUrl} alt="Delivery proof" className="preview-image" />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="btn-clear-photo"
                >
                  ✕ Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Customer Signature (Optional) */}
          <div className="form-section">
            <label htmlFor="signature">
              ✍️ Customer Name / Signature (Optional)
            </label>
            <input
              type="text"
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter customer name or signature"
              className="form-input"
            />
          </div>

          {/* Delivery Notes */}
          <div className="form-section">
            <label htmlFor="notes">📝 Delivery Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about the delivery..."
              className="form-textarea"
              rows="4"
            />
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="btn-submit"
          >
            {uploading ? (
              <>
                <span className="spinner"></span> Uploading...
              </>
            ) : (
              '✅ Complete Delivery'
            )}
          </button>
        </form>

        {/* Info Card */}
        <div className="info-card">
          <h4>📋 Guidelines</h4>
          <ul>
            <li>✅ Take a clear, well-lit photo</li>
            <li>✅ Include the package or delivery location</li>
            <li>✅ Ensure photo is not blurry</li>
            <li>✅ File size should be less than 5MB</li>
            <li>✅ Accepted formats: JPG, PNG, WEBP</li>
          </ul>

          <div className="info-note">
            <strong>Note:</strong> Once submitted, the order will be marked as
            delivered and cannot be changed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofOfDelivery;
