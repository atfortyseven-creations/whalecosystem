const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components'];
const TARGETS = [
    'max-w-7xl',
    'max-w-6xl',
    'max-w-5xl',
    'max-w-[1400px]',
    'max-w-[1200px]',
    'max-w-[1000px]'
];
const REPLACEMENT = 'max-w-[2560px] text-left';

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Replace max-w targets
    for (const target of TARGETS) {
        if (content.includes(target)) {
            // Replace keeping mx-auto intact but adding text-left if we want.
            // Actually, let's just do a simple replace first.
            const regex = new RegExp(`\\b${target.replace(/\[/g, '\\[').replace(/\]/g, '\\]')}\\b`, 'g');
            content = content.replace(regex, 'max-w-[2560px]');
            changed = true;
        }
    }

    // Attempt to normalize "text-center" or "items-center" on the same lines that have max-w-[2560px]
    // To be safe, we will just remove `text-center` globally if it's on a container, but it's safer to just let CSS handle it or replace it explicitly.
    // Let's do a simple line-by-line check.
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('max-w-[2560px]')) {
            if (lines[i].includes('text-center')) {
                lines[i] = lines[i].replace(/\btext-center\b/g, 'text-left');
                changed = true;
            }
            if (lines[i].includes('items-center') && !lines[i].includes('justify-between')) {
                // If it's a flex column or generic container, change items-center to items-start
                lines[i] = lines[i].replace(/\bitems-center\b/g, 'items-start');
                changed = true;
            }
            if (lines[i].includes('text-justify')) {
                lines[i] = lines[i].replace(/\btext-justify\b/g, 'text-left');
                changed = true;
            }
        }
    }
    content = lines.join('\n');

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
});

console.log('4K Normalization Complete.');
