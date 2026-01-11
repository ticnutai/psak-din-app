import React from 'react';
import { Pencil } from 'lucide-react';

interface EditingSidebarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  onTextStyle: (style: 'bold' | 'italic' | 'underline' | 'strike') => void;
  onHighlight: (color: string) => void;
  onReset: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

const EditingSidebar: React.FC<EditingSidebarProps> = ({
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  onTextStyle,
  onHighlight,
  onReset,
  isPinned = false,
  onTogglePin,
}) => {
  const fontSizeOptions = [
    { label: 'A-', value: 14 },
    { label: 'A', value: 16 },
    { label: 'A+', value: 18 },
    { label: 'A++', value: 20 },
  ];

  const lineHeightOptions = [
    { label: '1.0', value: 1.0 },
    { label: '1.5', value: 1.5 },
    { label: '2.0', value: 2.0 },
  ];

  const highlightColors = [
    { label: 'צהוב', color: '#fef08a', hex: 'yellow' },
    { label: 'ירוק', color: '#bbf7d0', hex: 'green' },
    { label: 'כחול', color: '#bfdbfe', hex: 'blue' },
    { label: 'אדום', color: '#fecaca', hex: 'red' },
  ];

  return (
    <div className="h-full flex flex-col relative">
      {/* Floating Icon Button */}
      {onTogglePin && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 group">
          <button
            onClick={onTogglePin}
            className={`
              w-8 h-8 rounded-full shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${isPinned 
                ? 'bg-gold-500 text-white hover:bg-gold-600' 
                : 'bg-white text-gold-600 hover:bg-gold-50 border-2 border-gold-400'
              }
            `}
            title={isPinned ? 'בטל הצמדה' : 'הצמד'}
          >
            <Pencil className="w-4 h-4" />
          </button>
          {/* Tooltip on hover */}
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div className="bg-navy-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg">
              {isPinned ? 'בטל הצמדה' : 'הצמד סיידבר'}
            </div>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="h-full bg-cream-100 border-2 border-gold-400 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 space-y-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-gold-400">
            <h2 className="text-xl font-bold text-navy-900">כלי עריכה</h2>
          </div>

          {/* Text Style Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => onTextStyle('bold')}
              className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all text-navy-900 font-bold flex items-center justify-center gap-2"
            >
              <span className="font-bold">B</span>
              <span>בולד</span>
            </button>
            <button
              onClick={() => onTextStyle('italic')}
              className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all text-navy-900 flex items-center justify-center gap-2"
            >
              <span className="italic">/</span>
              <span>נטוי</span>
            </button>
            <button
              onClick={() => onTextStyle('underline')}
              className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all text-navy-900 flex items-center justify-center gap-2"
            >
              <span className="underline">U</span>
              <span>קו תחתון</span>
            </button>
          </div>

          {/* Additional Actions */}
          <div className="space-y-2">
            <button
              className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all text-navy-900"
            >
              הוספת הערה
            </button>
            <button
              onClick={() => {
                // TODO: Save functionality
              }}
              className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all text-navy-900"
            >
              שמירה
            </button>
            <button
              onClick={() => window.print()}
              className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all text-navy-900"
            >
              הדפסה
            </button>
          </div>

          {/* Highlight Colors (Collapsed) */}
          <details className="group">
            <summary className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 cursor-pointer transition-all text-navy-900 list-none flex items-center justify-between">
              <span>הדגשות צבע</span>
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 space-y-2 pl-2">
              {highlightColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => onHighlight(color.hex)}
                  className="w-full px-4 py-2 border-2 rounded-lg transition-all text-right font-medium hover:shadow-md"
                  style={{
                    backgroundColor: color.color,
                    borderColor: '#eab308',
                    color: '#1e293b',
                  }}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </details>

          {/* Font Size (Collapsed) */}
          <details className="group">
            <summary className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 cursor-pointer transition-all text-navy-900 list-none flex items-center justify-between">
              <span>גודל טקסט</span>
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-2 pl-2">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFontSizeChange(option.value)}
                  className={`px-3 py-2 border-2 rounded-lg transition-all font-medium ${
                    fontSize === option.value
                      ? 'bg-gold-400 border-gold-500 text-navy-900'
                      : 'bg-white border-gold-400 text-navy-900 hover:bg-gold-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </details>

          {/* Line Height (Collapsed) */}
          <details className="group">
            <summary className="w-full px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 cursor-pointer transition-all text-navy-900 list-none flex items-center justify-between">
              <span>ריווח שורות</span>
              <span className="group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 grid grid-cols-3 gap-2 pl-2">
              {lineHeightOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onLineHeightChange(option.value)}
                  className={`px-3 py-2 border-2 rounded-lg transition-all font-medium ${
                    lineHeight === option.value
                      ? 'bg-gold-400 border-gold-500 text-navy-900'
                      : 'bg-white border-gold-400 text-navy-900 hover:bg-gold-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </details>

          {/* Reset */}
          <button
            onClick={onReset}
            className="w-full px-4 py-3 bg-red-50 border-2 border-red-300 rounded-xl hover:bg-red-100 hover:border-red-400 transition-all text-red-600 font-medium"
          >
            איפוס כל העיצוב
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditingSidebar;
