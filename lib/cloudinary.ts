/**
 * Cloudinary Image Optimization Utility
 * 
 * Adds responsive size transformations to Cloudinary URLs so the CDN
 * serves appropriately-sized images instead of full-resolution originals.
 * This dramatically reduces load times especially on mobile.
 */

/**
 * Optimize a Cloudinary URL by inserting width/quality transformations.
 * If the URL is not from Cloudinary, returns it unchanged.
 * 
 * @param url - The image URL (Cloudinary or any other source)
 * @param width - Target width in pixels (e.g. 400 for thumbnails, 800 for cards, 1200 for hero)
 * @param quality - Quality setting (default: 'auto' lets Cloudinary decide optimal quality)
 */
export function optimizeCloudinaryUrl(
  url: string | undefined | null,
  width: number = 800,
  quality: string = 'auto'
): string {
  if (!url) return '';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // Check if URL already has width transformation
  if (url.includes('/w_')) return url;

  // Insert width + format + quality transformations
  // f_auto = serve WebP/AVIF to supported browsers
  // q_auto = let Cloudinary pick optimal quality
  // w_XXX = resize to width, maintaining aspect ratio
  const transformation = `w_${width},f_auto,q_${quality}`;

  // If URL already has f_auto,q_auto, replace it
  if (url.includes('f_auto,q_auto')) {
    return url.replace('f_auto,q_auto', transformation);
  }

  // Otherwise insert after /upload/
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  return url;
}

/**
 * Preset sizes for common use cases
 */
export const cloudinarySizes = {
  /** Thumbnail (cards in grid, mobile) */
  thumbnail: (url: string) => optimizeCloudinaryUrl(url, 400),
  /** Card (desktop grid items) */
  card: (url: string) => optimizeCloudinaryUrl(url, 600),
  /** Detail (motorcycle detail page main image) */
  detail: (url: string) => optimizeCloudinaryUrl(url, 1200),
  /** Hero (full-width hero banners) */
  hero: (url: string) => optimizeCloudinaryUrl(url, 1920),
  /** Logo (small logos) */
  logo: (url: string) => optimizeCloudinaryUrl(url, 200),
};
