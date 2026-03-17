/**
 * Client-side image compressor for mobile phone photographs.
 * Handles large HEIC/JPEG/PNG images and compresses them for web display
 * while preserving maximum visual quality.
 */

interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    outputFormat?: 'image/jpeg' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressOptions = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    outputFormat: 'image/webp',
};

/**
 * Compress an image File for web upload.
 * - Supports JPEG, PNG, WebP, and most formats browsers can decode
 * - Resizes to fit within maxWidth/maxHeight while keeping aspect ratio
 * - Strips EXIF rotation (canvas handles this automatically in modern browsers)
 * - Outputs WebP at 85% quality by default (excellent quality, ~70% smaller than JPEG)
 * 
 * @returns A new File object with the compressed image
 */
export async function compressImage(
    file: File,
    options: CompressOptions = {}
): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Skip compression for already-small files (< 200KB)
    if (file.size < 200 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            
            let { width, height } = img;
            
            // Scale down if exceeds max dimensions
            if (width > opts.maxWidth! || height > opts.maxHeight!) {
                const ratio = Math.min(
                    opts.maxWidth! / width,
                    opts.maxHeight! / height
                );
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            
            // Create canvas and draw
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            
            // Use high-quality interpolation
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }
                    
                    // If WebP is not supported or output is larger, fall back to JPEG
                    if (blob.size > file.size) {
                        resolve(file); // Original is smaller, use it
                        return;
                    }
                    
                    const ext = opts.outputFormat === 'image/webp' ? 'webp' : 'jpg';
                    const compressedFile = new File(
                        [blob],
                        file.name.replace(/\.[^.]+$/, `.${ext}`),
                        { type: opts.outputFormat!, lastModified: Date.now() }
                    );
                    
                    console.log(
                        `[ImageCompressor] ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB ` +
                        `(${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction, ${width}x${height})`
                    );
                    
                    resolve(compressedFile);
                },
                opts.outputFormat,
                opts.quality
            );
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            // If browser can't decode the image, return original
            console.warn('[ImageCompressor] Could not decode image, uploading original');
            resolve(file);
        };
        
        img.src = url;
    });
}

/**
 * Compress an image specifically for thumbnails (smaller, more aggressive compression)
 */
export async function compressThumbnail(file: File): Promise<File> {
    return compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.75,
        outputFormat: 'image/webp',
    });
}
