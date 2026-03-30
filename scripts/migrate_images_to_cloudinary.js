/**
 * Migrate hardcoded Supabase Storage images to Cloudinary
 * Run: node scripts/migrate_images_to_cloudinary.js
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxrwabuvg';
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET;

const SUPABASE_IMAGES = [
  {
    name: 'logo',
    url: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/gdfa7647khi_1770915739568.png',
  },
  {
    name: 'hero_image',
    url: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/53ox8xv53h_1770915631908.jpeg',
  },
  {
    name: 'financing_hero',
    url: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/nu7llieeuqg_1771521616043.jpg',
  },
  {
    name: 'financing_secondary',
    url: 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/e2qqprivsyr_1771521631253.jpg',
  },
];

async function migrateImage(image) {
  console.log(`\n📤 Uploading ${image.name}...`);
  console.log(`   Source: ${image.url}`);

  // Use Cloudinary's fetch URL to migrate directly (no download needed)
  const formData = new URLSearchParams();
  formData.append('file', image.url);
  formData.append('upload_preset', 'teomotos');
  formData.append('folder', 'teomotos/site');
  formData.append('public_id', image.name);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`   ❌ Failed: ${err}`);
    return null;
  }

  const data = await res.json();
  // Add f_auto,q_auto for optimal delivery
  const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
  console.log(`   ✅ Done: ${optimizedUrl}`);
  console.log(`   📊 Size: ${(data.bytes / 1024).toFixed(1)} KB | ${data.width}x${data.height}`);
  return optimizedUrl;
}

async function main() {
  console.log('🔄 Migrating Supabase images to Cloudinary...\n');

  const results = {};
  for (const img of SUPABASE_IMAGES) {
    const newUrl = await migrateImage(img);
    if (newUrl) {
      results[img.name] = newUrl;
    }
  }

  console.log('\n\n========================================');
  console.log('📋 NEW CLOUDINARY URLs:');
  console.log('========================================');
  for (const [name, url] of Object.entries(results)) {
    console.log(`${name}: ${url}`);
  }
  console.log('========================================\n');

  // Save results to a file for reference
  fs.writeFileSync(
    path.join(__dirname, '..', 'migrated_urls.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('💾 Results saved to migrated_urls.json');
}

main().catch(console.error);
