const fs = require('fs');
let content = fs.readFileSync('components/landing/WhaleAlertLanding.tsx', 'utf8');

// Remove WhaleGlobeGL import
content = content.replace(/\/\/ Lazy-load the heavy GL globe[\s\S]*?\);\n/g, '');

// Fix background and text color of outer div
content = content.replace(/backgroundColor: "#010101", color: "#E0E0E0"/g, 'backgroundColor: "#FAF9F6", color: "#050505"');

// Fix wallpaper blend mode (Mobile style)
content = content.replace(/<div className="absolute inset-\[-10%\] bg-pc-living-pattern opacity-15 mix-blend-lighten filter saturate-150 contrast-125" \/>/g, '<div className="absolute inset-[-10%] bg-pc-living-pattern opacity-95 mix-blend-multiply" />');
content = content.replace(/<div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">/g, '<div className="fixed inset-0 z-0 overflow-hidden bg-[#FBC9C2] pointer-events-none">');

// Remove the massive Globe rendering section completely:
content = content.replace(/\{\/\* ─── WebGL Globe ─── \*\/\}[\s\S]*?mouse=\{mouse\} \/>[\s\S]*?<\/motion.div>/g, '');

// Convert colors regex
content = content.replace(/rgba\(255,255,255,/g, 'rgba(5,5,5,');
content = content.replace(/color: "#F5F5F5"/g, 'color: "#050505"');
content = content.replace(/color: "#E0E0E0"/g, 'color: "#050505"');
content = content.replace(/color: "#5B6A85"/g, 'color: "rgba(5,5,5,0.7)"');
content = content.replace(/color: "#F0F0F0"/g, 'color: "#050505"');
content = content.replace(/color: "#fff"/g, 'color: "#ffffff"');

// Fix borders and boxes to match light theme
content = content.replace(/boxShadow: "0 0 50px rgba\(0,212,255,0\.12\), inset 0 0 24px rgba\(255,255,255,0\.02\)"/g, 'boxShadow: "0 0 50px rgba(0,0,0,0.1), inset 0 0 24px rgba(0,0,0,0.05)"');

// Specifically update the text-white to text-black
content = content.replace(/text-white\/35/g, 'text-black/50');
content = content.replace(/text-white\/18/g, 'text-black/40');
content = content.replace(/text-white\/5/g, 'text-black/10');
content = content.replace(/bg-white\/5/g, 'bg-black/10');

// Data ticker colors correction 
content = content.replace(/background: "linear-gradient\(90deg,#020202,transparent\)"/g, 'background: "linear-gradient(90deg,#FBC9C2,transparent)"');
content = content.replace(/background: "linear-gradient\(-90deg,#020202,transparent\)"/g, 'background: "linear-gradient(-90deg,#FBC9C2,transparent)"');

// Remove the white text fill color clipping block correctly (Gradient texts should just be solid black or indigo)
content = content.replace(/WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"/g, 'WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"');

fs.writeFileSync('components/landing/WhaleAlertLanding.tsx', content);
console.log("Rewrite complete.");
