// Smart reference extraction and indexing for Gemara and other sources

export interface GemaraReference {
  masechet: string;
  daf: string;
  amud?: 'א' | 'ב';
  rawText: string;
  position: { start: number; end: number };
}

export interface SourceReference {
  type: 'gemara' | 'shulchan_aruch' | 'rambam' | 'mishna' | 'tur' | 'other';
  display: string;
  normalized: string; // For grouping
  details?: any;
  rawText: string;
  position: { start: number; end: number };
}

export interface SourceIndex {
  [normalizedSource: string]: {
    display: string;
    type: string;
    psakim: Array<{
      psakId: string;
      psakTitle: string;
      psakNumber: number;
      occurrences: Array<{
        text: string;
        position: { start: number; end: number };
      }>;
    }>;
  };
}

// Hebrew numerals to numbers
const hebrewNumerals: { [key: string]: number } = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
  'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
};

export function parseHebrewNumeral(hebrew: string | undefined): number {
  if (!hebrew || typeof hebrew !== 'string') return 0;
  
  let total = 0;
  for (const char of hebrew) {
    total += hebrewNumerals[char] || 0;
  }
  return total;
}

// All masechot names (normalized)
const MASECHOT = [
  // Seder Zeraim
  'ברכות',
  // Seder Moed
  'שבת', 'עירובין', 'פסחים', 'שקלים', 'יומא', 'סוכה', 'ביצה', 'ראש השנה',
  'תענית', 'מגילה', 'מועד קטן', 'חגיגה',
  // Seder Nashim
  'יבמות', 'כתובות', 'נדרים', 'נזיר', 'סוטה', 'גיטין', 'קידושין',
  // Seder Nezikin
  'בבא קמא', 'בבא מציעא', 'בבא בתרא', 'סנהדרין', 'מכות', 'שבועות',
  'עדויות', 'עבודה זרה', 'אבות', 'הוריות',
  // Seder Kodashim
  'זבחים', 'מנחות', 'חולין', 'בכורות', 'ערכין', 'תמורה', 'כריתות',
  'מעילה', 'תמיד', 'מידות', 'קנים',
  // Seder Taharot
  'כלים', 'אהלות', 'נגעים', 'פרה', 'טהרות', 'מקואות', 'נידה',
  'מכשירין', 'זבים', 'טבול יום', 'ידים', 'עוקצין',
];

