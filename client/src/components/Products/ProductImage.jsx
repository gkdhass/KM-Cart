/**
 * @file client/src/components/Products/ProductImage.jsx
 * @description Reusable product image component with loading skeleton,
 * error fallback, and lazy loading for performance.
 */

import { useState } from 'react';

/**
 * ProductImage — handles image loading states gracefully.
 * Shows a skeleton while loading, falls back to a branded placeholder on error.
 *
 * @param {string} src        - Image URL
 * @param {string} alt        - Alt text
 * @param {string} name       - Product name (used for fallback text)
 * @param {string} className  - Additional CSS classes for the <img>
 */
function ProductImage({ src, alt, name, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Use a simple colored placeholder with product initial
  const productInitial = (name || alt || 'P').charAt(0).toUpperCase();
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(productInitial)}&size=300&background=7C8BF2&color=fff&bold=true&format=svg`;

  // Determine the final src to use: use provided src, or fallback if empty/error
  const imgSrc = error ? fallbackUrl : (src || fallbackUrl);

  return (
    <div className="relative w-full h-full">
      {/* Skeleton loader — visible while image is loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg" />
      )}

      {/* Actual image */}
      <img
        src={imgSrc}
        alt={alt || name || 'Product'}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}

export default ProductImage;
