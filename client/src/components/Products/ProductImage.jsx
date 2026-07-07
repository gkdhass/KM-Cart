/**
 * @file client/src/components/Products/ProductImage.jsx
 * @description Reusable product image component with loading skeleton,
 * uniform fallback design, and lazy loading for performance.
 */

import { useState } from 'react';
import { FaBox } from 'react-icons/fa';

/**
 * ProductImage — handles image loading states gracefully.
 * Shows a skeleton while loading, falls back to a uniform gray box with icon on error.
 *
 * @param {string} src        - Image URL
 * @param {string} alt        - Alt text
 * @param {string} name       - Product name (used for alt text)
 * @param {string} className  - Additional CSS classes for the <img>
 */
function ProductImage({ src, alt, name, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Handle empty/missing src as error
  const hasValidSrc = src && src.trim() !== '';

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Show image if valid src and not error */}
      {hasValidSrc && !error ? (
        <>
          {/* Skeleton loader — visible while image is loading */}
          {!loaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-150 to-gray-200 animate-pulse" />
          )}

          {/* Actual image with object-cover to fill container uniformly */}
          <img
            src={src}
            alt={alt || name || 'Product'}
            className={`absolute inset-0 w-full h-full object-cover ${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setError(true);
              setLoaded(true);
            }}
            loading="lazy"
            draggable={false}
          />
        </>
      ) : (
        /* Uniform fallback — light gray box with product icon (NO text, just icon) */
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <FaBox className="text-gray-400 text-4xl" />
        </div>
      )}
    </div>
  );
}

export default ProductImage;
