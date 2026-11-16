'use client';

import { useState } from 'react';
import { productImage } from '../../../lib/images';

export function ProductGallery({ product }: { product: any }) {
  const images = (product.images && product.images.length > 0)
    ? product.images.map((img: any) => img.url).filter(Boolean)
    : [productImage(product)];

  const [activeImage, setActiveImage] = useState(images[0] || productImage(product));

  return (
    <div>
      <div
        className="tmh-card overflow-hidden mb-3"
        style={{ borderRadius: '1.25rem', border: '1.5px solid var(--tmh-line)' }}
      >
        <div className="tmh-card-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-100"
            style={{ aspectRatio: '1', objectFit: 'cover' }}
            src={activeImage}
            alt={product.name}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="d-flex gap-2 flex-wrap">
          {images.map((img: string, idx: number) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              className="p-1 rounded-3 bg-white"
              style={{
                border: activeImage === img ? '2px solid var(--tmh-sage)' : '1px solid var(--tmh-line)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setActiveImage(img)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                width={64}
                height={64}
                className="rounded-2 object-fit-cover d-block"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

