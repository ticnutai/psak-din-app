/**
 * Script to import 200 unique psakim from psakim_styled folder
 * Takes the latest ones if there are duplicates (by title)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PSAKIM_DIR = path.join(__dirname, '..', '..', 'psakim_styled');
const OUTPUT_FILE = path.join(__dirname, 'psakim_import.json');

// Generate unique ID
function generateId() {
  return `${Date.now()}-${crypto.randomBytes(5).toString('hex')}`;
}

// Extract text from HTML
function extractTextFromHtml(html) {
  // Remove style and script tags
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Remove all HTML tags
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Extract title from HTML
function extractTitle(html, filename) {
  // Try title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) {
    return titleMatch[1].trim().replace(/ - פסק דין #\d+/g, '');
  }
  
  // Try h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match && h1Match[1].trim()) {
    return h1Match[1].trim();
  }
  
  // Extract from filename
  const nameMatch = filename.match(/psak_(\d+)_(.+)\.html/);
  if (nameMatch) {
    return decodeURIComponent(nameMatch[2].replace(/_/g, ' '));
  }
  
  return filename.replace('.html', '').replace(/_/g, ' ');
}

// Extract psak number from filename
function extractPsakNumber(filename) {
  const match = filename.match(/psak_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Categorize psak
function categorizePsak(text) {
  const categories = [];
  const lowerText = text.toLowerCase();
  
  const categoryKeywords = {
    'שכנים': ['שכנים', 'חצר', 'מחיצה', 'בנייה', 'גבול'],
    'מסחר': ['תיווך', 'מכירה', 'עסקה', 'חוזה', 'סחורה', 'מחיר'],
    'שכירות': ['שכירות', 'שוכר', 'משכיר', 'דירה', 'דייר'],
    'שותפות': ['שותפות', 'שותפים', 'חלוקה', 'שותף'],
    'נזיקין': ['נזק', 'היזק', 'פיצוי', 'אחריות'],
    'חובות': ['חוב', 'הלוואה', 'תשלום', 'פירעון'],
    'גירושין': ['גירושין', 'גט', 'כתובה', 'מזונות'],
    'ירושה': ['ירושה', 'צוואה', 'יורשים', 'עזבון'],
    'משמורת': ['משמורת', 'ילדים', 'הסדרי שהות', 'קטין'],
    'ממון': ['ממון', 'כסף', 'תביעה', 'תשלום'],
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      categories.push(category);
    }
  }
  
  return categories.length > 0 ? categories : ['כללי'];
}

// Generate summary
function generateSummary(text, maxLength = 250) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength).trim() + '...';
}

// Extract references (simplified version)
function extractReferences(text, psakId) {
  const references = [];
  
  // Gemara pattern
  const gemaraPatterns = [
    /(שבת|עירובין|פסחים|יומא|סוכה|ביצה|ראש השנה|תענית|מגילה|מועד קטן|חגיגה|יבמות|כתובות|נדרים|נזיר|סוטה|גיטין|קידושין|בבא קמא|בבא מציעא|בבא בתרא|סנהדרין|מכות|שבועות|עבודה זרה|הוריות|זבחים|מנחות|חולין|בכורות|ערכין|תמורה|כריתות|מעילה|תמיד|מידות|קינים|נידה)\s+(?:דף\s+)?([א-ת]+)/g,
  ];
  
  for (const pattern of gemaraPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      references.push({
        id: generateId(),
        type: 'gemara',
        source: match[0],
        text: text.substring(Math.max(0, match.index - 30), Math.min(text.length, match.index + match[0].length + 30)),
        psakId,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }
  }
  
  // Shulchan Aruch patterns
  const shulchanPatterns = [
    /(או"ח|אורח חיים|יו"ד|יורה דעה|אה"ע|אבן העזר|חו"מ|חושן משפט)\s+(?:סי(?:מן)?['\.]?\s*)?(\d+)/g,
  ];
  
  for (const pattern of shulchanPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      references.push({
        id: generateId(),
        type: 'shulchan_aruch',
        source: match[0],
        text: text.substring(Math.max(0, match.index - 30), Math.min(text.length, match.index + match[0].length + 30)),
        psakId,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }
  }
  
  return references;
}

// Parse a psak file
function parsePsakFile(filename, content) {
  const rawText = extractTextFromHtml(content);
  const title = extractTitle(content, filename);
  const psakNumber = extractPsakNumber(filename);
  const id = generateId();
  
  return {
    id,
    title,
    number: psakNumber,
    content: content, // Full HTML
    rawText,
    dateAdded: new Date().toISOString(),
    categories: categorizePsak(rawText),
    tags: [],
    references: extractReferences(rawText, id),
    summary: generateSummary(rawText),
  };
}

// Main function
function main() {
  console.log('📂 Reading psakim from:', PSAKIM_DIR);
  
  // Get all HTML files
  const files = fs.readdirSync(PSAKIM_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => ({
      name: f,
      number: extractPsakNumber(f),
      path: path.join(PSAKIM_DIR, f)
    }));
  
  console.log(`📄 Found ${files.length} HTML files`);
  
  // Sort by number descending (latest first)
  files.sort((a, b) => b.number - a.number);
  
  // Take files and remove duplicates by title (keeping the higher numbered one)
  const titleMap = new Map(); // title -> psak
  const psakim = [];
  
  for (const file of files) {
    if (psakim.length >= 200) break;
    
    try {
      const content = fs.readFileSync(file.path, 'utf-8');
      const psak = parsePsakFile(file.name, content);
      
      // Normalize title for comparison
      const normalizedTitle = psak.title.trim().replace(/\s+/g, ' ');
      
      // Skip if we already have this title (we already have the higher numbered one)
      if (titleMap.has(normalizedTitle)) {
        console.log(`⏭️  Skipping duplicate: ${file.name} (already have ${titleMap.get(normalizedTitle)})`);
        continue;
      }
      
      titleMap.set(normalizedTitle, file.name);
      psakim.push(psak);
      
      if (psakim.length % 20 === 0) {
        console.log(`✅ Processed ${psakim.length} unique psakim...`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${file.name}:`, err.message);
    }
  }
  
  console.log(`\n🎉 Total unique psakim: ${psakim.length}`);
  
  // Save to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(psakim, null, 2), 'utf-8');
  console.log(`💾 Saved to: ${OUTPUT_FILE}`);
  
  // Also create a browser-ready version that can be pasted into console
  const browserScript = `
// Paste this in browser console at localhost:3005 to import psakim
(function() {
  const psakim = ${JSON.stringify(psakim)};
  localStorage.setItem('psak-din-storage', JSON.stringify(psakim));
  console.log('✅ Imported ' + psakim.length + ' psakim!');
  alert('הועלו ' + psakim.length + ' פסקי דין! רענן את הדף.');
})();
`;
  
  const browserScriptFile = path.join(__dirname, 'import_to_browser.js');
  fs.writeFileSync(browserScriptFile, browserScript, 'utf-8');
  console.log(`📋 Browser import script saved to: ${browserScriptFile}`);
  
  console.log('\n📌 Instructions:');
  console.log('1. Open http://localhost:3005 in your browser');
  console.log('2. Open Developer Tools (F12) and go to Console');
  console.log('3. Copy and paste the content of import_to_browser.js');
  console.log('4. Press Enter and refresh the page');
}

main();
