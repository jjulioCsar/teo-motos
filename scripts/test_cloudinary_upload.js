/**
 * Test Cloudinary upload to diagnose issues
 * Run: node scripts/test_cloudinary_upload.js
 */
const fs = require('fs');
const path = require('path');

const CLOUDINARY_CLOUD = 'dxrwabuvg';
const UPLOAD_PRESET = 'teomotos';

async function testUpload() {
    console.log('🧪 Testing Cloudinary upload...\n');

    // 1. Test with a URL (simulates a remote fetch upload)
    console.log('Test 1: URL upload...');
    const formData1 = new URLSearchParams();
    formData1.append('file', 'https://via.placeholder.com/300x300.jpg');
    formData1.append('upload_preset', UPLOAD_PRESET);
    formData1.append('folder', 'teomotos');
    formData1.append('format', 'jpg');

    try {
        const res1 = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
            { method: 'POST', body: formData1 }
        );

        if (res1.ok) {
            const data1 = await res1.json();
            console.log(`  ✅ URL upload works! URL: ${data1.secure_url}`);
            console.log(`  📊 Size: ${(data1.bytes / 1024).toFixed(1)} KB | ${data1.width}x${data1.height}`);
            console.log(`  📌 Format: ${data1.format}`);
        } else {
            const err1 = await res1.text();
            console.log(`  ❌ URL upload FAILED: ${err1}`);
        }
    } catch (e) {
        console.log(`  ❌ Network error: ${e.message}`);
    }

    // 2. Test listing recent uploads
    console.log('\nTest 2: Check if preset exists...');
    try {
        // Try unsigned upload with just the preset
        const formData2 = new URLSearchParams();
        formData2.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        formData2.append('upload_preset', UPLOAD_PRESET);
        formData2.append('folder', 'teomotos/test');

        const res2 = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
            { method: 'POST', body: formData2 }
        );

        if (res2.ok) {
            const data2 = await res2.json();
            console.log(`  ✅ Preset '${UPLOAD_PRESET}' is working!`);
            console.log(`  📎 Test upload: ${data2.secure_url}`);
        } else {
            const err2 = await res2.text();
            console.log(`  ❌ Preset test FAILED: ${err2}`);
            console.log('\n⚠️  The upload preset may have been deleted or modified.');
            console.log('    Go to: https://console.cloudinary.com/settings/upload');
            console.log(`    And ensure a preset named '${UPLOAD_PRESET}' exists with "Unsigned" mode.`);
        }
    } catch (e) {
        console.log(`  ❌ Network error: ${e.message}`);
    }

    // 3. Test with format=jpg (as in the actual code)
    console.log('\nTest 3: Upload with format=jpg (matching production code)...');
    try {
        const formData3 = new URLSearchParams();
        formData3.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BHgAI/AL+hc2rNAAAAABJRU5ErkJggg==');
        formData3.append('upload_preset', UPLOAD_PRESET);
        formData3.append('folder', 'teomotos');
        formData3.append('format', 'jpg');

        const res3 = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
            { method: 'POST', body: formData3 }
        );

        if (res3.ok) {
            const data3 = await res3.json();
            const optimizedUrl = data3.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
            console.log(`  ✅ Production-style upload works!`);
            console.log(`  📎 Original URL: ${data3.secure_url}`);
            console.log(`  📎 Optimized URL: ${optimizedUrl}`);
        } else {
            const err3 = await res3.text();
            console.log(`  ❌ Upload FAILED: ${err3}`);
        }
    } catch (e) {
        console.log(`  ❌ Network error: ${e.message}`);
    }

    console.log('\n✅ Tests complete!');
}

testUpload().catch(console.error);
