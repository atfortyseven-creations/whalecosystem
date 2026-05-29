const fs = require('fs');

let content = fs.readFileSync('app/registry/page.tsx', 'utf-8');

// 1. Zoom 30%
content = content.replace(
  /className="min-h-full w-full flex flex-col transition-colors duration-300"/,
  'className="min-h-full w-full flex flex-col transition-colors duration-300" style={{ zoom: 1.3 }}'
);

// 2. Remove TABS icons
content = content.replace(
  /const TABS: \{ id: TabType; label: string; icon: React\.ReactNode \}\[\] = \[/,
  'const TABS: { id: TabType; label: string }[] = ['
);
content = content.replace(/, icon: <[^>]+> /g, '');
content = content.replace(/\{tab\.icon\}/g, '');

// 3. Remove other Lucide icons entirely
const icons = ['Copy', 'Search', 'RefreshCw', 'Sun', 'Moon', 'ChevronDown', 'ExternalLink', 'Activity', 'Shield', 'Database', 'Network', 'Wallet', 'CheckCircle2', 'Globe', 'Hash', 'Layers', 'ChevronLeft', 'ChevronRight', 'Zap'];
icons.forEach(icon => {
  const regex1 = new RegExp('<' + icon + ' [^>]*/>', 'g');
  const regex2 = new RegExp('<' + icon + '>[^<]*</' + icon + '>', 'g');
  content = content.replace(regex1, '');
  content = content.replace(regex2, '');
});

// Fix broken lines caused by removing icons:
// Fix broken empty keys: `icon: ,`
content = content.replace(/icon:\s*,/g, '');
// Fix empty dark/light toggle
content = content.replace(/\{isDark \?  : \}/g, '<span className="text-[10px] font-bold uppercase tracking-wider">{isDark ? "Light" : "Dark"}</span>');

// 4. Jargon removal
content = content.replace(/on-chain/gi, 'Network');
content = content.replace(/ON-CHAIN/g, 'NETWORK');
content = content.replace(/SOVEREIGN/gi, 'AUTONOMOUS');
content = content.replace(/INTELLIGENCE/gi, 'SYSTEM');
content = content.replace(/MATRIX/gi, 'GRID');

// 5. Remove em-dashes (explanations)
content = content.replace(/ — /g, ' ');

// 6. Add LegendaryDownhead
if (!content.includes('LegendaryDownhead')) {
  content = content.replace(
    /import \{ RealWorldMap \} from "@\/components\/landing\/RealWorldMap";/,
    'import { RealWorldMap } from "@/components/landing/RealWorldMap";\nimport { LegendaryDownhead } from "@/components/landing/LegendaryDownhead";'
  );
  
  // Insert before the last closing AnimatePresence and div
  content = content.replace(
    /<\/AnimatePresence>\s*<\/div>\s*<\/div>\s*\);\s*}\s*$/,
    '<LegendaryDownhead />\n        </AnimatePresence>\n      </div>\n    </div>\n  );\n}'
  );
}

fs.writeFileSync('app/registry/page.tsx', content);
console.log("Rewrite completed.");
