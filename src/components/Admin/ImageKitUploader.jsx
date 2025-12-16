import { useState } from 'react';
import { IKContext, IKUpload, IKImage } from 'imagekitio-react';
import { imagekitConfig, isImageKitConfigured } from '../../config/imagekit';
import { X, Upload, AlertCircle } from 'lucide-react';

const ImageKitUploader = ({ onUploadComplete, existingImages = [] }) => {
  const [uploadedImages, setUploadedImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (res) => {
    const imageUrl = res.url;
    const newImages = [...uploadedImages, imageUrl];
    setUploadedImages(newImages);
    setUploading(false);
    setError(null);
    
    if (onUploadComplete) {
      onUploadComplete(newImages);
    }
  };

  const handleUploadError = (err) => {
    console.error('Upload error:', err);
    setError(err.message || 'Upload failed. Please try again.');
    setUploading(false);
  };

  const handleUploadStart = () => {
    setUploading(true);
    setError(null);
  };

  const removeImage = (indexToRemove) => {
    const newImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(newImages);
    
    if (onUploadComplete) {
      onUploadComplete(newImages);
    }
  };

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return false;
    }

    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return false;
    }

    return true;
  };

  // Authenticator function for ImageKit
  const authenticator = async () => {
    try {
      const response = await fetch(imagekitConfig.authenticationEndpoint);
      
      if (!response.ok) {
        throw new Error('Failed to get authentication token');
      }

      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  // Show setup instructions if ImageKit is not configured
  if (!isImageKitConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              ImageKit Not Configured
            </h3>
            <p className="text-sm text-yellow-800 mb-4">
              Please set up your ImageKit credentials to enable image uploads.
            </p>
            <div className="bg-white rounded p-4 text-sm space-y-2">
              <p className="font-semibold text-gray-900">Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Go to <a href="https://imagekit.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">imagekit.io</a> and create a free account</li>
                <li>Get your Public Key and URL Endpoint from Developer Options</li>
                <li>Add these to your <code className="bg-gray-100 px-1 rounded">.env</code> file:
                  <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
{`VITE_IMAGEKIT_PUBLIC_KEY=your_public_key_here
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id`}
                  </pre>
                </li>
                <li>Restart your development server</li>
              </ol>
              <p className="text-xs text-gray-600 mt-3">
                See <code>IMAGEKIT-SETUP.md</code> for detailed instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <IKContext
        publicKey={imagekitConfig.publicKey}
        urlEndpoint={imagekitConfig.urlEndpoint}
        authenticator={authenticator}
      >
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <IKUpload
            fileName="product-image.jpg"
            folder="/products"
            onError={handleUploadError}
            onSuccess={handleUploadSuccess}
            onUploadStart={handleUploadStart}
            validateFile={validateFile}
            className="hidden"
            id="imagekit-upload"
          />
          
          <label
            htmlFor="imagekit-upload"
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </label>

          <p className="text-sm text-gray-500 mt-2">
            Max file size: 5MB • Formats: JPG, PNG, WebP
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Upload Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Uploaded Images ({uploadedImages.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <IKImage
                    path={imageUrl}
                    transformation={[{
                      height: 200,
                      width: 200,
                      crop: 'at_max',
                      quality: 80,
                    }]}
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </IKContext>
    </div>
  );
};

export default ImageKitUploader;
