import { useParams, Link, useLocation } from 'react-router-dom';
import { PsakDin } from '../types';
import { formatHebrewDate, getReferenceTypeName } from '../utils/psakUtils';
import { 
  ArrowRight, 
  FileText, 
  Calendar, 
  Tag, 
  BookOpen,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  Plus,
  X,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { extractAllSources } from '../utils/smartReferences';

interface PsakViewProps {
  psakim: PsakDin[];
}

// Selection Popup Component
const SelectionPopup = ({ 
  position, 
  onAction, 
  onClose 
}: { 
  position: { x: number; y: number }; 
  onAction: (action: string, color?: string) => void;
  onClose: () => void;
}) => {
  const colors = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff'];
  
  return (
    <div 
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gold-300 p-2 flex gap-1"
      style={{ 
        top: position.y - 50, 
        left: position.x,
        transform: 'translateX(-50%)'
      }}
    >
      <button 
        onClick={() => onAction('bold')}
        className="px-2 py-1 hover:bg-gold-100 rounded font-bold text-sm"
        title="הדגשה"
      >
        B
      </button>
      <button 
        onClick={() => onAction('italic')}
        className="px-2 py-1 hover:bg-gold-100 rounded italic text-sm"
        title="נטוי"
      >
        I
      </button>
      <button 
        onClick={() => onAction('underline')}
        className="px-2 py-1 hover:bg-gold-100 rounded underline text-sm"
        title="קו תחתון"
      >
        U
      </button>
      <div className="w-px bg-gray-300 mx-1" />
      {colors.map(color => (
        <button
          key={color}
          onClick={() => onAction('highlight', color)}
          className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
          title="צביעה"
        />
      ))}
      <div className="w-px bg-gray-300 mx-1" />
      <button 
        onClick={onClose}
        className="px-2 py-1 hover:bg-red-100 rounded text-red-500 text-sm"
      >
        ✕
      </button>
    </div>
  );
};

// Editing Panel Component
const EditingPanel = ({ 
  isOpen, 
  onClose,
  onAction,
  currentViewMode
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onAction: (action: string, value?: string) => void;
  currentViewMode?: string;
}) => {
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState('Frank Ruhl Libre');
  const [fontColor, setFontColor] = useState('#102a43');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl border border-gold-300 p-6 w-96 max-h-[80vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-navy-900">כלי עריכה מקצועיים</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg p-2 transition-all text-xl font-bold"
            title="סגור (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Text Styling */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">עיצוב טקסט</h4>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => onAction('bold')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg font-bold" title="Ctrl+B">B</button>
            <button onClick={() => onAction('italic')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg italic" title="Ctrl+I">I</button>
            <button onClick={() => onAction('underline')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg underline" title="Ctrl+U">U</button>
            <button onClick={() => onAction('strikethrough')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg line-through">S</button>
            <button onClick={() => onAction('superscript')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">עילי<sup>2</sup></button>
            <button onClick={() => onAction('subscript')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">תחתי<sub>2</sub></button>
          </div>
        </div>

        {/* Highlighting */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">צביעה והדגשה</h4>
          <div className="flex gap-2">
            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff'].map(color => (
              <button
                key={color}
                onClick={() => onAction('highlight', color)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title="צביעה"
                aria-label={`צבע ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">גודל גופן: {fontSize}px</h4>
          <input
            type="range"
            min="12"
            max="28"
            value={28 - fontSize + 12}
            onChange={(e) => {
              const size = 28 - Number(e.target.value) + 12;
              setFontSize(size);
              onAction('fontSize', `${size}px`);
            }}
            className="w-full mb-2 styled-slider"
            title="גודל גופן"
            aria-label="גודל גופן"
            style={{ direction: 'ltr' }}
          />
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => { setFontSize(14); onAction('fontSize', '14px'); }} className="px-2 py-1 bg-mouse-100 hover:bg-gold-200 rounded text-xs transition-colors">14</button>
            <button onClick={() => { setFontSize(16); onAction('fontSize', '16px'); }} className="px-2 py-1 bg-mouse-100 hover:bg-gold-200 rounded text-xs transition-colors">16</button>
            <button onClick={() => { setFontSize(18); onAction('fontSize', '18px'); }} className="px-2 py-1 bg-mouse-100 hover:bg-gold-200 rounded text-xs transition-colors">18</button>
            <button onClick={() => { setFontSize(20); onAction('fontSize', '20px'); }} className="px-2 py-1 bg-mouse-100 hover:bg-gold-200 rounded text-xs transition-colors">20</button>
            <button onClick={() => { setFontSize(24); onAction('fontSize', '24px'); }} className="px-2 py-1 bg-mouse-100 hover:bg-gold-200 rounded text-xs transition-colors">24</button>
          </div>
        </div>

        {/* Line Height */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">ריווח שורות: {lineHeight}</h4>
          <input
            type="range"
            min="1"
            max="2.5"
            step="0.1"
            value={3.5 - lineHeight}
            onChange={(e) => {
              const lh = 3.5 - Number(e.target.value);
              setLineHeight(lh);
              onAction('lineHeight', `${lh}`);
            }}
            className="w-full styled-slider"
            title="ריווח שורות"
            aria-label="ריווח שורות"
            style={{ direction: 'ltr' }}
          />
        </div>

        {/* Font Family */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">גופן</h4>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              onAction('fontFamily', e.target.value);
            }}
            className="w-full p-2 border border-gold-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
          >
            <option value="Frank Ruhl Libre">פרנק רוהל ליברה (ברירת מחדל)</option>
            <option value="Arial">Arial</option>
            <option value="David">David</option>
            <option value="Narkisim">Narkisim</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        {/* Font Color */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">צבע טקסט</h4>
          <div className="flex gap-2 items-center mb-2">
            <input
              type="color"
              value={fontColor}
              onChange={(e) => {
                setFontColor(e.target.value);
                onAction('fontColor', e.target.value);
              }}
              className="w-16 h-10 rounded-lg border border-gold-300 cursor-pointer"
            />
            <span className="text-sm text-mouse-500 flex-1">{fontColor}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => { setFontColor('#102a43'); onAction('fontColor', '#102a43'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#102a43'}} title="כהה" />
            <button onClick={() => { setFontColor('#000000'); onAction('fontColor', '#000000'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#000000'}} title="שחור" />
            <button onClick={() => { setFontColor('#334155'); onAction('fontColor', '#334155'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#334155'}} title="אפור כהה" />
            <button onClick={() => { setFontColor('#64748b'); onAction('fontColor', '#64748b'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#64748b'}} title="אפור" />
            <button onClick={() => { setFontColor('#dc2626'); onAction('fontColor', '#dc2626'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#dc2626'}} title="אדום" />
            <button onClick={() => { setFontColor('#ea580c'); onAction('fontColor', '#ea580c'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#ea580c'}} title="כתום" />
            <button onClick={() => { setFontColor('#C9A227'); onAction('fontColor', '#C9A227'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#C9A227'}} title="זהב" />
            <button onClick={() => { setFontColor('#16a34a'); onAction('fontColor', '#16a34a'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#16a34a'}} title="ירוק" />
            <button onClick={() => { setFontColor('#2563eb'); onAction('fontColor', '#2563eb'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#2563eb'}} title="כחול" />
            <button onClick={() => { setFontColor('#9333ea'); onAction('fontColor', '#9333ea'); }} className="w-8 h-8 rounded border-2 border-gray-300" style={{backgroundColor: '#9333ea'}} title="סגול" />
          </div>
        </div>

        {/* View Modes */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">תצוגה</h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onAction('view', 'split')} 
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentViewMode === 'split' 
                  ? 'bg-gold-500 text-white shadow-lg' 
                  : 'bg-gold-100 hover:bg-gold-200'
              }`}
            >
              מפוצל
            </button>
            <button 
              onClick={() => onAction('view', 'splitInPsak')} 
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentViewMode === 'splitInPsak' 
                  ? 'bg-gold-500 text-white shadow-lg' 
                  : 'bg-gold-100 hover:bg-gold-200'
              }`}
              title="פיצול בפסק"
            >
              פיצול בפסק
            </button>
            <button 
              onClick={() => onAction('view', 'full')} 
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentViewMode === 'full' 
                  ? 'bg-gold-500 text-white shadow-lg' 
                  : 'bg-gold-100 hover:bg-gold-200'
              }`}
            >
              מסך מלא
            </button>
          </div>
        </div>

        {/* Text Alignment */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">יישור טקסט</h4>
          <div className="flex gap-2">
            <button onClick={() => onAction('align', 'right')} className="flex-1 px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-sm">ימין</button>
            <button onClick={() => onAction('align', 'center')} className="flex-1 px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-sm">מרכז</button>
            <button onClick={() => onAction('align', 'left')} className="flex-1 px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-sm">שמאל</button>
            <button onClick={() => onAction('align', 'justify')} className="flex-1 px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-sm">מיושר</button>
          </div>
        </div>

        {/* Background Color */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">רקע</h4>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              defaultValue="#ffffff"
              onChange={(e) => onAction('bgColor', e.target.value)}
              className="w-16 h-10 rounded-lg border border-gold-300 cursor-pointer"
              title="צבע רקע"
            />
            <button onClick={() => onAction('bgColor', '#ffffff')} className="px-3 py-2 bg-mouse-100 hover:bg-mouse-200 rounded-lg text-sm">איפוס רקע</button>
          </div>
        </div>

        {/* Lists */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">רשימות ועיצוב</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onAction('list', 'ordered')} className="px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">רשימה 1,2,3</button>
            <button onClick={() => onAction('list', 'unordered')} className="px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">רשימה עם תבליטים</button>
            <button onClick={() => onAction('indent', 'increase')} className="px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">הזז ימינה →</button>
            <button onClick={() => onAction('indent', 'decrease')} className="px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">הזז שמאלה ←</button>
            <button onClick={() => onAction('blockquote')} className="px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">ציטוט</button>
            <button onClick={() => onAction('hr')} className="px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">קו מפריד</button>
          </div>
        </div>

        {/* Text Case */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">אותיות</h4>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onAction('textCase', 'upper')} className="px-2 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">ABC</button>
            <button onClick={() => onAction('textCase', 'lower')} className="px-2 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">abc</button>
            <button onClick={() => onAction('textCase', 'capitalize')} className="px-2 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-xs">Abc</button>
          </div>
        </div>

        {/* Find & Replace */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">חיפוש והחלפה</h4>
          <button onClick={() => onAction('findReplace')} className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 text-sm font-medium">
            פתח חיפוש והחלפה
          </button>
        </div>

        {/* Links & Tables */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">קישורים וטבלאות</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onAction('insertLink')} className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 text-xs font-medium">הוסף קישור 🔗</button>
            <button onClick={() => onAction('removeLink')} className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 text-xs">הסר קישור</button>
            <button onClick={() => onAction('insertTable')} className="px-3 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-700 text-xs font-medium col-span-2">הוסף טבלה 📊</button>
          </div>
        </div>

        {/* Notes & Questions */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">הערות ושאלות</h4>
          <button onClick={() => onAction('openNotes')} className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-bold flex items-center justify-center gap-2 shadow-lg">
            <MessageSquare className="w-5 h-5" />
            פתח פאנל הערות
          </button>
        </div>

        {/* Actions */}
        <div>
          <h4 className="font-bold text-navy-800 mb-3">פעולות</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onAction('reset')} className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 text-sm">איפוס עיצוב</button>
            <button onClick={() => onAction('copy')} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 text-sm">העתק טקסט</button>
            <button onClick={() => onAction('print')} className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 text-sm">הדפסה</button>
            <button onClick={() => onAction('selectAll')} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-700 text-sm">בחר הכל</button>
            <button onClick={() => onAction('undo')} className="px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg text-orange-700 text-sm">בטל פעולה</button>
            <button onClick={() => onAction('redo')} className="px-4 py-2 bg-teal-100 hover:bg-teal-200 rounded-lg text-teal-700 text-sm">בצע מחדש</button>
            <button onClick={() => onAction('removeFormat')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm">הסר עיצוב</button>
            <button onClick={() => onAction('save')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-gold-700 text-sm font-bold">שמור שינויים</button>
          </div>
          <div className="mt-3 p-3 bg-navy-50 rounded-lg">
            <p className="text-xs text-navy-600 font-medium mb-1">קיצורי מקלדת:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-navy-500">
              <span>ESC - סגור תפריט</span>
              <span>Ctrl+E - פתח עריכה</span>
              <span>Ctrl+S - שמור</span>
              <span>Ctrl+P - הדפס</span>
              <span>Ctrl+B - הדגשה</span>
              <span>Ctrl+I - נטוי</span>
              <span>Ctrl+U - קו תחתון</span>
              <span>Ctrl+Z - בטל</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notes Panel Component
const NotesPanel = ({ 
  isOpen, 
  onClose, 
  notes,
  onAddNote,
  onDeleteNote 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  notes: Array<{ id: string; text: string; type: 'note' | 'question'; timestamp: number }>;
  onAddNote: (text: string, type: 'note' | 'question') => void;
  onDeleteNote: (id: string) => void;
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<'note' | 'question'>('note');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (newNoteText.trim()) {
      onAddNote(newNoteText, newNoteType);
      setNewNoteText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-[800px] max-h-[80vh] overflow-hidden shadow-2xl border-2 border-gold-400" style={{ direction: 'rtl' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-white" />
            <h3 className="text-2xl font-bold text-white">הערות ושאלות</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(80vh-200px)] overflow-y-auto">
          {/* Add New Note */}
          <div className="mb-6 p-4 bg-gold-50 rounded-xl border-2 border-gold-200">
            <h4 className="font-bold text-navy-800 mb-3">הוסף הערה חדשה</h4>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setNewNoteType('note')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  newNoteType === 'note'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                הערה
              </button>
              <button
                onClick={() => setNewNoteType('question')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  newNoteType === 'question'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                שאלה
              </button>
            </div>
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder={newNoteType === 'note' ? 'כתוב את ההערה שלך...' : 'כתוב את השאלה שלך...'}
              className="w-full p-3 border-2 border-gold-300 rounded-lg resize-none focus:outline-none focus:border-gold-500"
              rows={3}
              style={{ direction: 'rtl' }}
            />
            <button
              onClick={handleSubmit}
              disabled={!newNoteText.trim()}
              className="mt-3 w-full py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold rounded-lg hover:from-gold-600 hover:to-gold-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              הוסף {newNoteType === 'note' ? 'הערה' : 'שאלה'}
            </button>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-12 text-mouse-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">אין הערות עדיין</p>
                <p className="text-sm">התחל להוסיף הערות ושאלות לפסק הדין</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border-2 ${
                    note.type === 'note'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {note.type === 'note' ? (
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                      )}
                      <span className={`text-sm font-bold ${
                        note.type === 'note' ? 'text-blue-700' : 'text-purple-700'
                      }`}>
                        {note.type === 'note' ? 'הערה' : 'שאלה'}
                      </span>
                      <span className="text-xs text-mouse-500">
                        {new Date(note.timestamp).toLocaleString('he-IL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 hover:bg-red-100 rounded-lg transition-colors group"
                      title="מחק הערה"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-700" />
                    </button>
                  </div>
                  <p className="text-navy-800 leading-relaxed" style={{ direction: 'rtl' }}>
                    {note.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-mouse-50 border-t border-gold-200">
          <p className="text-sm text-mouse-600 text-center">
            סה"כ {notes.length} {notes.length === 1 ? 'הערה' : 'הערות'}
          </p>
        </div>
      </div>
    </div>
  );
};

const PsakView = ({ psakim }: PsakViewProps) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Editing state
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);
  const [contentStyle, setContentStyle] = useState({ 
    fontSize: '16px', 
    lineHeight: '1.6',
    fontFamily: 'Frank Ruhl Libre',
    color: '#102a43'
  });

  // הערות ושאלות
  interface Note {
    id: string;
    text: string;
    type: 'note' | 'question';
    position: number;
    timestamp: number;
  }
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'full' | 'splitInPsak'>('split');
  
  // Resizable panels state
  const [leftWidth, setLeftWidth] = useState(65); // percentage
  const [isResizing, setIsResizing] = useState(false);
  
  const psak = psakim.find(p => p.id === id);

  // Get highlight info from navigation state
  const highlightSource = location.state?.highlightSource;
  const occurrenceIndex = location.state?.occurrenceIndex ?? 0;

  // Handle text selection for popup
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPopup({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  }, []);

  // Handle mouse up for text selection
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleTextSelection, 10);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleTextSelection]);

  // Handle ESC key to close edit panel and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close panels
      if (e.key === 'Escape') {
        setShowEditPanel(false);
        setSelectionPopup(null);
      }
      
      // Keyboard shortcuts (when not in input/textarea)
      if (contentRef.current && document.activeElement === contentRef.current) {
        // Ctrl/Cmd + E to open edit panel
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
          e.preventDefault();
          setShowEditPanel(true);
        }
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          handleEditAction('save');
        }
        // Ctrl/Cmd + P to print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
          e.preventDefault();
          window.print();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const container = document.getElementById('panels-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      // RTL: calculate from right side (visual left)
      const newLeftWidth = ((rect.right - e.clientX) / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(newLeftWidth, 30), 80));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Notes management
  const handleAddNote = (text: string, type: 'note' | 'question') => {
    const newNote = {
      id: Date.now().toString(),
      text,
      type,
      position: contentRef.current?.scrollTop || 0,
      timestamp: Date.now()
    };
    setNotes(prev => [...prev, newNote]);
    
    // Save to localStorage
    if (psak) {
      const savedNotes = [...notes, newNote];
      localStorage.setItem(`psak-${psak.id}-notes`, JSON.stringify(savedNotes));
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    
    // Update localStorage
    if (psak) {
      const updatedNotes = notes.filter(n => n.id !== id);
      localStorage.setItem(`psak-${psak.id}-notes`, JSON.stringify(updatedNotes));
    }
  };

  // Load saved notes on mount
  useEffect(() => {
    if (psak) {
      const savedNotes = localStorage.getItem(`psak-${psak.id}-notes`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }
  }, [psak]);

  // Popup actions
  const handlePopupAction = (action: string, value?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    if (action === 'bold') document.execCommand('bold');
    if (action === 'italic') document.execCommand('italic');
    if (action === 'underline') document.execCommand('underline');
    if (action === 'highlight' && value) {
      document.execCommand('backColor', false, value);
    }
    setSelectionPopup(null);
  };

  // Editing panel actions
  const handleEditAction = (action: string, value?: string) => {
    if (action === 'bold') document.execCommand('bold');
    if (action === 'italic') document.execCommand('italic');
    if (action === 'underline') document.execCommand('underline');
    if (action === 'strikethrough') document.execCommand('strikeThrough');
    if (action === 'superscript') document.execCommand('superscript');
    if (action === 'subscript') document.execCommand('subscript');
    if (action === 'highlight' && value) {
      document.execCommand('backColor', false, value);
    }
    if (action === 'fontSize' && value) {
      setContentStyle(prev => ({ ...prev, fontSize: value }));
    }
    if (action === 'lineHeight' && value) {
      setContentStyle(prev => ({ ...prev, lineHeight: value }));
    }
    if (action === 'fontFamily' && value) {
      setContentStyle(prev => ({ ...prev, fontFamily: value }));
    }
    if (action === 'fontColor' && value) {
      setContentStyle(prev => ({ ...prev, color: value }));
    }
    if (action === 'bgColor' && value) {
      if (contentRef.current) {
        contentRef.current.style.backgroundColor = value;
      }
    }
    if (action === 'align' && value) {
      if (value === 'right') document.execCommand('justifyRight');
      if (value === 'center') document.execCommand('justifyCenter');
      if (value === 'left') document.execCommand('justifyLeft');
      if (value === 'justify') document.execCommand('justifyFull');
    }
    if (action === 'list' && value) {
      if (value === 'ordered') document.execCommand('insertOrderedList');
      if (value === 'unordered') document.execCommand('insertUnorderedList');
    }
    if (action === 'indent' && value) {
      if (value === 'increase') document.execCommand('indent');
      if (value === 'decrease') document.execCommand('outdent');
    }
    if (action === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote');
    }
    if (action === 'hr') {
      document.execCommand('insertHorizontalRule');
    }
    if (action === 'textCase' && value) {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        const text = selection.toString();
        let newText = text;
        if (value === 'upper') newText = text.toUpperCase();
        if (value === 'lower') newText = text.toLowerCase();
        if (value === 'capitalize') newText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        document.execCommand('insertText', false, newText);
      }
    }
    if (action === 'findReplace') {
      const searchTerm = prompt('חפש:', '');
      if (searchTerm && contentRef.current) {
        const replacement = prompt('החלף ב:', '');
        if (replacement !== null) {
          const content = contentRef.current.innerHTML;
          const newContent = content.replace(new RegExp(searchTerm, 'gi'), replacement);
          contentRef.current.innerHTML = newContent;
          alert(`הוחלפו ${(content.match(new RegExp(searchTerm, 'gi')) || []).length} מופעים`);
        }
      }
    }
    if (action === 'insertLink') {
      const url = prompt('הזן כתובת URL:', 'https://');
      if (url && url !== 'https://') {
        document.execCommand('createLink', false, url);
      }
    }
    if (action === 'removeLink') {
      document.execCommand('unlink');
    }
    if (action === 'insertTable') {
      const rows = prompt('מספר שורות:', '3');
      const cols = prompt('מספר עמודות:', '3');
      if (rows && cols) {
        const numRows = parseInt(rows);
        const numCols = parseInt(cols);
        if (numRows > 0 && numCols > 0) {
          let table = '<table dir="rtl" style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 2px solid #C9A227;"><tbody>';
          for (let i = 0; i < numRows; i++) {
            table += '<tr>';
            for (let j = 0; j < numCols; j++) {
              const isHeader = i === 0;
              const cellTag = isHeader ? 'th' : 'td';
              const cellStyle = isHeader 
                ? 'border: 1px solid #C9A227; padding: 10px; background-color: #1e3a8a; color: white; font-weight: bold; text-align: center;'
                : 'border: 1px solid #C9A227; padding: 10px; text-align: right;';
              table += `<${cellTag} style="${cellStyle}">${isHeader ? `עמודה ${j + 1}` : '&nbsp;'}</${cellTag}>`;
            }
            table += '</tr>';
          }
          table += '</tbody></table><p>&nbsp;</p>';
          document.execCommand('insertHTML', false, table);
        }
      }
    }
    if (action === 'view' && value) {
      setViewMode(value as 'split' | 'full' | 'splitInPsak');
      setShowEditPanel(false);
    }
    if (action === 'openNotes') {
      setShowNotesPanel(true);
    }
    if (action === 'reset') {
      setContentStyle({ 
        fontSize: '16px', 
        lineHeight: '1.6',
        fontFamily: 'Frank Ruhl Libre',
        color: '#102a43'
      });
      if (contentRef.current) {
        contentRef.current.style.backgroundColor = '#ffffff';
        contentRef.current.style.textAlign = 'right';
      }
      setViewMode('split');
    }
    if (action === 'copy') {
      handleCopy();
    }
    if (action === 'print') {
      window.print();
    }
    if (action === 'selectAll') {
      if (contentRef.current) {
        const range = document.createRange();
        range.selectNodeContents(contentRef.current);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    if (action === 'undo') document.execCommand('undo');
    if (action === 'redo') document.execCommand('redo');
    if (action === 'removeFormat') document.execCommand('removeFormat');
    if (action === 'save') {
      // Save to localStorage
      if (contentRef.current && psak) {
        localStorage.setItem(`psak-${psak.id}-content`, contentRef.current.innerHTML);
        alert('השינויים נשמרו בהצלחה!');
      }
    }
  };

  // Highlight and scroll to source reference
  useEffect(() => {
    if (!psak || !highlightSource || !contentRef.current) return;

    const sources = extractAllSources(psak.rawText);
    const matchingSources = sources.filter(s => s.normalized === highlightSource);
    
    if (matchingSources.length === 0) return;

    // Get the specific occurrence
    const targetSource = matchingSources[occurrenceIndex] || matchingSources[0];
    
    // Create highlighted version of content
    const highlightedContent = highlightTextAtPosition(
      psak.content,
      targetSource.position.start,
      targetSource.position.end
    );
    
    if (contentRef.current) {
      contentRef.current.innerHTML = highlightedContent;
      
      // Scroll to highlighted element
      setTimeout(() => {
        const highlighted = contentRef.current?.querySelector('.source-highlight');
        if (highlighted) {
          highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [psak, highlightSource, occurrenceIndex]);

  const highlightTextAtPosition = (html: string, start: number, end: number): string => {
    const before = html.substring(0, start);
    const highlighted = html.substring(start, end);
    const after = html.substring(end);
    
    return `${before}<mark class="source-highlight bg-gold/30 px-1 rounded animate-pulse">${highlighted}</mark>${after}`;
  };

  if (!psak) {
    return (
      <div className="animate-fade-in text-center py-16">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gold-300" />
        <h2 className="text-2xl font-bold text-navy-800 mb-2">פסק דין לא נמצא</h2>
        <p className="text-mouse-500 mb-4">הפסק המבוקש אינו קיים במאגר</p>
        <Link 
          to="/psakim"
          className="inline-flex items-center gap-2 text-gold-600 hover:text-gold-700"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לרשימה
        </Link>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(psak.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Group references by type
  const referencesByType = psak.references.reduce((acc, ref) => {
    if (!acc[ref.type]) {
      acc[ref.type] = [];
    }
    acc[ref.type].push(ref);
    return acc;
  }, {} as Record<string, typeof psak.references>);

  return (
    <div className="animate-fade-in">
      {/* Selection Popup */}
      {selectionPopup && (
        <SelectionPopup 
          position={selectionPopup}
          onAction={handlePopupAction}
          onClose={() => setSelectionPopup(null)}
        />
      )}

      {/* Editing Panel */}
      <EditingPanel 
        isOpen={showEditPanel}
        onClose={() => setShowEditPanel(false)}
        onAction={handleEditAction}
        currentViewMode={viewMode}
      />

      {/* Notes Panel */}
      <NotesPanel 
        isOpen={showNotesPanel}
        onClose={() => setShowNotesPanel(false)}
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Breadcrumb + Edit Button */}
      <div className="mb-6 flex justify-between items-center">
        <Link 
          to="/psakim"
          className="inline-flex items-center gap-2 text-mouse-500 hover:text-gold-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לרשימת הפסקים
        </Link>
        <button
          onClick={() => setShowEditPanel(true)}
          className="p-2 bg-white hover:bg-navy-50 text-navy-700 rounded-lg transition-all border-2 border-navy-600 hover:border-navy-700 shadow-sm hover:shadow-md"
          title="עריכה (Ctrl+E)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => setShowNotesPanel(true)}
          className="relative p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          title="הערות ושאלות"
        >
          <MessageSquare className="w-5 h-5" />
          {notes.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {notes.length}
            </span>
          )}
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-l from-navy-900 to-navy-800 rounded-2xl p-8 text-white mb-6 shadow-xl border border-gold-300">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gold-500 text-navy-900 rounded-full text-sm font-bold">
                פסק #{psak.number}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{psak.title}</h1>
            <div className="flex flex-wrap gap-4 text-cream-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatHebrewDate(psak.dateAdded)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{psak.references.length} הפניות למקורות</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 rounded-xl transition-colors font-bold"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                הועתק!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                העתק טקסט
              </>
            )}
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-6">
          {psak.categories.map(cat => (
            <span 
              key={cat}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white text-blue-700 rounded-full text-sm border border-blue-300 shadow-sm hover:shadow-md transition-shadow"
            >
              <Tag className="w-3 h-3" />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Panels Container */}
      {viewMode === 'split' ? (
        <div id="panels-container" className="flex gap-0 relative" style={{ direction: 'rtl' }}>
          {/* Main Content Panel */}
          <div 
            className="bg-white rounded-2xl p-6 border border-gold-300 shadow-elegant overflow-auto hide-scrollbar"
            style={{ width: `${leftWidth}%`, maxHeight: '70vh' }}
          >
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2" style={{ direction: 'rtl' }}>
              <FileText className="w-5 h-5 text-gold-600" />
              תוכן הפסק
            </h2>
            <div 
              ref={contentRef}
              className="psak-content hebrew-text text-navy-800"
              style={{ 
                direction: 'rtl', 
                fontSize: contentStyle.fontSize,
                lineHeight: contentStyle.lineHeight,
                fontFamily: contentStyle.fontFamily,
                color: contentStyle.color
              }}
              contentEditable
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: psak.content }}
            />
          </div>

          {/* Resize Handle */}
          <div
            className="w-px cursor-col-resize bg-gold-100/30 hover:bg-gold-200/40 transition-colors flex-shrink-0 mx-px"
            onMouseDown={handleMouseDown}
            style={{ minHeight: '200px' }}
            title="גרור לשינוי גודל"
          />

          {/* Summary & References Panel */}
          <div 
            className="bg-white rounded-2xl p-6 border border-gold-300 shadow-elegant overflow-auto hide-scrollbar flex-1"
            style={{ maxHeight: '70vh', direction: 'rtl' }}
          >
          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-navy-900 mb-4">תקציר</h3>
            <p className="text-mouse-600 leading-relaxed">{psak.summary}</p>
          </div>

          {/* References */}
          {Object.keys(referencesByType).length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gold-600" />
                הפניות למקורות
              </h3>
              <div className="space-y-4">
                {Object.entries(referencesByType).map(([type, refs]) => (
                  <div key={type}>
                    <h4 className="text-sm font-medium text-mouse-500 mb-2">
                      {getReferenceTypeName(type as any)} ({refs.length})
                    </h4>
                    <div className="space-y-2">
                      {refs.slice(0, 5).map(ref => (
                        <div 
                          key={ref.id}
                          className="p-3 bg-gold-50 rounded-lg border border-gold-200 group cursor-pointer hover:bg-gold-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-navy-800">
                              {ref.source}
                            </span>
                            <ExternalLink className="w-4 h-4 text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                      {refs.length > 5 && (
                        <p className="text-sm text-mouse-400 text-center">
                          +{refs.length - 5} הפניות נוספות
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      ) : viewMode === 'full' ? (
        /* Full Screen Mode */
        <div className="bg-white rounded-2xl p-8 border border-gold-300 shadow-elegant">
          <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2" style={{ direction: 'rtl' }}>
            <FileText className="w-5 h-5 text-gold-600" />
            תוכן הפסק
          </h2>
          <div 
            ref={contentRef}
            className="psak-content hebrew-text text-navy-800 max-h-[80vh] overflow-auto hide-scrollbar"
            style={{ 
              direction: 'rtl', 
              fontSize: contentStyle.fontSize,
              lineHeight: contentStyle.lineHeight,
              fontFamily: contentStyle.fontFamily,
              color: contentStyle.color
            }}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: psak.content }}
          />
        </div>
      ) : (
        // Split In Psak Mode - Two column layout using CSS columns
        <div className="bg-white rounded-2xl p-8 border border-gold-300 shadow-elegant">
          <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2" style={{ direction: 'rtl' }}>
            <FileText className="w-5 h-5 text-gold-600" />
            תוכן הפסק - תצוגה בשתי עמודות
          </h2>
          <div 
            ref={contentRef}
            className="psak-content hebrew-text text-navy-800 max-h-[80vh] overflow-auto hide-scrollbar"
            style={{ 
              direction: 'rtl', 
              fontSize: contentStyle.fontSize,
              lineHeight: contentStyle.lineHeight,
              fontFamily: contentStyle.fontFamily,
              color: contentStyle.color,
              columnCount: 2,
              columnGap: '40px',
              columnRule: '2px solid #C9A227'
            }}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: psak.content }}
          />
        </div>
      )}
    </div>
  );
};

export default PsakView;
