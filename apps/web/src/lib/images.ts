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

export function productImage(product: {
  sku?: string;
  images?: Array<{ url?: string | null }>;
}) {
  const local = product.sku ? PRODUCT_IMAGES[product.sku] : undefined;
  const remote = product.images?.[0]?.url;
  if (local) return local;
  if (remote && !remote.includes('placehold.co')) return remote;
  return '/images/product-onesie.jpg';
}

export function categoryImage(slug?: string) {
  if (!slug) return '/images/cat-newborn.jpg';
  return CATEGORY_IMAGES[slug] || '/images/cat-maternity.jpg';
}
