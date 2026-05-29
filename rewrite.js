const fs = require('fs');
let content = fs.readFileSync('app/registry/page.tsx', 'utf-8');

// 1. Zoom 30%
content = content.replace(/className="min-h-full w-full flex flex-col transition-colors duration-300"/, 'className="min-h-full w-full flex flex-col transition-colors duration-300" style={{ zoom: 1.3 }}');

// 2. TABS icons removal
content = content.replace(/icon: <[^>]+> /g, '');
content = content.replace(/\{tab\.icon\}/g, '');

// 3. Remove all other Lucide icons
const icons = ['Copy', 'Search', 'RefreshCw', 'Sun', 'Moon', 'ChevronDown', 'ExternalLink', 'Activity', 'Shield', 'Database', 'Network', 'Wallet', 'CheckCircle2', 'Globe', 'Hash', 'Layers', 'ChevronLeft', 'ChevronRight', 'Zap'];
icons.forEach(icon => {
  const regex = new RegExp('<' + icon + ' [^>]*/>|<' + icon + '>[^<]*</' + icon + '>', 'g');
  content = content.replace(regex, '');
});

// 4. Jargon removal
content = content.replace(/on-chain/gi, 'Network');
content = content.replace(/ON-CHAIN/g, 'NETWORK');

// 5. Remove hyphens between explanations
content = content.replace(/ — /g, ' ');
content = content.replace(/ - /g, ' ');

// 6. Add LegendaryDownhead
if (!content.includes('LegendaryDownhead')) {
  content = content.replace(/import \{ RealWorldMap \} from "@\/components\/landing\/RealWorldMap";/, 'import { RealWorldMap } from "@/components/landing/RealWorldMap";\nimport { LegendaryDownhead } from "@/components/landing/LegendaryDownhead";');
  
  // Insert before the last closing AnimatePresence and div
  content = content.replace(/<\/AnimatePresence>\s*<\/div>\s*<\/div>\s*\);\s*}\s*$/, '<LegendaryDownhead />\n        </AnimatePresence>\n      </div>\n    </div>\n  );\n}');
}

fs.writeFileSync('app/registry/page.tsx', content);
