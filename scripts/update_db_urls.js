/**
 * Update Supabase Storage URLs in the database to Cloudinary URLs
 * Run: node scripts/update_db_urls.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const URL_MAP = {
  'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/gdfa7647khi_1770915739568.png':
    'https://res.cloudinary.com/dxrwabuvg/image/upload/f_auto,q_auto/v1774877558/teomotos/site/logo.png',
  'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/53ox8xv53h_1770915631908.jpeg':
    'https://res.cloudinary.com/dxrwabuvg/image/upload/f_auto,q_auto/v1774877559/teomotos/site/hero_image.jpg',
  'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/nu7llieeuqg_1771521616043.jpg':
    'https://res.cloudinary.com/dxrwabuvg/image/upload/f_auto,q_auto/v1774877561/teomotos/site/financing_hero.jpg',
  'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/e2qqprivsyr_1771521631253.jpg':
    'https://res.cloudinary.com/dxrwabuvg/image/upload/f_auto,q_auto/v1774877562/teomotos/site/financing_secondary.jpg',
};

// Fields in the stores table that can contain image URLs
const IMAGE_FIELDS = [
  'logo_url', 'hero_image', 'about_image',
  'financing_hero_image', 'financing_secondary_image'
];

async function main() {
  console.log('🔍 Checking stores table for Supabase Storage URLs...\n');

  const { data: stores, error } = await supabase.from('stores').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }

  let totalFixed = 0;

  for (const store of stores) {
    const updates = {};
    let storeHasChanges = false;

    for (const field of IMAGE_FIELDS) {
      const value = store[field];
      if (value && typeof value === 'string' && value.includes('supabase.co/storage')) {
        const newUrl = URL_MAP[value];
        if (newUrl) {
          updates[field] = newUrl;
          storeHasChanges = true;
          console.log(`  ✅ ${store.slug}.${field}:`);
          console.log(`     Old: ${value.substring(0, 60)}...`);
          console.log(`     New: ${newUrl.substring(0, 60)}...`);
        } else {
          console.log(`  ⚠️  ${store.slug}.${field}: Supabase URL found but no mapping:`);
          console.log(`     ${value}`);
        }
      }
    }

    if (storeHasChanges) {
      const { error: updateError } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', store.id);

      if (updateError) {
        console.error(`  ❌ Failed to update ${store.slug}:`, updateError);
      } else {
        totalFixed++;
        console.log(`  💾 Updated ${store.slug}\n`);
      }
    }
  }

  // Also check motorcycles table for any Supabase URLs in images arrays
  console.log('\n🔍 Checking motorcycles table...\n');

  const { data: motos, error: motoError } = await supabase.from('motorcycles').select('id, images, slug');
  if (motoError) {
    console.error('Error:', motoError);
    return;
  }

  let motoFixed = 0;
  for (const moto of motos) {
    if (!moto.images || !Array.isArray(moto.images)) continue;
    
    let hasSupabaseUrl = false;
    const newImages = moto.images.map(url => {
      if (url && url.includes('supabase.co/storage')) {
        hasSupabaseUrl = true;
        return URL_MAP[url] || url;
      }
      return url;
    });

    if (hasSupabaseUrl) {
      const { error: updateError } = await supabase
        .from('motorcycles')
        .update({ images: newImages })
        .eq('id', moto.id);

      if (!updateError) {
        motoFixed++;
        console.log(`  ✅ Fixed motorcycle: ${moto.slug || moto.id}`);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`📊 Results:`);
  console.log(`   Stores updated: ${totalFixed}`);
  console.log(`   Motorcycles updated: ${motoFixed}`);
  console.log(`========================================\n`);
}

main().catch(console.error);
