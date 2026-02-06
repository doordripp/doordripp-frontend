import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiGet, apiPut, apiDelete } from '../services/apiClient';
import './AddressList.css';

/**
 * AddressList Component
 * Display and manage user's saved addresses
 */
const AddressList = ({ onSelectAddress, onEditAddress }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await apiGet('/addresses');

      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const data = await apiPut(`/addresses/${addressId}/set-default`, {});

      if (data.success) {
        toast.success('Default address updated');
        loadAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const data = await apiDelete(`/addresses/${addressId}`);

      if (data.success) {
        toast.success('Address deleted');
        loadAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  if (isLoading) {
    return (
      <div className="address-list-loader">
        <div className="spinner"></div>
        <p>Loading addresses...</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="address-list-empty">
        <div className="empty-icon">📍</div>
        <h3>No saved addresses</h3>
        <p>Add your first delivery address to get started</p>
      </div>
    );
  }

  return (
    <div className="address-list">
      {addresses.map((address) => (
        <div 
          key={address._id} 
          className={`address-card ${address.isDefault ? 'default' : ''}`}
          onClick={() => onSelectAddress && onSelectAddress(address)}
        >
          <div className="address-card-header">
            <div className="address-label">
              <span className="label-icon">
                {address.label === 'Home' ? '🏠' : 
                 address.label === 'Work' ? '💼' : '📍'}
              </span>
              <span className="label-text">{address.label}</span>
            </div>
            {address.isDefault && (
              <span className="default-badge">Default</span>
            )}
          </div>

          <div className="address-card-body">
            <p className="address-formatted">{address.formattedAddress}</p>
            
            {address.deliveryInstructions && (
              <p className="delivery-instructions">
                📝 {address.deliveryInstructions}
              </p>
            )}

            {address.contactPhone && (
              <p className="contact-info">
                📞 {address.contactPhone}
              </p>
            )}

            {address.deliveryZoneId && (
              <div className="zone-badge verified">
                ✅ Verified delivery location
              </div>
            )}
            
            {!address.isVerified && (
              <div className="zone-badge unverified">
                ⚠️ Outside current delivery zones
              </div>
            )}
          </div>

          <div className="address-card-actions">
            {!address.isDefault && (
              <button
                className="action-btn set-default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetDefault(address._id);
                }}
              >
                Set as Default
              </button>
            )}
            
            <button
              className="action-btn edit"
              onClick={(e) => {
                e.stopPropagation();
                onEditAddress && onEditAddress(address);
              }}
            >
              Edit
            </button>
            
            <button
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAddress(address._id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;
