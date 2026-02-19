const fs = require('fs');

try {
    const data = fs.readFileSync('teomotos_data.json', 'utf8');
    // The file might contain the command output "Store Data: " prefix if I captured stdout directly.
    // But my previous run was `node fetch_live_data.js > teomotos_data.json`.
    // fetch_live_data.js printed "Store Data: " ...

    // Let's look for the first '{'
    const jsonStart = data.indexOf('{');
    if (jsonStart === -1) {
        console.error("No JSON found");
        process.exit(1);
    }

    const jsonStr = data.substring(jsonStart);
    const store = JSON.parse(jsonStr);

    console.log("primaryColor:", store.primary_color);
    console.log("secondaryColor:", store.secondary_color);
    console.log("tertiaryColor:", store.tertiary_color);
    console.log("heroTitle:", store.hero_title);
    console.log("heroSubTitle:", store.hero_subtitle);
    console.log("heroImage:", store.hero_image);
    console.log("logo:", store.logo_url);
    console.log("address:", store.address);
    console.log("whatsappNumber:", store.whatsapp_number);
    console.log("whatsappMessage:", store.whatsapp_message);
    console.log("navbarCta:", store.navbar_cta);

} catch (e) {
    console.error("Error parsing:", e);
}
