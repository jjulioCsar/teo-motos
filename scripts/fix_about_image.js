/**
 * Migrate the remaining about_image from Supabase to Cloudinary
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const sourceUrl = 'https://litzlvhlmaqcgszkwbdz.supabase.co/storage/v1/object/public/images/ysbr090gnx_1771521704735.jpg';

  console.log('📤 Uploading about_image to Cloudinary...');
  
  const formData = new URLSearchParams();
  formData.append('file', sourceUrl);
  formData.append('upload_preset', 'teomotos');
  formData.append('folder', 'teomotos/site');
  formData.append('public_id', 'about_image');

  const res = await fetch(
    'https://api.cloudinary.com/v1_1/dxrwabuvg/image/upload',
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    console.error('❌ Upload failed:', await res.text());
    return;
  }

  const data = await res.json();
  const newUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
  console.log(`✅ New URL: ${newUrl}`);

  // Update in database
  const { error } = await supabase
    .from('stores')
    .update({ about_image: newUrl })
    .eq('slug', 'teomotos');

  if (error) {
    console.error('❌ DB update failed:', error);
  } else {
    console.log('💾 Database updated');
  }
}

main().catch(console.error);
