import fs from 'fs';
import path from 'path';

export interface ManifestoSection {
  id: string;
  title: string;
  body: string[];
}

export function parseReadmeToManifesto(): ManifestoSection[] {
  let content = '';
  try {
    const readmePath = path.join(process.cwd(), 'README.md');
    content = fs.readFileSync(readmePath, 'utf8');
  } catch (error) {
    console.error("Failed to read README.md", error);
    return [];
  }

  const lines = content.split('\n');
  const sections: ManifestoSection[] = [];
  let currentSection: ManifestoSection | null = null;
  
  let skipSection = false;

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('---')) continue;
    if (line.startsWith('<div') || line.startsWith('</div') || line.startsWith('[![')) continue;

    // Detect Main Headings (##)
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      
      let title = line.replace('## ', '').replace(/^\d+\.\d*\s*/, '').trim().toLowerCase();
      
      // Filter out sections
      if (title === 'table of contents' || title === 'local development') {
        currentSection = null;
        skipSection = true;
        continue;
      }
      
      skipSection = false;
      
      currentSection = {
        id: title.replace(/[^a-z0-9]+/g, '-'),
        title: title,
        body: []
      };
      continue;
    }

    if (skipSection) continue;

    // Detect Subheadings (###)
    if (line.startsWith('### ')) {
      if (currentSection) {
        currentSection.body.push(`[SUBTITLE]${line.replace('###', '').replace(/^\d+\.\d+\s*/, '').trim().toLowerCase()}`);
      }
      continue;
    }

    // Detect list items
    if (line.startsWith('- ')) {
      if (currentSection) {
        currentSection.body.push(`[LIST_ITEM]${line.replace('- ', '').trim().toLowerCase()}`);
      }
      continue;
    }

    // Detect Code Blocks
    if (line.startsWith('```')) {
       // We can skip code blocks for a clean manifesto, or render them.
       // The user wanted "el nuevo lleno de texto y contenido" - we'll skip code blocks for pure reading elegance.
        continue;
    }
    
    // Skip empty or generic symbol lines
    if (line === '```bash' || line === '```typescript' || line === '```env' || line === '```') continue;
    if (line.startsWith('|')) continue; // Skip tables for reading elegance

    // Normalize normal text
    if (currentSection) {
        // Strip markdown bold/italics syntax and make lowercase
        let cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').toLowerCase();
        
        // Handle consecutive paragraphs by concatenating if the previous wasn't a subtitle/list
        const lastIndex = currentSection.body.length - 1;
        if (lastIndex >= 0 && !currentSection.body[lastIndex].startsWith('[') && !cleanText.startsWith('#')) {
             // For simplicity, just append as new paragraph. Markdown paragraphs are separated by \n\n but we filter empty lines.
             currentSection.body.push(cleanText);
        } else {
             currentSection.body.push(cleanText);
        }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}
