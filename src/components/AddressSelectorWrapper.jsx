import React, { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load the AddressSelector to handle potential Google Maps loading issues
const AddressSelector = React.lazy(() => import('./AddressSelector'));

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="address-selector-overlay">
      <div className="address-selector-container">
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">
            {error?.message || 'Unable to load the address selector'}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={resetErrorBoundary}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="address-selector-overlay">
      <div className="address-selector-container">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading address selector...</p>
        </div>
      </div>
    </div>
  );
}

export default function AddressSelectorWrapper(props) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <ErrorBoundary
      key={resetKey}
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Increment key to remount the component tree without a full page reload
        setResetKey(prev => prev + 1);
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <AddressSelector {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}