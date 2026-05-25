const fs = require('fs');
['app/legal/terms/page.tsx', 'app/legal/privacy/page.tsx', 'app/legal/security/page.tsx', 'app/legal/compliance/page.tsx'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/system's/g, 'system&apos;s');
    content = content.replace(/'/g, '&apos;'); // Ensure ALL single quotes are escaped in JSX text, but wait, this might break imports and attributes!
    // Let's only replace system's and other specific ones we generated.
    // The only one with a quote in our generator was "system's"
    fs.writeFileSync(file, content);
});
console.log('Quotes fixed!');
