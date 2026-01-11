/**
 * Search utilities for managing search history and text search functionality
 */

const SEARCH_HISTORY_KEY = 'search-history';
const MAX_HISTORY_ITEMS = 20;

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  pageType: 'psak' | 'source';
  pageId: string;
}

export interface SearchResult {
  index: number;
  text: string;
  context: string;
  startOffset: number;
  endOffset: number;
}

/**
 * Get search history from localStorage
 */
export const getSearchHistory = (pageType?: 'psak' | 'source', pageId?: string): SearchHistoryItem[] => {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!stored) return [];
    
    let history: SearchHistoryItem[] = JSON.parse(stored);
    
    // Filter by page if specified
    if (pageType && pageId) {
      history = history.filter(item => item.pageType === pageType && item.pageId === pageId);
    }
    
    // Sort by timestamp (newest first)
    return history.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
};

/**
 * Add search query to history
 */
export const addToSearchHistory = (
  query: string,
  pageType: 'psak' | 'source',
  pageId: string
): SearchHistoryItem => {
  const history = getSearchHistory();
  
  // Check if query already exists for this page
  const existingIndex = history.findIndex(
    item => item.query === query && item.pageType === pageType && item.pageId === pageId
  );
  
  // If exists, update timestamp and move to top
  if (existingIndex !== -1) {
    const existing = history[existingIndex];
    existing.timestamp = Date.now();
    history.splice(existingIndex, 1);
    history.unshift(existing);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    return existing;
  }
  
  // Create new history item
  const newItem: SearchHistoryItem = {
    id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    query,
    timestamp: Date.now(),
    pageType,
    pageId,
  };
  
  // Add to beginning of array
  history.unshift(newItem);
  
  // Limit history size
  if (history.length > MAX_HISTORY_ITEMS) {
    history.splice(MAX_HISTORY_ITEMS);
  }
  
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  return newItem;
};

/**
 * Remove item from search history
 */
export const removeFromSearchHistory = (id: string): void => {
  const history = getSearchHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
};

/**
 * Clear all search history
 */
export const clearSearchHistory = (): void => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
};

/**
 * Search for text in HTML content and return all matches
 */
export const searchInContent = (
  content: string,
  query: string,
  caseSensitive: boolean = false
): SearchResult[] => {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  // Remove HTML tags for searching
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Prepare search query
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const searchText = caseSensitive ? plainText : plainText.toLowerCase();
  
  // Find all occurrences
  let startIndex = 0;
  while (true) {
    const index = searchText.indexOf(searchQuery, startIndex);
    if (index === -1) break;
    
    // Extract context (50 chars before and after)
    const contextStart = Math.max(0, index - 50);
    const contextEnd = Math.min(plainText.length, index + query.length + 50);
    const context = plainText.substring(contextStart, contextEnd);
    
    results.push({
      index: results.length,
      text: plainText.substring(index, index + query.length),
      context: `...${context}...`,
      startOffset: index,
      endOffset: index + query.length,
    });
    
    startIndex = index + query.length;
  }
  
  return results;
};

/**
 * Highlight search results in a DOM element
 */
export const highlightSearchResults = (
  element: HTMLElement,
  query: string,
  caseSensitive: boolean = false
): number => {
  if (!query.trim()) return 0;
  
  // Remove existing highlights
  removeHighlights(element);
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  const nodesToHighlight: { node: Text; matches: RegExpMatchArray }[] = [];
  
  // Build regex
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(escapeRegex(query), flags);
  
  // Find all text nodes with matches
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const matches = textNode.textContent?.match(regex);
    if (matches) {
      nodesToHighlight.push({ node: textNode, matches });
    }
  }
  
  // Highlight matches
  let totalMatches = 0;
  nodesToHighlight.forEach(({ node }) => {
    const parent = node.parentNode;
    if (!parent) return;
    
    const text = node.textContent || '';
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    // Use a fresh regex for each node
    const nodeRegex = new RegExp(escapeRegex(query), flags);
    let match;
    
    while ((match = nodeRegex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.substring(lastIndex, match.index))
        );
      }
      
      // Add highlighted match
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.style.backgroundColor = '#fef08a';
      mark.style.padding = '2px 0';
      mark.style.borderRadius = '3px';
      mark.style.fontWeight = 'bold';
      mark.dataset.searchHighlight = 'true';
      mark.textContent = match[0];
      fragment.appendChild(mark);
      
      lastIndex = match.index + match[0].length;
      totalMatches++;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
    
    parent.replaceChild(fragment, node);
  });
  
  return totalMatches;
};

/**
 * Remove all search highlights from element
 */
export const removeHighlights = (element: HTMLElement): void => {
  const highlights = element.querySelectorAll('[data-search-highlight="true"]');
  highlights.forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(
        document.createTextNode(mark.textContent || ''),
        mark
      );
      // Normalize to merge adjacent text nodes
      parent.normalize();
    }
  });
};

/**
 * Scroll to specific search result
 */
export const scrollToResult = (element: HTMLElement, resultIndex: number): void => {
  const highlights = element.querySelectorAll('[data-search-highlight="true"]');
  if (resultIndex >= 0 && resultIndex < highlights.length) {
    const target = highlights[resultIndex] as HTMLElement;
    
    // Remove previous active highlight
    highlights.forEach(h => h.classList.remove('search-highlight-active'));
    
    // Add active class
    target.classList.add('search-highlight-active');
    target.style.backgroundColor = '#fde047';
    
    // Scroll into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/**
 * Escape special regex characters
 */
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
