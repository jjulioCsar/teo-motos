/**
 * Download all Supabase Storage images before migration.
 * These images are referenced in motorcycle records.
 * 
 * Run: node scripts/download_supabase_images.mjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPORT_DIR = path.join(__dirname, '..', 'backup_export');
const IMAGES_DIR = path.join(EXPORT_DIR, 'images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const proto = url.startsWith('https') ? https : http;
        const request = proto.get(url, { timeout: 15000 }, (response) => {
            // Follow redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(destPath);
            response.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
            file.on('error', reject);
        });
        request.on('error', reject);
        request.on('timeout', () => { request.destroy(); reject(new Error('timeout')); });
    });
}

async function run() {
    const imagesFile = path.join(EXPORT_DIR, '_supabase_images.json');
    if (!fs.existsSync(imagesFile)) {
        console.log('❌ No _supabase_images.json found. Run export_database.mjs first.');
        return;
    }

    const images = JSON.parse(fs.readFileSync(imagesFile, 'utf-8'));
    console.log(`🖼️  Found ${images.length} Supabase Storage images to download\n`);

    let success = 0;
    let failed = 0;
    const failedUrls = [];

    for (let i = 0; i < images.length; i++) {
        const { moto, id, url } = images[i];
        // Create safe filename from URL
        const urlParts = url.split('/');
        const fileName = `${id}_${i}_${urlParts[urlParts.length - 1]}`.replace(/[^a-zA-Z0-9._-]/g, '_');
        const destPath = path.join(IMAGES_DIR, fileName);

        // Skip if already downloaded
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
            success++;
            process.stdout.write(`\r  [${i + 1}/${images.length}] ${success} ✅ ${failed} ❌ (skipped: already exists)`);
            continue;
        }

        try {
            await downloadFile(url, destPath);
            const size = fs.statSync(destPath).size;
            if (size < 500) {
                // Probably an error page, not a real image
                fs.unlinkSync(destPath);
                throw new Error('File too small (likely error page)');
            }
            success++;
            process.stdout.write(`\r  [${i + 1}/${images.length}] ${success} ✅ ${failed} ❌`);
        } catch (err) {
            failed++;
            failedUrls.push({ moto, url, error: err.message });
            process.stdout.write(`\r  [${i + 1}/${images.length}] ${success} ✅ ${failed} ❌`);
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\n\n📊 Results:`);
    console.log(`  ✅ Downloaded: ${success}`);
    console.log(`  ❌ Failed: ${failed}`);

    if (failedUrls.length > 0) {
        fs.writeFileSync(path.join(EXPORT_DIR, '_failed_downloads.json'), JSON.stringify(failedUrls, null, 2));
        console.log(`  📁 Failed URLs saved to _failed_downloads.json`);
        console.log(`\n⚠️  Failed images may need to be re-uploaded by the admins.`);
    }

    console.log(`\n📁 Images saved to: ${IMAGES_DIR}`);
}

run();
