import DOMPurify from 'dompurify';
import { PsakDin, Reference, ReferenceType, Category } from '../types';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'i', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                   'ul', 'ol', 'li', 'blockquote', 'div', 'span', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
    ALLOWED_ATTR: ['class', 'id', 'style'],
  });
};

// Extract plain text from HTML
export const extractTextFromHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

// Extract title from HTML or filename
export const extractTitle = (html: string, filename: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // Try to find title in common places
  const titleElement = doc.querySelector('title') || 
                       doc.querySelector('h1') || 
                       doc.querySelector('h2') ||
                       doc.querySelector('.title');
  
  if (titleElement?.textContent?.trim()) {
    return titleElement.textContent.trim();
  }
  
  // Extract from filename
  const nameMatch = filename.match(/psak_(\d+)_(.+)\.html/);
  if (nameMatch) {
    return nameMatch[2].replace(/_/g, ' ');
  }
  
  return filename.replace('.html', '').replace(/_/g, ' ');
};

// Extract psak number from filename
export const extractPsakNumber = (filename: string): number => {
  const match = filename.match(/psak_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Reference patterns for Hebrew holy texts
const referencePatterns: { type: ReferenceType; patterns: RegExp[] }[] = [
  {
    type: 'gemara',
    patterns: [
      /(?:גמ(?:רא)?|תלמוד)\s+(?:בבלי|ירושלמי)?\s*([\u0590-\u05FF]+)\s+(?:דף\s+)?([א-ת]+)([.:,])?/g,
      /(?:מס(?:כת)?|מסכתא)\s+([\u0590-\u05FF]+)\s+(?:דף\s+)?([א-ת]+)/g,
      /(שבת|עירובין|פסחים|יומא|סוכה|ביצה|ראש השנה|תענית|מגילה|מועד קטן|חגיגה|יבמות|כתובות|נדרים|נזיר|סוטה|גיטין|קידושין|בבא קמא|בבא מציעא|בבא בתרא|סנהדרין|מכות|שבועות|עבודה זרה|הוריות|זבחים|מנחות|חולין|בכורות|ערכין|תמורה|כריתות|מעילה|תמיד|מידות|קינים|נידה)\s+(?:דף\s+)?([א-ת]+)/g,
    ]
  },
  {
    type: 'shulchan_aruch',
    patterns: [
      /שו"ע|שולחן\s+ערוך/g,
      /(?:או"ח|אורח\s+חיים)\s+(?:סי(?:מן)?['\.]?\s*)?(\d+)/g,
      /(?:יו"ד|יורה\s+דעה)\s+(?:סי(?:מן)?['\.]?\s*)?(\d+)/g,
      /(?:אה"ע|אבן\s+העזר)\s+(?:סי(?:מן)?['\.]?\s*)?(\d+)/g,
      /(?:חו"מ|חושן\s+משפט)\s+(?:סי(?:מן)?['\.]?\s*)?(\d+)/g,
    ]
  },
  {
    type: 'rambam',
    patterns: [
      /רמב"ם|משנה\s+תורה/g,
      /הל(?:כות)?\s+([\u0590-\u05FF\s]+)\s+פ(?:רק)?['\.]?\s*(\d+)/g,
    ]
  },
  {
    type: 'tur',
    patterns: [
      /טור\s+(?:או"ח|יו"ד|אה"ע|חו"מ)/g,
    ]
  },
  {
    type: 'mishna',
    patterns: [
      /משנה\s+([\u0590-\u05FF]+)\s+פ(?:רק)?['\.]?\s*(\d+)/g,
    ]
  },
  {
    type: 'responsa',
    patterns: [
      /שו"ת\s+([\u0590-\u05FF\s]+)/g,
      /תשובות?\s+([\u0590-\u05FF\s]+)/g,
    ]
  },
];

// Extract references from text
export const extractReferences = (text: string, psakId: string): Reference[] => {
  const references: Reference[] = [];
  
  for (const { type, patterns } of referencePatterns) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        references.push({
          id: generateId(),
          type,
          source: match[0],
          text: text.substring(Math.max(0, match.index - 30), Math.min(text.length, match.index + match[0].length + 30)),
          psakId,
          position: {
            start: match.index,
            end: match.index + match[0].length,
          },
        });
      }
    }
  }
  
  return references;
};

// Generate summary from text
export const generateSummary = (text: string, maxLength: number = 200): string => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength).trim() + '...';
};

// Categorize psak based on content
export const categorizePsak = (text: string): string[] => {
  const categories: string[] = [];
  
  const categoryKeywords: Record<string, string[]> = {
    'שכנים': ['שכנים', 'חצר', 'מחיצה', 'בנייה', 'גבול'],
    'מסחר': ['תיווך', 'מכירה', 'עסקה', 'חוזה', 'סחורה', 'מחיר'],
    'שכירות': ['שכירות', 'שוכר', 'משכיר', 'דירה', 'דייר'],
    'שותפות': ['שותפות', 'שותפים', 'חלוקה', 'שותף'],
    'נזיקין': ['נזק', 'היזק', 'פיצוי', 'אחריות'],
    'חובות': ['חוב', 'הלוואה', 'תשלום', 'פירעון'],
    'ממון': ['ממון', 'כסף', 'תביעה', 'תשלום'],
  };
  
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      categories.push(category);
    }
  }
  
  return categories.length > 0 ? categories : ['כללי'];
};

// Parse HTML file and create PsakDin object
export const parsePsakFile = async (file: File): Promise<PsakDin> => {
  const content = await file.text();
  const sanitizedContent = sanitizeHtml(content);
  const rawText = extractTextFromHtml(content);
  const title = extractTitle(content, file.name);
  const psakNumber = extractPsakNumber(file.name);
  const id = generateId();
  
  return {
    id,
    title,
    number: psakNumber,
    content: sanitizedContent,
    rawText,
    dateAdded: new Date(),
    categories: categorizePsak(rawText),
    tags: [],
    references: extractReferences(rawText, id),
    summary: generateSummary(rawText),
  };
};

// Search psakim
export const searchPsakim = (psakim: PsakDin[], query: string): PsakDin[] => {
  if (!query.trim()) return psakim;
  
  const terms = query.toLowerCase().split(/\s+/);
  
  return psakim.filter(psak => {
    const searchText = `${psak.title} ${psak.rawText} ${psak.categories.join(' ')}`.toLowerCase();
    return terms.every(term => searchText.includes(term));
  }).sort((a, b) => {
    // Sort by relevance (number of term occurrences)
    const aCount = terms.reduce((count, term) => 
      count + (a.rawText.toLowerCase().match(new RegExp(term, 'g'))?.length || 0), 0);
    const bCount = terms.reduce((count, term) => 
      count + (b.rawText.toLowerCase().match(new RegExp(term, 'g'))?.length || 0), 0);
    return bCount - aCount;
  });
};

// Default categories for the system
export const defaultCategories: Category[] = [
  { id: '1', name: 'neighbors', hebrewName: 'דיני שכנים', psakCount: 0 },
  { id: '2', name: 'commerce', hebrewName: 'מסחר ותיווך', psakCount: 0 },
  { id: '3', name: 'rental', hebrewName: 'שכירות', psakCount: 0 },
  { id: '4', name: 'partnership', hebrewName: 'שותפות', psakCount: 0 },
  { id: '5', name: 'damages', hebrewName: 'נזיקין', psakCount: 0 },
  { id: '6', name: 'debts', hebrewName: 'חובות והלוואות', psakCount: 0 },
  { id: '7', name: 'contracts', hebrewName: 'חוזים והתחייבויות', psakCount: 0 },
  { id: '8', name: 'general', hebrewName: 'כללי', psakCount: 0 },
];

// Format date in Hebrew
export const formatHebrewDate = (date: Date): string => {
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Get reference type display name
export const getReferenceTypeName = (type: ReferenceType): string => {
  const names: Record<ReferenceType, string> = {
    gemara: 'גמרא',
    shulchan_aruch: 'שולחן ערוך',
    rambam: 'רמב"ם',
    tur: 'טור',
    mishna: 'משנה',
    tosefta: 'תוספתא',
    midrash: 'מדרש',
    responsa: 'שו"ת',
    other: 'אחר',
  };
  return names[type];
};
