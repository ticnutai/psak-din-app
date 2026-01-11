import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowRight, 
  Loader, 
  Download, 
  AlertCircle, 
  FileText, 
  Columns, 
  X, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Edit3,
  Maximize,
  Minimize,
  MessageSquare,
  Plus,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { PsakDin } from '../types';
import { buildSourceIndex } from '../utils/smartReferences';

const SEFARIA_API = 'https://www.sefaria.org/api/texts/';
const CACHE_KEY_PREFIX = 'source-cache-';

interface SourceViewProps {
  psakim: PsakDin[];
}

// Selection Popup Component for Source View
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

// Editing Panel Component for Source View
const SourceEditingPanel = ({ 
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
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(2);
  const [fontFamily, setFontFamily] = useState('Frank Ruhl Libre');
  const [fontColor, setFontColor] = useState('#102a43');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl border border-gold-300 p-6 w-96 max-h-[80vh] overflow-y-auto hide-scrollbar" style={{ direction: 'rtl' }}>
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
              />
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">גודל גופן: {fontSize}px</h4>
          <input
            type="range"
            min="14"
            max="32"
            value={32 - fontSize + 14}
            onChange={(e) => {
              const size = 32 - Number(e.target.value) + 14;
              setFontSize(size);
              onAction('fontSize', `${size}px`);
            }}
            className="w-full mb-2 styled-slider"
            style={{ direction: 'ltr' }}
          />
          <div className="flex gap-1 flex-wrap">
            {[16, 18, 20, 24, 28].map(size => (
              <button 
                key={size}
                onClick={() => { setFontSize(size); onAction('fontSize', `${size}px`); }} 
                className={`px-2 py-1 rounded text-xs transition-colors ${fontSize === size ? 'bg-gold-500 text-white' : 'bg-mouse-100 hover:bg-gold-200'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">ריווח שורות: {lineHeight}</h4>
          <input
            type="range"
            min="1.2"
            max="3"
            step="0.1"
            value={4.2 - lineHeight}
            onChange={(e) => {
              const lh = 4.2 - Number(e.target.value);
              setLineHeight(lh);
              onAction('lineHeight', `${lh}`);
            }}
            className="w-full styled-slider"
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
            {['#102a43', '#000000', '#334155', '#dc2626', '#C9A227', '#16a34a', '#2563eb'].map(color => (
              <button 
                key={color}
                onClick={() => { setFontColor(color); onAction('fontColor', color); }} 
                className="w-8 h-8 rounded border-2 border-gray-300 hover:scale-110 transition-transform" 
                style={{backgroundColor: color}} 
              />
            ))}
          </div>
        </div>

        {/* View Modes */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">תצוגה</h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onAction('view', 'normal')} 
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentViewMode === 'normal' ? 'bg-gold-500 text-white shadow-lg' : 'bg-gold-100 hover:bg-gold-200'
              }`}
            >
              רגיל
            </button>
            <button 
              onClick={() => onAction('view', 'columns')} 
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentViewMode === 'columns' ? 'bg-gold-500 text-white shadow-lg' : 'bg-gold-100 hover:bg-gold-200'
              }`}
            >
              2 עמודות
            </button>
            <button 
              onClick={() => onAction('view', 'full')} 
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                currentViewMode === 'full' ? 'bg-gold-500 text-white shadow-lg' : 'bg-gold-100 hover:bg-gold-200'
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
            <button onClick={() => onAction('align', 'justify')} className="flex-1 px-3 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-sm">מיושר</button>
          </div>
        </div>

        {/* Background Color */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">רקע הטקסט</h4>
          <div className="flex gap-2">
            <button onClick={() => onAction('bgColor', '#ffffff')} className="flex-1 px-3 py-2 bg-white border-2 border-gold-300 hover:bg-gray-50 rounded-lg text-sm">לבן</button>
            <button onClick={() => onAction('bgColor', '#fefce8')} className="flex-1 px-3 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-sm">קרם</button>
            <button onClick={() => onAction('bgColor', '#f0fdf4')} className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm">ירקרק</button>
            <button onClick={() => onAction('bgColor', '#eff6ff')} className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm">כחלחל</button>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h4 className="font-bold text-navy-800 mb-3">הערות ושאלות</h4>
          <button 
            onClick={() => onAction('openNotes')} 
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-bold flex items-center justify-center gap-2 shadow-lg"
          >
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
            <button onClick={() => onAction('save')} className="px-4 py-2 bg-gold-100 hover:bg-gold-200 rounded-lg text-gold-700 text-sm font-bold">שמור</button>
          </div>
          <div className="mt-3 p-3 bg-navy-50 rounded-lg">
            <p className="text-xs text-navy-600 font-medium mb-1">קיצורי מקלדת:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-navy-500">
              <span>ESC - סגור תפריט</span>
              <span>Ctrl+E - פתח עריכה</span>
              <span>Ctrl+B - הדגשה</span>
              <span>Ctrl+I - נטוי</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notes Panel Component for Source View
const SourceNotesPanel = ({ 
  isOpen, 
  onClose, 
  notes,
  onAddNote,
  onDeleteNote,
  sourceTitle
}: { 
  isOpen: boolean; 
  onClose: () => void;
  notes: Array<{ id: string; text: string; type: 'note' | 'question'; timestamp: number }>;
  onAddNote: (text: string, type: 'note' | 'question') => void;
  onDeleteNote: (id: string) => void;
  sourceTitle: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[800px] max-h-[80vh] overflow-hidden shadow-2xl border-2 border-gold-400" style={{ direction: 'rtl' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-white" />
            <div>
              <h3 className="text-2xl font-bold text-white">הערות ושאלות</h3>
              <p className="text-white/80 text-sm">{sourceTitle}</p>
            </div>
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
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
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
              placeholder={newNoteType === 'note' ? 'כתוב הערה...' : 'כתוב שאלה...'}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
            />
            <button
              onClick={handleSubmit}
              disabled={!newNoteText.trim()}
              className="mt-3 w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              הוסף {newNoteType === 'note' ? 'הערה' : 'שאלה'}
            </button>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            <h4 className="font-bold text-navy-800">הערות שנשמרו ({notes.length})</h4>
            {notes.length === 0 ? (
              <div className="text-center py-8 text-mouse-500 bg-gray-50 rounded-xl">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>אין עדיין הערות למקור זה</p>
              </div>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border-2 ${
                    note.type === 'question'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {note.type === 'question' ? (
                          <HelpCircle className="w-4 h-4 text-purple-500" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                        )}
                        <span className={`text-xs font-bold ${
                          note.type === 'question' ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                          {note.type === 'question' ? 'שאלה' : 'הערה'}
                        </span>
                        <span className="text-xs text-mouse-400">
                          {new Date(note.timestamp).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                      <p className="text-navy-800">{note.text}</p>
                    </div>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SourceViewProps {
  psakim: PsakDin[];
}

const SourceView: React.FC<SourceViewProps> = ({ psakim }) => {
  const { source } = useParams<{ source: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<any>(null);
  const [displayInfo, setDisplayInfo] = useState({ title: '', subtitle: '' });
  
  // Split view state
  const [showSplitView, setShowSplitView] = useState(false);
  const [selectedPsak, setSelectedPsak] = useState<PsakDin | null>(null);
  const [showRelatedPsakim, setShowRelatedPsakim] = useState(true);
  
  // Editing states
  const [showEditingPanel, setShowEditingPanel] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'columns' | 'full'>('normal');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);
  
  // Nikud (vowels) state
  const [showNikud, setShowNikud] = useState(true);
  
  // Commentators state
  const [showCommentaryPanel, setShowCommentaryPanel] = useState(false);
  const [selectedCommentary, setSelectedCommentary] = useState<string | null>(null);
  const [commentaryData, setCommentaryData] = useState<any>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  
  // Available commentators for Gemara
  const COMMENTATORS = [
    { id: 'Rashi', name: 'רש"י', hebrewName: 'רש"י על', color: '#fef08a' },
    { id: 'Tosafot', name: 'תוספות', hebrewName: 'תוספות על', color: '#bbf7d0' },
    { id: 'Rashbam', name: 'רשב"ם', hebrewName: 'רשב"ם על', color: '#bfdbfe' },
    { id: 'Ran', name: 'ר"ן', hebrewName: 'ר"ן על', color: '#fecaca' },
    { id: 'Ritva', name: 'ריטב"א', hebrewName: 'ריטב"א על', color: '#e9d5ff' },
    { id: 'Ramban', name: 'רמב"ן', hebrewName: 'רמב"ן על', color: '#fed7aa' },
    { id: 'Meiri', name: 'מאירי', hebrewName: 'מאירי על', color: '#a5f3fc' },
    { id: 'Maharsha', name: 'מהרש"א', hebrewName: 'מהרש"א על', color: '#c4b5fd' },
  ];
  
  // Text styling states
  const [textStyles, setTextStyles] = useState({
    fontSize: '18px',
    lineHeight: '2',
    fontFamily: 'Frank Ruhl Libre',
    color: '#102a43',
    textAlign: 'right' as const,
    backgroundColor: '#ffffff'
  });
  
  // Notes state
  const [notes, setNotes] = useState<Array<{ id: string; text: string; type: 'note' | 'question'; timestamp: number }>>([]);
  
  // Load notes from localStorage
  useEffect(() => {
    if (source) {
      const savedNotes = localStorage.getItem(`source-notes-${source}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    }
  }, [source]);
  
  // Save notes to localStorage
  const saveNotes = useCallback((newNotes: typeof notes) => {
    if (source) {
      localStorage.setItem(`source-notes-${source}`, JSON.stringify(newNotes));
    }
  }, [source]);
  
  const addNote = (text: string, type: 'note' | 'question') => {
    const newNote = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: Date.now()
    };
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    saveNotes(newNotes);
  };
  
  const deleteNote = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    saveNotes(newNotes);
  };
  
  // Handle text selection for popup
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPopup({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    } else {
      setSelectionPopup(null);
    }
  }, []);
  
  // Handle editing actions
  const handleEditAction = useCallback((action: string, value?: string) => {
    switch (action) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough');
        break;
      case 'highlight':
        document.execCommand('hiliteColor', false, value);
        break;
      case 'fontSize':
        setTextStyles(prev => ({ ...prev, fontSize: value || '18px' }));
        break;
      case 'lineHeight':
        setTextStyles(prev => ({ ...prev, lineHeight: value || '2' }));
        break;
      case 'fontFamily':
        setTextStyles(prev => ({ ...prev, fontFamily: value || 'Frank Ruhl Libre' }));
        break;
      case 'fontColor':
        setTextStyles(prev => ({ ...prev, color: value || '#102a43' }));
        break;
      case 'align':
        setTextStyles(prev => ({ ...prev, textAlign: value as any || 'right' }));
        break;
      case 'bgColor':
        setTextStyles(prev => ({ ...prev, backgroundColor: value || '#ffffff' }));
        break;
      case 'view':
        if (value === 'full') {
          setIsFullScreen(true);
          setViewMode('normal');
        } else {
          setIsFullScreen(false);
          setViewMode(value as any);
        }
        break;
      case 'openNotes':
        setShowEditingPanel(false);
        setShowNotesPanel(true);
        break;
      case 'copy':
        if (contentRef.current) {
          navigator.clipboard.writeText(contentRef.current.innerText);
        }
        break;
      case 'print':
        window.print();
        break;
      case 'reset':
        setTextStyles({
          fontSize: '18px',
          lineHeight: '2',
          fontFamily: 'Frank Ruhl Libre',
          color: '#102a43',
          textAlign: 'right',
          backgroundColor: '#ffffff'
        });
        break;
      case 'save':
        // Save styles to localStorage
        if (source) {
          localStorage.setItem(`source-styles-${source}`, JSON.stringify(textStyles));
        }
        break;
    }
    setSelectionPopup(null);
  }, [source, textStyles]);
  
  // Function to remove nikud (vowel marks) from Hebrew text
  const removeNikud = (text: string): string => {
    // Hebrew nikud range: U+0591 to U+05C7
    return text.replace(/[\u0591-\u05C7]/g, '');
  };
  
  // Function to load commentary from Sefaria
  const loadCommentary = useCallback(async (commentaryId: string) => {
    if (!source || !sourceData) return;
    
    setCommentaryLoading(true);
    setSelectedCommentary(commentaryId);
    
    try {
      // Parse source to get Sefaria reference inline
      const masechetToEnglish: Record<string, string> = {
        'ברכות': 'Berakhot', 'שבת': 'Shabbat', 'עירובין': 'Eruvin',
        'פסחים': 'Pesachim', 'שקלים': 'Shekalim', 'יומא': 'Yoma',
        'סוכה': 'Sukkah', 'ביצה': 'Beitzah', 'ראש השנה': 'Rosh_Hashanah',
        'תענית': 'Taanit', 'מגילה': 'Megillah', 'מועד קטן': 'Moed_Katan',
        'חגיגה': 'Chagigah', 'יבמות': 'Yevamot', 'כתובות': 'Ketubot',
        'נדרים': 'Nedarim', 'נזיר': 'Nazir', 'סוטה': 'Sotah',
        'גיטין': 'Gittin', 'קידושין': 'Kiddushin', 'בבא קמא': 'Bava_Kamma',
        'בבא מציעא': 'Bava_Metzia', 'בבא בתרא': 'Bava_Batra', 'סנהדרין': 'Sanhedrin',
        'מכות': 'Makkot', 'שבועות': 'Shevuot', 'עבודה זרה': 'Avodah_Zarah',
        'הוריות': 'Horayot', 'זבחים': 'Zevachim', 'מנחות': 'Menachot',
        'חולין': 'Chullin', 'בכורות': 'Bekhorot', 'ערכין': 'Arakhin',
        'תמורה': 'Temurah', 'כריתות': 'Keritot', 'מעילה': 'Meilah',
        'תמיד': 'Tamid', 'נידה': 'Niddah'
      };
      
      const gemaraMatch = source.match(/gemara:([^:]+):(\d+):?([אב]?)/);
      let sefariaRef: string | null = null;
      
      if (gemaraMatch) {
        const masechet = gemaraMatch[1];
        const daf = gemaraMatch[2];
        const amud = gemaraMatch[3] || 'א';
        const amudLetter = amud === 'א' ? 'a' : 'b';
        const englishName = masechetToEnglish[masechet] || masechet.replace(/ /g, '_');
        sefariaRef = `${englishName}.${daf}${amudLetter}`;
      }
      
      if (!sefariaRef) {
        setCommentaryData({ error: 'לא ניתן לזהות את המקור - מפרשים זמינים רק לגמרא' });
        setCommentaryLoading(false);
        return;
      }
      
      // Build commentary reference
      // For Rashi on Bava Kamma 2a: "Rashi_on_Bava_Kamma.2a"
      const commentaryRef = `${commentaryId}_on_${sefariaRef}`;
      
      // Check cache first
      const cacheKey = `commentary-${commentaryRef}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setCommentaryData(JSON.parse(cached));
        setCommentaryLoading(false);
        return;
      }
      
      // Fetch from Sefaria
      console.log('Fetching commentary:', `${SEFARIA_API}${commentaryRef}?context=0`);
      const response = await fetch(`${SEFARIA_API}${commentaryRef}?context=0`);
      
      if (!response.ok) {
        setCommentaryData({ error: `לא נמצא פירוש ${COMMENTATORS.find(c => c.id === commentaryId)?.name || commentaryId} לדף זה` });
        setCommentaryLoading(false);
        return;
      }
      
      const data = await response.json();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setCommentaryData(data);
    } catch (err) {
      console.error('Error loading commentary:', err);
      setCommentaryData({ error: 'שגיאה בטעינת הפירוש' });
    } finally {
      setCommentaryLoading(false);
    }
  }, [source, sourceData]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEditingPanel(false);
        setShowNotesPanel(false);
        setShowCommentaryPanel(false);
        setSelectionPopup(null);
        if (isFullScreen) setIsFullScreen(false);
      }
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setShowEditingPanel(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Find related psakim for this source
  const relatedPsakim = useMemo(() => {
    if (!source || psakim.length === 0) return [];
    
    const sourceIndex = buildSourceIndex(
      psakim.map(p => ({
        id: p.id,
        title: p.title,
        number: p.number,
        rawText: p.rawText,
      }))
    );
    
    // Decode the source from URL
    const decodedSource = decodeURIComponent(source);
    
    // Find exact match or similar sources
    const sourceEntry = sourceIndex[decodedSource];
    if (sourceEntry) {
      return sourceEntry.psakim;
    }
    
    // Try to match by prefix (e.g., gemara:בבא קמא:2 matches gemara:בבא קמא:2:א)
    const relatedKeys = Object.keys(sourceIndex).filter(key => 
      key.startsWith(decodedSource) || decodedSource.startsWith(key)
    );
    
    const allPsakim: any[] = [];
    for (const key of relatedKeys) {
      allPsakim.push(...sourceIndex[key].psakim);
    }
    
    // Remove duplicates by psakId
    const uniquePsakim = allPsakim.filter((p, idx, arr) => 
      arr.findIndex(x => x.psakId === p.psakId) === idx
    );
    
    return uniquePsakim;
  }, [source, psakim]);

  useEffect(() => {
    if (!source) return;

    const loadSource = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to load from cache first
        const cacheKey = CACHE_KEY_PREFIX + source;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const data = JSON.parse(cached);
          setSourceData(data);
          parseDisplayInfo(source, data);
          setLoading(false);
          return;
        }

        // Parse source and fetch from Sefaria
        const sefariaRef = parseSourceToSefaria(source);
        if (!sefariaRef) {
          setError('לא ניתן לזהות את המקור');
          setLoading(false);
          return;
        }

        console.log('Fetching from Sefaria:', sefariaRef);
        const response = await fetch(`${SEFARIA_API}${sefariaRef}?context=0&commentary=0`);
        if (!response.ok) {
          console.error('Sefaria API error:', response.status, response.statusText);
          throw new Error('שגיאה בטעינת הטקסט מספריא');
        }

        const data = await response.json();
        console.log('Sefaria data:', data);
        
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(data));
        
        setSourceData(data);
        parseDisplayInfo(source, data);
      } catch (err) {
        setError('שגיאה בטעינת המקור. ודא שיש חיבור לאינטרנט.');
        console.error('Error loading source:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSource();
  }, [source]);

  const parseSourceToSefaria = (source: string): string | null => {
    // המרת שמות מסכתות מעברית לאנגלית עבור Sefaria API
    const masechetToEnglish: Record<string, string> = {
      'ברכות': 'Berakhot',
      'שבת': 'Shabbat',
      'עירובין': 'Eruvin',
      'פסחים': 'Pesachim',
      'שקלים': 'Shekalim',
      'יומא': 'Yoma',
      'סוכה': 'Sukkah',
      'ביצה': 'Beitzah',
      'ראש השנה': 'Rosh_Hashanah',
      'תענית': 'Taanit',
      'מגילה': 'Megillah',
      'מועד קטן': 'Moed_Katan',
      'חגיגה': 'Chagigah',
      'יבמות': 'Yevamot',
      'כתובות': 'Ketubot',
      'נדרים': 'Nedarim',
      'נזיר': 'Nazir',
      'סוטה': 'Sotah',
      'גיטין': 'Gittin',
      'קידושין': 'Kiddushin',
      'בבא קמא': 'Bava_Kamma',
      'בבא מציעא': 'Bava_Metzia',
      'בבא בתרא': 'Bava_Batra',
      'סנהדרין': 'Sanhedrin',
      'מכות': 'Makkot',
      'שבועות': 'Shevuot',
      'עבודה זרה': 'Avodah_Zarah',
      'הוריות': 'Horayot',
      'זבחים': 'Zevachim',
      'מנחות': 'Menachot',
      'חולין': 'Chullin',
      'בכורות': 'Bekhorot',
      'ערכין': 'Arakhin',
      'תמורה': 'Temurah',
      'כריתות': 'Keritot',
      'מעילה': 'Meilah',
      'תמיד': 'Tamid',
      'קינים': 'Kinnim',
      'נידה': 'Niddah'
    };

    const gemaraMatch = source.match(/gemara:([^:]+):(\d+):?([אב]?)/);
    if (gemaraMatch) {
      const masechet = gemaraMatch[1];
      const daf = gemaraMatch[2];
      const amud = gemaraMatch[3] || 'א';
      const amudLetter = amud === 'א' ? 'a' : 'b';
      
      // המרה לאנגלית
      const englishName = masechetToEnglish[masechet] || masechet.replace(/ /g, '_');
      return `${englishName}.${daf}${amudLetter}`;
    }

    const shulchanMatch = source.match(/shulchan_aruch:([^:]+):(\d+)/);
    if (shulchanMatch) {
      let chelek = shulchanMatch[1];
      const siman = shulchanMatch[2];
      
      if (chelek.includes('או"ח') || chelek.includes('אורח חיים')) chelek = 'Orach_Chaim';
      else if (chelek.includes('יו"ד') || chelek.includes('יורה דעה')) chelek = 'Yoreh_Deah';
      else if (chelek.includes('אבה"ע') || chelek.includes('אבן העזר')) chelek = 'Even_HaEzer';
      else if (chelek.includes('חו"מ') || chelek.includes('חושן משפט')) chelek = 'Choshen_Mishpat';
      
      return `Shulchan_Arukh,_${chelek}.${siman}`;
    }

    const bookMatch = source.match(/book:([^:]+):?(\d*)/);
    if (bookMatch) {
      const bookRef = bookMatch[1];
      const chapter = bookMatch[2];
      if (chapter) {
        return `${bookRef}.${chapter}`;
      }
      return bookRef;
    }

    return null;
  };

  const parseDisplayInfo = (source: string, data: any) => {
    const gemaraMatch = source.match(/gemara:([^:]+):(\d+):?([אב]?)/);
    if (gemaraMatch) {
      const masechet = gemaraMatch[1];
      const daf = gemaraMatch[2];
      const amud = gemaraMatch[3] === 'ב' ? 'עמוד ב' : 'עמוד א';
      setDisplayInfo({
        title: `${masechet} דף ${numberToHebrew(parseInt(daf))}`,
        subtitle: amud,
      });
      return;
    }

    const shulchanMatch = source.match(/shulchan_aruch:([^:]+):(\d+)/);
    if (shulchanMatch) {
      const chelek = shulchanMatch[1];
      const siman = shulchanMatch[2];
      setDisplayInfo({
        title: `שולחן ערוך - ${chelek}`,
        subtitle: `סימן ${numberToHebrew(parseInt(siman))}`,
      });
      return;
    }

    const bookMatch = source.match(/book:([^:]+):?(\d*)/);
    if (bookMatch) {
      const bookRef = bookMatch[1].replace(/_/g, ' ');
      const chapter = bookMatch[2];
      setDisplayInfo({
        title: data?.heTitle || bookRef,
        subtitle: chapter ? `פרק ${numberToHebrew(parseInt(chapter))}` : '',
      });
      return;
    }

    setDisplayInfo({
      title: data?.title || 'מקור',
      subtitle: '',
    });
  };

  const numberToHebrew = (num: number): string => {
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
    
    if (num === 15) return 'טו';
    if (num === 16) return 'טז';
    
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;
    
    return hundreds[h] + tens[t] + ones[o];
  };

  const renderText = () => {
    if (!sourceData) return null;

    // New API format - check for 'he' or 'text' fields
    const text = sourceData.he || sourceData.text;
    
    if (!text) {
      console.error('No text found in source data:', sourceData);
      return <p className="text-gray-500">לא נמצא טקסט</p>;
    }
    
    // Helper to process text (remove nikud if needed)
    const processText = (t: string): string => {
      return showNikud ? t : removeNikud(t);
    };
    
    // If text is array (multi-segment), join with paragraphs
    if (Array.isArray(text)) {
      return (
        <div className="space-y-4">
          {text.map((segment: any, idx: number) => {
            if (Array.isArray(segment)) {
              return (
                <div key={idx} className="space-y-2">
                  {segment.map((line: string, lineIdx: number) => (
                    <p key={lineIdx} className="text-lg leading-loose" dangerouslySetInnerHTML={{ __html: processText(line) }} />
                  ))}
                </div>
              );
            }
            if (typeof segment === 'string' && segment.trim()) {
              return <p key={idx} className="text-lg leading-loose" dangerouslySetInnerHTML={{ __html: processText(segment) }} />;
            }
            return null;
          })}
        </div>
      );
    }

    // Single text segment
    if (typeof text === 'string') {
      return <div className="text-lg leading-loose" dangerouslySetInnerHTML={{ __html: processText(text) }} />;
    }

    return <p className="text-gray-500">פורמט טקסט לא נתמך</p>;
  };
  
  // Render commentary text
  const renderCommentary = () => {
    if (!commentaryData) return null;
    
    if (commentaryData.error) {
      return (
        <div className="p-6 text-center text-mouse-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-orange-400" />
          <p>{commentaryData.error}</p>
        </div>
      );
    }
    
    const text = commentaryData.he || commentaryData.text;
    if (!text) return <p className="text-gray-500 text-center p-4">לא נמצא טקסט</p>;
    
    const processText = (t: string): string => showNikud ? t : removeNikud(t);
    
    if (Array.isArray(text)) {
      return (
        <div className="space-y-3">
          {text.map((segment: any, idx: number) => {
            if (typeof segment === 'string' && segment.trim()) {
              return (
                <p key={idx} className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: processText(segment) }} />
              );
            }
            return null;
          })}
        </div>
      );
    }
    
    if (typeof text === 'string') {
      return <div className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: processText(text) }} />;
    }
    
    return null;
  };

  const openSplitView = (psak: PsakDin) => {
    setSelectedPsak(psak);
    setShowSplitView(true);
  };

  const handlePsakClick = (psakId: string) => {
    navigate(`/psak/${psakId}`, {
      state: {
        highlightSource: source,
      },
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 ${isFullScreen ? 'fixed inset-0 z-40 p-4' : 'p-8'}`}>
      {/* Selection Popup */}
      {selectionPopup && (
        <SelectionPopup
          position={selectionPopup}
          onAction={handleEditAction}
          onClose={() => setSelectionPopup(null)}
        />
      )}
      
      {/* Editing Panel */}
      <SourceEditingPanel
        isOpen={showEditingPanel}
        onClose={() => setShowEditingPanel(false)}
        onAction={handleEditAction}
        currentViewMode={isFullScreen ? 'full' : viewMode}
      />
      
      {/* Notes Panel */}
      <SourceNotesPanel
        isOpen={showNotesPanel}
        onClose={() => setShowNotesPanel(false)}
        notes={notes}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
        sourceTitle={displayInfo.title}
      />
      
      <div className={`${isFullScreen ? 'h-full' : 'max-w-7xl'} mx-auto`}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <button
            onClick={() => isFullScreen ? setIsFullScreen(false) : navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-navy-900 rounded-xl hover:bg-cream-100 transition-colors border-2 border-gold-300 font-medium"
          >
            <ArrowRight className="w-5 h-5" />
            <span>{isFullScreen ? 'צא ממסך מלא' : 'חזור'}</span>
          </button>
          
          <div className="flex-1 bg-white p-4 rounded-xl border-2 border-gold-400 shadow-elegant">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-navy-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-900">{displayInfo.title}</h1>
                {displayInfo.subtitle && (
                  <p className="text-mouse-600">{displayInfo.subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Editing Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nikud Toggle */}
            <button
              onClick={() => setShowNikud(!showNikud)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold shadow-lg border-2 ${
                showNikud 
                  ? 'bg-green-500 text-white border-green-600' 
                  : 'bg-white text-navy-900 border-gold-300 hover:bg-cream-100'
              }`}
              title={showNikud ? 'הסתר ניקוד' : 'הצג ניקוד'}
            >
              <span className="text-lg">{showNikud ? 'אָ' : 'א'}</span>
              <span className="text-sm">{showNikud ? 'עם ניקוד' : 'ללא ניקוד'}</span>
            </button>
            
            {/* Commentators Button */}
            <button
              onClick={() => setShowCommentaryPanel(!showCommentaryPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold shadow-lg border-2 ${
                showCommentaryPanel 
                  ? 'bg-purple-500 text-white border-purple-600' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-400'
              }`}
              title="מפרשים"
            >
              <BookOpen className="w-5 h-5" />
              <span>מפרשים</span>
            </button>
            
            {/* Edit Button */}
            <button
              onClick={() => setShowEditingPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all font-bold shadow-lg"
              title="כלי עריכה (Ctrl+E)"
            >
              <Edit3 className="w-5 h-5" />
              <span>עריכה</span>
            </button>
            
            {/* Notes Button */}
            <button
              onClick={() => setShowNotesPanel(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold shadow-lg"
              title="הערות ושאלות"
            >
              <MessageSquare className="w-5 h-5" />
              {notes.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notes.length}
                </span>
              )}
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-xl border-2 border-gold-300 overflow-hidden">
              <button
                onClick={() => { setViewMode('normal'); setIsFullScreen(false); }}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'normal' && !isFullScreen ? 'bg-gold-500 text-white' : 'text-navy-700 hover:bg-gold-100'
                }`}
                title="תצוגה רגילה"
              >
                רגיל
              </button>
              <button
                onClick={() => { setViewMode('columns'); setIsFullScreen(false); }}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'columns' && !isFullScreen ? 'bg-gold-500 text-white' : 'text-navy-700 hover:bg-gold-100'
                }`}
                title="2 עמודות"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isFullScreen ? 'bg-gold-500 text-white' : 'text-navy-700 hover:bg-gold-100'
                }`}
                title="מסך מלא (ESC לסגירה)"
              >
                {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Related Psakim count badge */}
          {relatedPsakim.length > 0 && !isFullScreen && (
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 px-4 py-2 rounded-xl shadow-gold flex items-center gap-2 border border-gold-400">
              <FileText className="w-5 h-5" />
              <span className="font-bold">{relatedPsakim.length} פסקי דין קשורים</span>
            </div>
          )}
        </div>

        {/* Main Content - Two columns */}
        <div className={`grid gap-6 ${isFullScreen ? 'grid-cols-1 h-[calc(100%-80px)]' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Left: Source Text (2/3 width) */}
          <div className={`${isFullScreen ? 'h-full overflow-auto' : 'lg:col-span-2'} bg-white rounded-2xl border-2 border-gold-400 shadow-elegant overflow-hidden`}>
            {loading && (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <Loader className="w-12 h-12 text-gold-500 animate-spin" />
                <p className="text-navy-800 font-medium">טוען את הטקסט מספריא...</p>
                <p className="text-sm text-mouse-500">הטקסט יישמר לצפייה אופליין</p>
              </div>
            )}

            {error && (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-red-600 font-bold">{error}</p>
                <p className="text-sm text-mouse-600">נסה שוב מאוחר יותר או בדוק את החיבור לאינטרנט</p>
              </div>
            )}

            {!loading && !error && sourceData && (
              <div className="p-8">
                {/* Source info and controls */}
                <div className="mb-6 pb-6 border-b-2 border-gold-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900 mb-2">
                      {sourceData.versionTitle || sourceData.title || displayInfo.title}
                    </h2>
                    <p className="text-sm text-mouse-600">
                      {sourceData.heTitle || sourceData.indexTitle || displayInfo.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <Download className="w-4 h-4" />
                    <span>שמור לאופליין</span>
                  </div>
                </div>

                {/* Text content */}
                <div 
                  ref={contentRef}
                  className={`prose prose-lg max-w-none font-serif ${viewMode === 'columns' ? 'columns-2 gap-10' : ''}`}
                  dir="rtl"
                  style={{
                    fontSize: textStyles.fontSize,
                    lineHeight: textStyles.lineHeight,
                    fontFamily: textStyles.fontFamily,
                    color: textStyles.color,
                    textAlign: textStyles.textAlign,
                    backgroundColor: textStyles.backgroundColor,
                    columnRule: viewMode === 'columns' ? '2px solid #C9A227' : 'none',
                    padding: textStyles.backgroundColor !== '#ffffff' ? '16px' : '0',
                    borderRadius: textStyles.backgroundColor !== '#ffffff' ? '8px' : '0'
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onMouseUp={handleTextSelection}
                >
                  {renderText()}
                </div>
                
                {/* Commentators Panel */}
                {showCommentaryPanel && (
                  <div className="mt-8 border-2 border-purple-300 rounded-2xl overflow-hidden">
                    {/* Commentators Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        מפרשים
                      </h3>
                    </div>
                    
                    {/* Commentators Tabs */}
                    <div className="p-4 bg-purple-50 border-b border-purple-200">
                      <div className="flex flex-wrap gap-2">
                        {COMMENTATORS.map(comm => (
                          <button
                            key={comm.id}
                            onClick={() => loadCommentary(comm.id)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                              selectedCommentary === comm.id
                                ? 'bg-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-300'
                            }`}
                            style={{
                              borderColor: selectedCommentary === comm.id ? 'transparent' : comm.color
                            }}
                          >
                            {comm.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Commentary Content */}
                    <div className="p-6 bg-white max-h-96 overflow-y-auto" dir="rtl">
                      {!selectedCommentary && (
                        <div className="text-center text-mouse-500 py-8">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                          <p className="text-lg font-bold mb-1">בחר מפרש</p>
                          <p className="text-sm">לחץ על אחד המפרשים למעלה לצפייה בפירוש</p>
                        </div>
                      )}
                      
                      {commentaryLoading && (
                        <div className="text-center py-8">
                          <Loader className="w-8 h-8 mx-auto animate-spin text-purple-500 mb-2" />
                          <p className="text-mouse-600">טוען את {COMMENTATORS.find(c => c.id === selectedCommentary)?.name}...</p>
                        </div>
                      )}
                      
                      {selectedCommentary && !commentaryLoading && (
                        <div className="font-serif text-navy-800">
                          <div className="mb-3 pb-3 border-b border-purple-200">
                            <h4 className="font-bold text-purple-700">
                              {COMMENTATORS.find(c => c.id === selectedCommentary)?.hebrewName} {displayInfo.title}
                            </h4>
                          </div>
                          {renderCommentary()}
                        </div>
                      )}
                    </div>
                    
                    {/* Quick commentary links */}
                    <div className="p-3 bg-purple-50 border-t border-purple-200 flex items-center justify-between">
                      <div className="text-xs text-purple-600">
                        💡 טיפ: המפרשים נשמרים לצפייה אופליין
                      </div>
                      <button
                        onClick={() => {
                          setShowCommentaryPanel(false);
                          setSelectedCommentary(null);
                          setCommentaryData(null);
                        }}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        סגור מפרשים
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t-2 border-gold-200 text-sm text-mouse-500 text-center">
                  הטקסט נטען מ-
                  <a 
                    href="https://www.sefaria.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gold-600 hover:underline mx-1 font-medium"
                  >
                    ספריא
                  </a>
                  ושמור באופן מקומי לצפייה אופליין
                </div>
              </div>
            )}
          </div>

          {/* Right: Related Psakim (1/3 width) - Hidden in fullscreen */}
          {!isFullScreen && (
          <div className="bg-white rounded-2xl border-2 border-gold-400 shadow-elegant flex flex-col overflow-hidden">
            <button
              onClick={() => setShowRelatedPsakim(!showRelatedPsakim)}
              className="p-4 bg-gradient-to-l from-gold-500 to-navy-900 text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h2 className="font-bold">פסקי דין קשורים למקור זה</h2>
              </div>
              {showRelatedPsakim ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showRelatedPsakim && (
              <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-cream-200">
                {relatedPsakim.length === 0 ? (
                  <div className="p-8 text-center text-mouse-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gold-300" />
                    <p>לא נמצאו פסקי דין הקשורים למקור זה</p>
                  </div>
                ) : (
                  relatedPsakim.map((psakEntry) => {
                    const psak = psakim.find(p => p.id === psakEntry.psakId);
                    return (
                      <div key={psakEntry.psakId} className="p-4 hover:bg-cream-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-navy-900 text-sm">
                              {psakEntry.psakTitle}
                            </h3>
                            <span className="text-xs text-mouse-500">
                              פסק מס' {psakEntry.psakNumber}
                            </span>
                          </div>
                          <span className="bg-gold-500 text-navy-900 px-2 py-0.5 rounded-full text-xs font-bold">
                            {psakEntry.occurrences?.length || 1}×
                          </span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handlePsakClick(psakEntry.psakId)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-navy-900 text-gold-400 rounded-lg hover:bg-navy-800 transition-colors text-xs font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>פתח פסק</span>
                          </button>
                          {psak && (
                            <button
                              onClick={() => openSplitView(psak)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600 transition-colors text-xs font-bold"
                            >
                              <Columns className="w-3.5 h-3.5" />
                              <span>מפוצל</span>
                            </button>
                          )}
                        </div>
                        
                        {/* Show first occurrence preview */}
                        {psakEntry.occurrences && psakEntry.occurrences.length > 0 && (
                          <div className="mt-2 p-2 bg-gold-50 rounded-lg text-xs text-navy-700 border border-gold-200">
                            <span className="text-mouse-400">...</span>
                            <span className="bg-gold-200 px-1 rounded font-bold">
                              {psakEntry.occurrences[0].text?.substring(0, 50)}...
                            </span>
                            <span className="text-mouse-400">...</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Split View Modal */}
      {showSplitView && selectedPsak && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col border-2 border-gold-400">
            {/* Header */}
            <div className="p-4 border-b-2 border-gold-400 bg-gradient-to-l from-gold-500 to-navy-900 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3 text-white">
                <Columns className="w-6 h-6" />
                <h2 className="text-xl font-bold">תצוגה מפוצלת - מקור ופסק</h2>
              </div>
              <button
                onClick={() => {
                  setShowSplitView(false);
                  setSelectedPsak(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="סגור תצוגה מפוצלת"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Split Content */}
            <div className="flex-1 grid grid-cols-2 divide-x-2 divide-gold-300 overflow-hidden">
              {/* Left side - Source */}
              <div className="flex flex-col overflow-hidden">
                <div className="p-3 bg-gold-100 border-b-2 border-gold-300">
                  <h3 className="font-bold text-navy-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gold-600" />
                    {displayInfo.title} {displayInfo.subtitle}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-cream-100" dir="rtl">
                  {sourceData ? (
                    <div className="font-serif text-lg leading-loose text-navy-900">
                      {renderText()}
                    </div>
                  ) : (
                    <div className="text-center text-mouse-500 py-8">
                      <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-gold-500" />
                      <p>טוען...</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Psak */}
              <div className="flex flex-col overflow-hidden">
                <div className="p-3 bg-navy-100 border-b-2 border-gold-300">
                  <h3 className="font-bold text-navy-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-navy-600" />
                    {selectedPsak.title}
                    <span className="text-sm text-mouse-500 font-normal">
                      (פסק מס' {selectedPsak.number})
                    </span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-white" dir="rtl">
                  <div 
                    className="prose prose-lg max-w-none text-navy-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedPsak.content || '' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t-2 border-gold-400 bg-cream-100 flex items-center justify-between rounded-b-xl">
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/psak/${selectedPsak.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-gold-400 rounded-lg hover:bg-navy-800 transition-colors text-sm font-bold"
                >
                  <FileText className="w-4 h-4" />
                  פתח פסק בעמוד מלא
                </button>
              </div>
              <button
                onClick={() => setShowSplitView(false)}
                className="px-4 py-2 bg-cream-200 text-navy-700 rounded-lg hover:bg-cream-300 transition-colors"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceView;
