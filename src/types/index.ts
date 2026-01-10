// Types for Psak Din (Rabbinic Ruling) application

export interface PsakDin {
  id: string;
  title: string;
  number: number;
  content: string; // HTML content
  rawText: string; // Plain text extracted
  dateAdded: Date;
  dateModified?: Date;
  categories: string[];
  tags: string[];
  references: Reference[];
  summary?: string;
  judges?: string[];
  parties?: string[];
  verdict?: string;
}

export interface Reference {
  id: string;
  type: ReferenceType;
  source: string;
  book?: string;
  chapter?: string;
  page?: string;
  section?: string;
  text: string;
  psakId: string;
  position: {
    start: number;
    end: number;
  };
}

export type ReferenceType = 
  | 'gemara'      // גמרא
  | 'shulchan_aruch' // שולחן ערוך
  | 'rambam'      // רמב"ם
  | 'tur'         // טור
  | 'mishna'      // משנה
  | 'tosefta'     // תוספתא
  | 'midrash'     // מדרש
  | 'responsa'    // שו"ת
  | 'other';      // אחר

export interface Category {
  id: string;
  name: string;
  hebrewName: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  psakCount: number;
}

export interface IndexEntry {
  id: string;
  term: string;
  termType: 'topic' | 'person' | 'source' | 'halacha' | 'concept';
  occurrences: IndexOccurrence[];
  relatedTerms: string[];
}

export interface IndexOccurrence {
  psakId: string;
  psakTitle: string;
  context: string;
  position: number;
}

export interface HolyBookConnection {
  id: string;
  bookType: ReferenceType;
  bookName: string;
  location: string;
  linkedPsakim: string[];
  description?: string;
}

export interface SearchResult {
  psak: PsakDin;
  score: number;
  highlights: string[];
  matchedTerms: string[];
}

export interface AppState {
  psakim: PsakDin[];
  categories: Category[];
  index: IndexEntry[];
  holyBookConnections: HolyBookConnection[];
  isLoading: boolean;
  error: string | null;
}

export interface UploadResult {
  success: boolean;
  psak?: PsakDin;
  error?: string;
  extractedReferences?: Reference[];
}
