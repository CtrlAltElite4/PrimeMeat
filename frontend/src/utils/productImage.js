// The image the shop shows for a product. Used by the shop, the cart and the admin
// panel so they always match. Carcass products use the photos in public/images;
// anything else falls back to an uploaded image, if there is one.
const API_URL = 'http://localhost:8000';

export default function productImage(product) {
  const name = (product?.name || '').toLowerCase();

  if (name.includes('full')) return '/images/full-carcasss.png';
  if (name.includes('half')) return '/images/half-carcasss.png';
  if (name.includes('quarter')) return '/images/quarter-carcasss.png';

  // Admin API sends a ready-made URL; the shop API sends the stored path
  const image = product?.image_url || product?.image;
  if (!image) return null;
  if (image.startsWith('http') || image.startsWith('/')) return image;
  return `${API_URL}/storage/${image}`;
}
