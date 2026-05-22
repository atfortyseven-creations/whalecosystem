const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const terms = {
  'System Terminal': 'Institutional Platform',
  'SOVEREIGN TERMINAL': 'INSTITUTIONAL PLATFORM',
  'System terminal': 'Institutional platform',
  'system terminal': 'institutional platform',
  'System': 'Institutional',
  'SOVEREIGN': 'INSTITUTIONAL',
  'system': 'institutional',
  'Terminal': 'Platform',
  'TERMINAL': 'PLATFORM',
  'terminal': 'platform',
  'Execution': 'Operations',
  'EXECUTION': 'OPERATIONS',
  'execution': 'operations'
};

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Inside JSX >...<
  content = content.replace(/>([^<]+)</g, (match, p1) => {
    let newText = p1;
    for (const [k, v] of Object.entries(terms)) {
      newText = newText.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
    }
    return `>${newText}<`;
  });

  // 2. Inside strings that contain spaces (phrases)
  content = content.replace(/(['"`])(.*?)\1/g, (match, quote, p1) => {
    if (p1.includes(' ')) {
        let newText = p1;
        for (const [k, v] of Object.entries(terms)) {
          newText = newText.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
        }
        // Don't replace if it looks like a path or URL
        if (newText.includes('/') && !newText.includes(' / ')) return match;
        // Don't replace in class names
        if (p1.includes('flex') || p1.includes('text-') || p1.includes('bg-')) return match;
        return `${quote}${newText}${quote}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

walkDir(path.join(__dirname, 'components'), replaceInFile);
walkDir(path.join(__dirname, 'app'), replaceInFile);
