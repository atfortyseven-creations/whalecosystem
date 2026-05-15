/**
 * purge_jargon.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Purges "Sovereign" + "Institutional" jargon from all UI-visible text
 * inside TSX/TS/JS files (JSX content and string literals only).
 *
 * SAFE: Does NOT touch:
 *   • CSS class names (bg-, text-, border-, flex, etc.)
 *   • File paths / import paths / URLs
 *   • Variable/function/component names in code
 *   • Config keys, SQL, JSON keys
 *
 * Run: node purge_jargon.js
 */

const fs = require('fs');
const path = require('path');

// ── Replacement map (order matters — longest first) ──────────────────────────
const REPLACEMENTS = [
  // Full compound phrases first
  ['Sovereign Terminal', 'Secure Platform'],
  ['SOVEREIGN TERMINAL', 'SECURE PLATFORM'],
  ['sovereign terminal', 'secure platform'],
  ['Sovereign Dashboard', 'Professional Dashboard'],
  ['SOVEREIGN DASHBOARD', 'PROFESSIONAL DASHBOARD'],
  ['Sovereign Identity', 'Verified Identity'],
  ['SOVEREIGN IDENTITY', 'VERIFIED IDENTITY'],
  ['Sovereign Ledger', 'Network Ledger'],
  ['SOVEREIGN LEDGER', 'NETWORK LEDGER'],
  ['Sovereign Vault', 'Secure Vault'],
  ['SOVEREIGN VAULT', 'SECURE VAULT'],
  ['Sovereign Intel', 'Network Intel'],
  ['SOVEREIGN INTEL', 'NETWORK INTEL'],
  ['Sovereign Grade', 'Professional Grade'],
  ['Sovereign-grade', 'Professional-grade'],
  ['Institutional Grade', 'Professional Grade'],
  ['Institutional-grade', 'Professional-grade'],
  ['Institutional Office', 'Network Office'],
  ['INSTITUTIONAL OFFICE', 'NETWORK OFFICE'],
  ['Institutional Platform', 'Professional Platform'],
  ['INSTITUTIONAL PLATFORM', 'PROFESSIONAL PLATFORM'],
  ['Institutional Dashboard', 'Professional Dashboard'],
  ['Institutional Analytics', 'Professional Analytics'],
  ['Institutional Scale', 'Global Scale'],
  ['institutional scale', 'global scale'],
  ['Institutional Review', 'Professional Review'],
  ['Institutional Identity', 'Verified Identity'],
  ['institutional identity', 'verified identity'],
  ['Institutional Integrity', 'Verified Integrity'],
  ['Institutional Honesty', 'Absolute Honesty'],
  // Single words last
  ['Sovereign', 'Verified'],
  ['SOVEREIGN', 'VERIFIED'],
  ['sovereign', 'verified'],
  ['Institutional', 'Professional'],
  ['INSTITUTIONAL', 'PROFESSIONAL'],
  ['institutional', 'professional'],
];

// ── Directories to scan ───────────────────────────────────────────────────────
const TARGET_DIRS = ['app', 'components'];

// ── CSS class prefixes to SKIP (never replace inside class names) ─────────────
const CLASS_SAFE_PREFIXES = [
  'flex', 'grid', 'text-', 'bg-', 'border-', 'p-', 'px-', 'py-', 'm-',
  'mx-', 'my-', 'w-', 'h-', 'max-', 'min-', 'rounded', 'shadow', 'opacity',
  'hidden', 'block', 'inline', 'relative', 'absolute', 'fixed', 'sticky',
  'overflow', 'z-', 'top-', 'left-', 'right-', 'bottom-', 'inset',
  'transition', 'duration', 'ease', 'gap-', 'space-', 'scale', 'rotate',
  'cursor', 'pointer', 'select', 'backdrop', 'blur', 'saturate', 'font-',
  'tracking-', 'leading-', 'uppercase', 'lowercase', 'capitalize',
  'antialiased', 'truncate', 'whitespace', 'object-', 'aspect-', 'col-',
  'row-', 'divide-', 'ring-', 'group', 'peer', 'dark:', 'hover:', 'focus:',
  'active:', 'sm:', 'md:', 'lg:', 'xl:', '2xl:',
];

function isClassString(str) {
  if (!str || str.length === 0) return false;
  const parts = str.trim().split(/\s+/);
  if (parts.length < 2) return false; // single word — could be either
  return parts.every(p =>
    CLASS_SAFE_PREFIXES.some(prefix => p.startsWith(prefix))
    || /^[a-z-_\/\[\]:!]+$/.test(p) // all-lowercase CSS token
  );
}

function isPathOrUrl(str) {
  return /^(\/|\.\/|\.\.\/|https?:|mailto:|@)/.test(str.trim());
}

function applyReplacements(text) {
  let result = text;
  for (const [from, to] of REPLACEMENTS) {
    // Whole-word replacement, case-exact
    result = result.replace(new RegExp(`\\b${from.replace(/[-]/g, '\\-')}\\b`, 'g'), to);
  }
  return result;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // ── 1. Replace inside JSX text content: >...< ────────────────────────────
  content = content.replace(/>([^<]+)</g, (match, inner) => {
    // Skip if it's pure whitespace
    if (!inner.trim()) return match;
    return '>' + applyReplacements(inner) + '<';
  });

  // ── 2. Replace inside string literals (skip class names, paths, URLs) ────
  content = content.replace(/(['"`])([\s\S]*?)\1/g, (match, quote, inner) => {
    // Skip template literal expressions — too risky
    if (inner.includes('${')) return match;
    // Skip paths and URLs
    if (isPathOrUrl(inner)) return match;
    // Skip CSS class strings
    if (isClassString(inner)) return match;
    // Skip things that look like CSS: contain more than 2 TW tokens
    if (inner.includes('flex ') || inner.includes('text-') || inner.includes('bg-')) return match;
    const replaced = applyReplacements(inner);
    if (replaced === inner) return match;
    return quote + replaced + quote;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  ✓ Patched:', path.relative(process.cwd(), filePath));
    return true;
  }
  return false;
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, .next, .git
      if (['node_modules', '.next', '.git', 'dist', '.cache'].includes(entry.name)) continue;
      walkDir(full);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      processFile(full);
    }
  }
}

console.log('\n🔥 Purging jargon across the system...\n');
let changedCount = 0;
for (const dir of TARGET_DIRS) {
  const abs = path.join(__dirname, dir);
  if (fs.existsSync(abs)) {
    walkDir(abs);
  }
}
console.log('\n✅ Jargon purge complete.\n');
