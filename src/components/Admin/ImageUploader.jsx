// src/components/Admin/ImageUploader.jsx
import React, { useState, useEffect, useRef } from "react";

export default function ImageUploader({ value = [], onChange }) {
  const [files, setFiles] = useState([]); // File[] when user selects files
  const [previewUrls, setPreviewUrls] = useState(Array.isArray(value) ? value : []); // string[] (object URLs or external URLs)
  const createdUrlsRef = useRef([]); // track object URLs we created so we can revoke them

  // Sync when parent `value` changes (treat as external URLs)
  useEffect(() => {
    if (!value) return;
    const newPreviews = Array.isArray(value) ? value : [];
    // Only update if different to avoid cascading renders
    const different = newPreviews.length !== previewUrls.length || newPreviews.some((v, i) => previewUrls[i] !== v);
    if (different) Promise.resolve().then(() => setPreviewUrls(newPreviews));
    if (files && files.length > 0) Promise.resolve().then(() => setFiles([]));
  }, [value, previewUrls, files]);

  // When user selects files, create object URLs and replace previews (not append)
  useEffect(() => {
    // revoke previously created URLs before replacing
    if (createdUrlsRef.current.length) {
      createdUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    }

    if (!files || files.length === 0) {
      // If no local files, only clear previews if there is no external value
      if ((!value || value.length === 0) && previewUrls.length > 0) Promise.resolve().then(() => setPreviewUrls([]));
      return;
    }

    const urls = files.map(f => URL.createObjectURL(f));
    // remember urls we created so we can revoke them later
    createdUrlsRef.current.push(...urls);
    // replace previews with these new urls
    Promise.resolve().then(() => setPreviewUrls(urls));
    // notify parent with File objects
    if (onChange) onChange(files);

    // Note: revocation handled centrally (on unmount or when files change)
  }, [files, value, previewUrls, onChange]);

  // Revoke all created object URLs on unmount to avoid leaks
  useEffect(() => {
    return () => {
      if (createdUrlsRef.current.length) {
        createdUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
        createdUrlsRef.current = [];
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const removePreview = (index) => {
    // If previews originate from selected files, remove corresponding File and revoke URL
    if (files && files.length > 0) {
      const newFiles = files.filter((_, i) => i !== index);
      // revoke the object URL we created for this index (if any)
      const url = createdUrlsRef.current[index];
      if (url) {
        URL.revokeObjectURL(url);
        // also remove from tracking
        createdUrlsRef.current.splice(index, 1);
      }
      setFiles(newFiles);
      // update previewUrls accordingly
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
      onChange && onChange(newFiles);
      return;
    }

    // Otherwise previews are external (from `value`) — just remove from previewUrls locally
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input type="file" multiple accept="image/*" onChange={handleInputChange} />
      <div className="mt-2 flex gap-2 flex-wrap">
        {previewUrls.map((p, i) => (
          <div key={p + '-' + i} className="w-28 h-20 bg-gray-100 rounded overflow-hidden relative">
            <img src={p} alt={`preview-${i}`} className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removePreview(i)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              aria-label={`Remove image ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}