/** Local catalog imagery mapped by SKU / category slug. */
export const PRODUCT_IMAGES: Record<string, string> = {
  'TMH-MP-001': '/images/product-maternity-pads.jpg',
  'TMH-NO-010': '/images/product-onesie.jpg',
  'TMH-FB-250': '/images/product-bottle.jpg',
};

export const CATEGORY_IMAGES: Record<string, string> = {
  'maternity-postpartum': '/images/cat-maternity.jpg',
  'newborn-essentials': '/images/cat-newborn.jpg',
  'diapers-hygiene': '/images/product-maternity-pads.jpg',
  feeding: '/images/product-bottle.jpg',
  'gifts-bundles': '/images/product-onesie.jpg',
};

export function productImage(product?: {
  sku?: string | null;
  images?: Array<{ url?: string | null }> | null;
} | null) {
  if (!product) return '/images/product-onesie.jpg';
  const remote = product.images?.[0]?.url;
  if (remote && !remote.includes('placehold.co') && remote.trim().length > 0) {
    return remote;
  }
  const local = product.sku ? PRODUCT_IMAGES[product.sku] : undefined;
  if (local) return local;
  if (product.sku) {
    const base = Object.keys(PRODUCT_IMAGES).find((key) => product.sku!.startsWith(key));
    if (base && PRODUCT_IMAGES[base]) return PRODUCT_IMAGES[base];
  }
  return '/images/product-onesie.jpg';
}

export function categoryImage(
  catOrSlug?: { slug?: string | null; imageUrl?: string | null } | string | null,
) {
  if (!catOrSlug) return '/images/cat-newborn.jpg';
  if (typeof catOrSlug === 'object') {
    if (catOrSlug.imageUrl && !catOrSlug.imageUrl.includes('placehold.co') && catOrSlug.imageUrl.trim().length > 0) {
      return catOrSlug.imageUrl;
    }
    const slug = catOrSlug.slug;
    return (slug && CATEGORY_IMAGES[slug]) || '/images/cat-maternity.jpg';
  }
  return CATEGORY_IMAGES[catOrSlug] || '/images/cat-maternity.jpg';
}
