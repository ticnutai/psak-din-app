import { Annotation } from '../components/ViewSettingsPanel';

export type { Annotation };

const ANNOTATIONS_KEY = 'annotations-storage';
const VIEW_SETTINGS_KEY = 'view-settings-storage';

// Annotations Storage
export interface AnnotationsStore {
  [documentId: string]: Annotation[];
}

export const getAnnotations = (documentId: string): Annotation[] => {
  try {
    const stored = localStorage.getItem(ANNOTATIONS_KEY);
    if (!stored) return [];
    const store: AnnotationsStore = JSON.parse(stored);
    return store[documentId] || [];
  } catch {
    return [];
  }
};

export const saveAnnotations = (documentId: string, annotations: Annotation[]): void => {
  try {
    const stored = localStorage.getItem(ANNOTATIONS_KEY);
    const store: AnnotationsStore = stored ? JSON.parse(stored) : {};
    store[documentId] = annotations;
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving annotations:', err);
  }
};

export const addAnnotation = (documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>): Annotation => {
  const newAnnotation: Annotation = {
    ...annotation,
    id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  
  const annotations = getAnnotations(documentId);
  annotations.push(newAnnotation);
  saveAnnotations(documentId, annotations);
  
  return newAnnotation;
};

export const removeAnnotation = (documentId: string, annotationId: string): void => {
  const annotations = getAnnotations(documentId);
  const filtered = annotations.filter(a => a.id !== annotationId);
  saveAnnotations(documentId, filtered);
};

export const updateAnnotation = (
  documentId: string, 
  annotationId: string, 
  updates: Partial<Omit<Annotation, 'id' | 'createdAt'>>
): void => {
  const annotations = getAnnotations(documentId);
  const index = annotations.findIndex(a => a.id === annotationId);
  if (index !== -1) {
    annotations[index] = { ...annotations[index], ...updates };
    saveAnnotations(documentId, annotations);
  }
};

// View Settings Storage (global)
export interface StoredViewSettings {
  fontSize: number;
  fontFamily: 'david' | 'miriam' | 'arial' | 'frank';
  lineHeight: number;
  wordSpacing: number;
  viewMode: 'normal' | 'split' | 'focused' | 'wide';
}

export const getViewSettings = (): StoredViewSettings => {
  try {
    const stored = localStorage.getItem(VIEW_SETTINGS_KEY);
    if (!stored) {
      return {
        fontSize: 18,
        fontFamily: 'frank',
        lineHeight: 1.8,
        wordSpacing: 2,
        viewMode: 'normal',
      };
    }
    return JSON.parse(stored);
  } catch {
    return {
      fontSize: 18,
      fontFamily: 'frank',
      lineHeight: 1.8,
      wordSpacing: 2,
      viewMode: 'normal',
    };
  }
};

export const saveViewSettings = (settings: StoredViewSettings): void => {
  try {
    localStorage.setItem(VIEW_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving view settings:', err);
  }
};

// Document-specific content storage (for edited content)
const CONTENT_KEY = 'content-storage';

export interface ContentStore {
  [documentId: string]: {
    content: string;
    lastModified: Date;
  };
}

export const getSavedContent = (documentId: string): string | null => {
  try {
    const stored = localStorage.getItem(CONTENT_KEY);
    if (!stored) return null;
    const store: ContentStore = JSON.parse(stored);
    return store[documentId]?.content || null;
  } catch {
    return null;
  }
};

export const saveContent = (documentId: string, content: string): void => {
  try {
    const stored = localStorage.getItem(CONTENT_KEY);
    const store: ContentStore = stored ? JSON.parse(stored) : {};
    store[documentId] = {
      content,
      lastModified: new Date(),
    };
    localStorage.setItem(CONTENT_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving content:', err);
  }
};

export const clearSavedContent = (documentId: string): void => {
  try {
    const stored = localStorage.getItem(CONTENT_KEY);
    if (!stored) return;
    const store: ContentStore = JSON.parse(stored);
    delete store[documentId];
    localStorage.setItem(CONTENT_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error clearing content:', err);
  }
};
