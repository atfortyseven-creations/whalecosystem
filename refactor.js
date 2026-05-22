const fs = require('fs');
const path = require('path');

const ignoreDirs = new Set(['node_modules', '.git', '.next', '.gemini']);

function replaceContent(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace while preserving basic casing
    content = content.replace(/System/g, 'Institutional');
    content = content.replace(/system/g, 'institutional');
    content = content.replace(/SOVEREIGN/g, 'INSTITUTIONAL');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated content: ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    // Process files and recurse into directories
    for (const item of items) {
        if (ignoreDirs.has(item)) continue;
        
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else {
            // Only process text files (basic heuristic: filter out obvious binaries)
            if (!fullPath.match(/\.(png|jpg|jpeg|gif|ico|webp|mp4|mp3|exe|dll|ttf|woff|woff2)$/i)) {
                replaceContent(fullPath);
            }
        }
    }
    
    // Rename items in the current directory after deep processing
    for (const item of items) {
        if (ignoreDirs.has(item)) continue;
        
        let newName = item.replace(/System/g, 'Institutional')
                          .replace(/system/g, 'institutional')
                          .replace(/SOVEREIGN/g, 'INSTITUTIONAL');
                          
        if (newName !== item) {
            const oldPath = path.join(dirPath, item);
            const newPath = path.join(dirPath, newName);
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed: ${oldPath} -> ${newPath}`);
        }
    }
}

processDirectory(__dirname);
console.log("Refactoring complete.");
