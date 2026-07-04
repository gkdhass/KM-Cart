/**
 * @file client/src/components/Chatbot/ImageSearchButton.jsx
 * @description Camera button for image-based product search in the chatbot.
 * Opens file picker for image upload, sends to OCR API, and displays results.
 */

import { useState, useRef } from 'react';
import { FaCamera } from 'react-icons/fa';
import api from '../../utils/api';

/**
 * ImageSearchButton component — camera button for image upload.
 * Features:
 * - File picker for image selection
 * - Image validation (type and size)
 * - Upload to /api/products/image-search endpoint
 * - Passes detected products to parent via callback
 * - Visual loading state during upload
 *
 * @param {Object} props
 * @param {Function} props.onImageResults - Callback with OCR results (brands, products, etc.)
 * @param {Boolean} props.disabled - Whether the button should be disabled
 * @returns {JSX.Element|null} Camera button or null if no callback
 */
function ImageSearchButton({ onImageResults, disabled = false }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  /**
   * Validate image file before upload.
   * Checks file type and size (max 5MB).
   */
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP).');
      return false;
    }

    if (file.size > maxSize) {
      alert('Image size must be less than 5MB.');
      return false;
    }

    return true;
  };

  /**
   * Handle image file selection and upload.
   */
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!validateImage(file)) {
      event.target.value = ''; // Reset input
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Send to image search API
      const response = await api.post('/products/image-search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Pass results to parent callback
      if (onImageResults) {
        onImageResults(response.data);
      }
    } catch (error) {
      console.error('[ImageSearchButton] Upload error:', error);
      console.error('[ImageSearchButton] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Extract detailed error message
      let errorMsg = 'Failed to process image. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Use specific error message from server
        if (data.message) {
          errorMsg = data.message;
        }
        
        // Add error type context if available
        if (data.errorType) {
          console.error('[ImageSearchButton] Error type:', data.errorType);
          
          switch (data.errorType) {
            case 'OCR_ERROR':
              errorMsg = `OCR failed: ${data.errorDetails || 'Could not read text from image'}`;
              break;
            case 'MATCH_ERROR':
              errorMsg = `Product matching failed: ${data.errorDetails || 'Could not match products'}`;
              break;
            case 'SERVER_ERROR':
              errorMsg = `Server error: ${data.errorDetails || 'Internal server error'}`;
              break;
          }
        }
      } else if (error.request) {
        // Request made but no response received
        errorMsg = 'No response from server. Please check your connection and try again.';
      } else {
        // Something else went wrong
        errorMsg = `Upload error: ${error.message}`;
      }
      
      if (onImageResults) {
        onImageResults({
          success: false,
          error: errorMsg,
          errorType: error.response?.data?.errorType || 'UNKNOWN',
        });
      }
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset input for re-upload
    }
  };

  /**
   * Trigger file picker.
   */
  const handleClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Don't render if no callback provided
  if (!onImageResults) {
    return null;
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload product image"
      />

      {/* Camera button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className={`w-9 h-9 rounded-lg flex items-center justify-center
                   transition-all duration-200
                   ${
                     isUploading
                       ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                       : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                   }
                   ${
                     disabled
                       ? 'opacity-50 cursor-not-allowed'
                       : 'hover:scale-105 active:scale-95'
                   }
                   disabled:hover:scale-100`}
        title={isUploading ? 'Processing image...' : 'Image search'}
        aria-label={isUploading ? 'Processing image' : 'Upload product image'}
      >
        <FaCamera
          className={`text-sm ${isUploading ? 'animate-pulse' : ''}`}
        />
      </button>
    </>
  );
}

export default ImageSearchButton;