// Extract Gemara references with advanced pattern matching
export function extractGemaraReferences(text: string): GemaraReference[] {
  const references: GemaraReference[] = [];
  
  // Pattern 1: "גמרא [בבלי/ירושלמי] מסכת דף עמוד"
  const pattern1 = /(?:גמ(?:רא|')?|תלמוד)\s*(?:בבלי|ירושלמי)?\s*(?:מס(?:כת)?)?\s*([\u0590-\u05FF\s]+?)\s+(?:דף\s*)?([א-ת]{1,3})(?:\s*(?:עמוד|עמ')?\s*([אב]))?/gi;
  
  // Pattern 2: "מסכת דף עמוד" (without "גמרא" prefix)
  const pattern2 = /(?:^|[^\u0590-\u05FF])(?:מס(?:כת)?)?\s*(שבת|עירובין|פסחים|יומא|סוכה|ביצה|ראש השנה|תענית|מגילה|מועד קטן|חגיגה|יבמות|כתובות|נדרים|נזיר|סוטה|גיטין|קידושין|בבא קמא|בבא מציעא|בבא בתרא|סנהדרין|מכות|שבועות|עבודה זרה|הוריות|זבחים|מנחות|חולין|בכורות|ערכין|תמורה|כריתות|מעילה|ברכות)\s+(?:דף\s*)?([א-ת]{1,3})(?:\s*(?:עמוד|עמ')?\s*([אב]))?/gi;
  
  // Pattern 3: Abbreviated "ב"מ כו." or "ב"ק נ:"
  const pattern3 = /(?:ב"ק|ב"מ|ב"ב|ש"ע|או"ח)\s*([א-ת]{1,3})(?:\s*([אב]))?/g;
  
  const processMatch = (match: RegExpExecArray, masechet: string) => {
    const daf = match[2];
    const amud = match[3] as 'א' | 'ב' | undefined;
    
    // Validate inputs
    if (!masechet || !daf) return;
    
    // Validate masechet is in our list
    const normalizedMasechet = normalizeMasechet(masechet);
    if (!normalizedMasechet) return;
    
    references.push({
      masechet: normalizedMasechet,
      daf,
      amud,
      rawText: match[0],
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
    });
  };
  
  let match;
  
  // Process pattern 1
  while ((match = pattern1.exec(text)) !== null) {
    processMatch(match, match[1].trim());
  }
  
  // Process pattern 2
  pattern2.lastIndex = 0;
  while ((match = pattern2.exec(text)) !== null) {
    processMatch(match, match[1].trim());
  }
  
  // Process pattern 3 (abbreviated)
  while ((match = pattern3.exec(text)) !== null) {
    const abbrev = match[0].substring(0, match[0].indexOf(' '));
    const fullName = expandAbbreviation(abbrev);
    if (fullName) {
      processMatch(match, fullName);
    }
  }
  
  return references;
}

function normalizeMasechet(masechet: string): string | null {
  const cleaned = masechet.trim().replace(/\s+/g, ' ');
  
  // Check if it's already in the list
  if (MASECHOT.includes(cleaned)) {
    return cleaned;
  }
  
  // Try to find partial match
  for (const m of MASECHOT) {
    if (m.includes(cleaned) || cleaned.includes(m)) {
      return m;
    }
  }
  
  return null;
}

function expandAbbreviation(abbrev: string): string | null {
  const abbreviations: { [key: string]: string } = {
    'ב"ק': 'בבא קמא',
    'ב"מ': 'בבא מציעא',
    'ב"ב': 'בבא בתרא',
    'או"ח': 'אורח חיים',
    'ש"ע': 'שולחן ערוך',
    'יו"ד': 'יורה דעה',
    'אה"ע': 'אבן העזר',
    'חו"מ': 'חושן משפט',
  };
  
  return abbreviations[abbrev] || null;
}

// Extract all source references (Gemara, Shulchan Aruch, etc.)
export function extractAllSources(text: string): SourceReference[] {
  const sources: SourceReference[] = [];
  
  // 1. Extract Gemara
  const gemaraRefs = extractGemaraReferences(text);
  for (const ref of gemaraRefs) {
    sources.push({
      type: 'gemara',
      display: `${ref.masechet} ${ref.daf}${ref.amud ? ` ${ref.amud}` : ''}`,
      normalized: `gemara:${ref.masechet}:${parseHebrewNumeral(ref.daf)}${ref.amud || ''}`,
      details: ref,
      rawText: ref.rawText,
      position: ref.position,
    });
  }
  
  // 2. Extract Shulchan Aruch
  const saPattern = /(?:שו"ע|שולחן\s+ערוך)\s*(?:או"ח|אורח\s+חיים|יו"ד|יורה\s+דעה|אה"ע|אבן\s+העזר|חו"מ|חושן\s+משפט)\s*(?:סי(?:מן)?['\.]?\s*)?(\d+)/gi;
  let match;
  while ((match = saPattern.exec(text)) !== null) {
    sources.push({
      type: 'shulchan_aruch',
      display: match[0],
      normalized: `sa:${match[1]}`,
      rawText: match[0],
      position: { start: match.index, end: match.index + match[0].length },
    });
  }
  
  // 3. Extract Rambam
  const rambamPattern = /(?:רמב"ם|משנה\s+תורה)\s+(?:הל(?:כות)?)?\s*([\u0590-\u05FF\s]+?)\s+פ(?:רק)?['\.]?\s*(\d+)/gi;
  while ((match = rambamPattern.exec(text)) !== null) {
    sources.push({
      type: 'rambam',
      display: `רמב"ם ${match[1]} פרק ${match[2]}`,
      normalized: `rambam:${match[1]}:${match[2]}`,
      rawText: match[0],
      position: { start: match.index, end: match.index + match[0].length },
    });
  }
  
  return sources;
}

// Build index from multiple psakim
export function buildSourceIndex(psakim: Array<{ id: string; title: string; number: number; rawText: string }>): SourceIndex {
  const index: SourceIndex = {};
  
  for (const psak of psakim) {
    const sources = extractAllSources(psak.rawText);
    
    for (const source of sources) {
      if (!index[source.normalized]) {
        index[source.normalized] = {
          display: source.display,
          type: source.type,
          psakim: [],
        };
      }
      
      // Find or create psak entry
      let psakEntry = index[source.normalized].psakim.find(p => p.psakId === psak.id);
      if (!psakEntry) {
        psakEntry = {
          psakId: psak.id,
          psakTitle: psak.title,
          psakNumber: psak.number,
          occurrences: [],
        };
        index[source.normalized].psakim.push(psakEntry);
      }
      
      // Add occurrence with context
      const contextStart = Math.max(0, source.position.start - 50);
      const contextEnd = Math.min(psak.rawText.length, source.position.end + 50);
      const contextText = psak.rawText.substring(contextStart, contextEnd);
      
      psakEntry.occurrences.push({
        text: contextText,
        position: source.position,
      });
    }
  }
  
  return index;
}

// Get sorted list of sources by frequency
export function getSourcesByFrequency(index: SourceIndex): Array<{ source: string; display: string; type: string; count: number }> {
  return Object.entries(index)
    .map(([source, data]) => ({
      source,
      display: data.display,
      type: data.type,
      count: data.psakim.reduce((sum, p) => sum + p.occurrences.length, 0),
    }))
    .sort((a, b) => b.count - a.count);
}
