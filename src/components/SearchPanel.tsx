import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  highlightSearchResults,
  removeHighlights,
  scrollToResult,
} from '../utils/search';

interface SearchPanelProps {
  contentRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  contentRef,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [caseSensitive] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history on mount
  useEffect(() => {
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim() || !contentRef.current) {
      // Clear if empty
      if (contentRef.current) {
        removeHighlights(contentRef.current);
      }
      setResultCount(0);
      setCurrentResultIndex(-1);
      return;
    }

    // Perform search
    const count = highlightSearchResults(contentRef.current, query, caseSensitive);
    setResultCount(count);
    setCurrentResultIndex(count > 0 ? 0 : -1);

    // Scroll to first result
    if (count > 0) {
      scrollToResult(contentRef.current, 0);
    }
    
    // Note: History functionality removed for simpler real-time search
  };

  const handleClearSearch = () => {
    if (contentRef.current) {
      removeHighlights(contentRef.current);
    }
    setSearchQuery('');
    setResultCount(0);
    setCurrentResultIndex(-1);
  };

  const handleNextResult = () => {
    if (resultCount === 0 || !contentRef.current) return;
    const nextIndex = (currentResultIndex + 1) % resultCount;
    setCurrentResultIndex(nextIndex);
    scrollToResult(contentRef.current, nextIndex);
  };

  const handlePrevResult = () => {
    if (resultCount === 0 || !contentRef.current) return;
    const prevIndex = currentResultIndex === 0 ? resultCount - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    scrollToResult(contentRef.current, prevIndex);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b-2 border-gold-400 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Search Input with Results */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleSearch(searchQuery);
                } else if (e.key === 'Escape') {
                  handleClearSearch();
                  onClose();
                }
              }}
              placeholder="חפש בעמוד... (Esc לסגירה)"
              className="w-full px-4 py-3 pr-10 border-2 border-gold-300 rounded-xl focus:outline-none focus:border-gold-500 text-right"
              dir="rtl"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
          </div>
          
          {/* Navigation Arrows when results found */}
          {resultCount > 0 && (
            <div className="flex items-center gap-2 bg-gold-50 px-3 py-2 rounded-xl border border-gold-300">
              <span className="text-sm font-bold text-navy-900 whitespace-nowrap">
                {currentResultIndex + 1} / {resultCount}
              </span>
              <button
                onClick={handlePrevResult}
                className="p-1.5 bg-white border border-gold-300 rounded-lg hover:bg-gold-100 transition-colors"
                title="תוצאה קודמת"
              >
                <ChevronRight className="w-4 h-4 text-navy-900" />
              </button>
              <button
                onClick={handleNextResult}
                className="p-1.5 bg-white border border-gold-300 rounded-lg hover:bg-gold-100 transition-colors"
                title="תוצאה הבאה"
              >
                <ChevronLeft className="w-4 h-4 text-navy-900" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => {
              handleClearSearch();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="סגור"
          >
            <X className="w-5 h-5 text-navy-700" />
          </button>
        </div>
        
        {/* No results message */}
        {searchQuery && resultCount === 0 && (
          <div className="mt-2 text-center text-sm text-red-600">
            לא נמצאו תוצאות
          </div>
        )}
      </div>
    </div>
  );
};

// Search Button Component
interface SearchButtonProps {
  onClick: () => void;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 text-navy-900 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40 flex items-center justify-center border-2 border-gold-400"
      title="חיפוש בעמוד"
    >
      <Search className="w-5 h-5" />
    </button>
  );
};
