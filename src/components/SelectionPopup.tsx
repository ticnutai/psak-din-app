import React, { useState, useEffect, useRef } from 'react';

interface SelectionPopupProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const SelectionPopup: React.FC<SelectionPopupProps> = ({ containerRef }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const highlightColors = [
    { name: 'צהוב', color: '#fef08a' },
    { name: 'ירוק', color: '#bbf7d0' },
    { name: 'כחול', color: '#bfdbfe' },
    { name: 'אדום', color: '#fecaca' },
    { name: 'סגול', color: '#e9d5ff' },
    { name: 'כתום', color: '#fed7aa' },
    { name: 'ורוד', color: '#fce7f3' },
    { name: 'טורקיז', color: '#99f6e4' },
  ];

  const textColors = [
    { name: 'זהב', color: '#d97706' },
    { name: 'אדום', color: '#dc2626' },
    { name: 'כחול', color: '#2563eb' },
    { name: 'ירוק', color: '#16a34a' },
    { name: 'סגול', color: '#9333ea' },
    { name: 'שחור', color: '#1e293b' },
  ];

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setVisible(false);
        return;
      }

      // Check if selection is within our container
      if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) {
        setVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Position popup above the selection with proper offset
      const containerRect = containerRef.current?.getBoundingClientRect();
      const scrollTop = containerRef.current?.scrollTop || 0;
      
      if (containerRect) {
        // Calculate position above the selection
        const popupHeight = 280; // Approximate popup height
        let top = rect.top - containerRect.top + scrollTop - popupHeight - 15;
        
        // If popup would go above container, position below selection instead
        if (top < 0) {
          top = rect.bottom - containerRect.top + scrollTop + 15;
        }
        
        // Center horizontally on selection
        let left = rect.left - containerRect.left + (rect.width / 2) - 150;
        
        // Keep within container bounds
        left = Math.max(10, Math.min(left, containerRect.width - 320));
        
        setPosition({ top, left });
      }
      
      setVisible(true);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [containerRef]);

  // Hide popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        // Don't hide immediately to allow button clicks
        setTimeout(() => {
          const selection = window.getSelection();
          if (!selection || selection.isCollapsed) {
            setVisible(false);
          }
        }, 100);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyStyle = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Keep selection after applying style
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      setVisible(true);
    }
  };

  const applyHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.style.padding = '1px 3px';
    span.style.borderRadius = '3px';
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // If selection spans multiple elements, use execCommand as fallback
      document.execCommand('hiliteColor', false, color);
    }
  };

  const applyTextColor = (color: string) => {
    document.execCommand('foreColor', false, color);
  };

  const clearFormatting = () => {
    document.execCommand('removeFormat', false);
  };

  const copyText = async () => {
    const selection = window.getSelection();
    if (selection) {
      try {
        await navigator.clipboard.writeText(selection.toString());
      } catch (e) {
        document.execCommand('copy');
      }
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-50 animate-fade-in"
      style={{
        top: `${Math.max(10, position.top)}px`,
        left: `${Math.max(10, position.left)}px`,
      }}
    >
      <div className="bg-white border-2 border-mouse-400 rounded-xl shadow-2xl p-3 min-w-[300px]">
        {/* Arrow pointing down */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-mouse-400 rotate-45"></div>
        
        {/* Header */}
        <div className="text-center mb-3 pb-2 border-b border-mouse-200">
          <span className="text-gold-600 font-bold text-sm">כלי עיצוב מהיר</span>
        </div>

        {/* Text Styling */}
        <div className="mb-3">
          <div className="text-xs text-gold-500 font-bold mb-2 text-right">עיצוב טקסט</div>
          <div className="flex gap-1 justify-center flex-wrap">
            <button
              onClick={() => applyStyle('bold')}
              className="px-3 py-1.5 bg-mouse-100 hover:bg-gold-100 border border-mouse-300 hover:border-gold-400 rounded-lg text-gold-700 font-bold transition-all text-sm"
              title="מודגש"
            >
              B
            </button>
            <button
              onClick={() => applyStyle('italic')}
              className="px-3 py-1.5 bg-mouse-100 hover:bg-gold-100 border border-mouse-300 hover:border-gold-400 rounded-lg text-gold-700 italic transition-all text-sm"
              title="נטוי"
            >
              I
            </button>
            <button
              onClick={() => applyStyle('underline')}
              className="px-3 py-1.5 bg-mouse-100 hover:bg-gold-100 border border-mouse-300 hover:border-gold-400 rounded-lg text-gold-700 underline transition-all text-sm"
              title="קו תחתון"
            >
              U
            </button>
            <button
              onClick={() => applyStyle('strikeThrough')}
              className="px-3 py-1.5 bg-mouse-100 hover:bg-gold-100 border border-mouse-300 hover:border-gold-400 rounded-lg text-gold-700 line-through transition-all text-sm"
              title="קו חוצה"
            >
              S
            </button>
            <button
              onClick={() => applyStyle('superscript')}
              className="px-3 py-1.5 bg-mouse-100 hover:bg-gold-100 border border-mouse-300 hover:border-gold-400 rounded-lg text-gold-700 transition-all text-sm"
              title="כתב עילי"
            >
              X²
            </button>
            <button
              onClick={() => applyStyle('subscript')}
              className="px-3 py-1.5 bg-mouse-100 hover:bg-gold-100 border border-mouse-300 hover:border-gold-400 rounded-lg text-gold-700 transition-all text-sm"
              title="כתב תחתי"
            >
              X₂
            </button>
          </div>
        </div>

        {/* Highlight Colors */}
        <div className="mb-3">
          <div className="text-xs text-gold-500 font-bold mb-2 text-right">צבע רקע</div>
          <div className="flex gap-1 justify-center flex-wrap">
            {highlightColors.map((c) => (
              <button
                key={c.color}
                onClick={() => applyHighlight(c.color)}
                className="w-7 h-7 rounded-lg border-2 border-mouse-300 hover:border-gold-500 transition-all hover:scale-110"
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Text Colors */}
        <div className="mb-3">
          <div className="text-xs text-gold-500 font-bold mb-2 text-right">צבע טקסט</div>
          <div className="flex gap-1 justify-center flex-wrap">
            {textColors.map((c) => (
              <button
                key={c.color}
                onClick={() => applyTextColor(c.color)}
                className="w-7 h-7 rounded-lg border-2 border-mouse-300 hover:border-gold-500 transition-all hover:scale-110 flex items-center justify-center font-bold text-sm"
                style={{ color: c.color }}
                title={c.name}
              >
                A
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center pt-2 border-t border-mouse-200">
          <button
            onClick={copyText}
            className="px-3 py-1.5 bg-gold-100 hover:bg-gold-200 border border-gold-300 rounded-lg text-gold-700 font-medium transition-all text-xs"
          >
            העתק
          </button>
          <button
            onClick={clearFormatting}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 font-medium transition-all text-xs"
          >
            נקה עיצוב
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionPopup;
