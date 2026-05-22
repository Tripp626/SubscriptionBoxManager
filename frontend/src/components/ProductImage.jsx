import { useState } from 'react';

export default function ProductImage({ product, wSize = 40, hSize = 40, className = '' }) {
  const [failed, setFailed] = useState(false);

  const imageUrl = product?.imageUrl || null;

  const sizeStyle = { width: wSize, height: hSize, objectFit: 'cover' };

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt={product.name}
        className={`rounded ${className}`}
        style={sizeStyle}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`text-muted d-flex align-items-center justify-content-center ${className}`}
      style={{ ...sizeStyle, fontSize: hSize * 0.6 }}>
      📦
    </span>
  );
}
