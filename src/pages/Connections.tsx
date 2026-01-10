import { useMemo, useState } from 'react';
import { PsakDin, ReferenceType } from '../types';
import { getReferenceTypeName } from '../utils/psakUtils';
import { Link } from 'react-router-dom';
import { 
  Link2, 
  BookOpen, 
  Search,
  ExternalLink,
  FileText,
  Sparkles,
  Library
} from 'lucide-react';

interface ConnectionsProps {
  psakim: PsakDin[];
}

// Mock holy books data - in a real app this would come from an API
const holyBooks = [
  { id: 'gemara', name: 'תלמוד בבלי', icon: '📚', color: 'blue' },
  { id: 'shulchan_aruch', name: 'שולחן ערוך', icon: '📖', color: 'emerald' },
  { id: 'rambam', name: 'משנה תורה', icon: '📜', color: 'amber' },
  { id: 'tur', name: 'ארבעה טורים', icon: '📕', color: 'red' },
  { id: 'mishna', name: 'משנה', icon: '📗', color: 'green' },
  { id: 'responsa', name: 'שאלות ותשובות', icon: '✍️', color: 'purple' },
];

const Connections = ({ psakim }: ConnectionsProps) => {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Build connections data
  const connectionsData = useMemo(() => {
    const connections: Record<string, {
      book: typeof holyBooks[0];
      references: Array<{
        source: string;
        psakim: Array<{ id: string; title: string; number: number }>;
      }>;
    }> = {};

    holyBooks.forEach(book => {
      const refs = new Map<string, Array<{ id: string; title: string; number: number }>>();
      
      psakim.forEach(psak => {
        psak.references
          .filter(ref => ref.type === book.id)
          .forEach(ref => {
            const existing = refs.get(ref.source) || [];
            if (!existing.find(p => p.id === psak.id)) {
              existing.push({ id: psak.id, title: psak.title, number: psak.number });
            }
            refs.set(ref.source, existing);
          });
      });

      if (refs.size > 0) {
        connections[book.id] = {
          book,
          references: Array.from(refs.entries()).map(([source, psakim]) => ({
            source,
            psakim
          }))
        };
      }
    });

    return connections;
  }, [psakim]);

  const selectedBookData = selectedBook ? connectionsData[selectedBook] : null;

  const filteredReferences = useMemo(() => {
    if (!selectedBookData) return [];
    if (!searchQuery) return selectedBookData.references;
    
    return selectedBookData.references.filter(ref =>
      ref.source.includes(searchQuery)
    );
  }, [selectedBookData, searchQuery]);

  const totalConnections = Object.values(connectionsData).reduce(
    (acc, data) => acc + data.references.length, 0
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Link2 className="w-8 h-8 text-purple-500" />
          קישור לספרי קודש
        </h1>
        <p className="text-gray-600">
          חיבור פסקי הדין למקורות בגמרא, שולחן ערוך ושאר ספרי קודש
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{totalConnections} קישורים</h2>
            <p className="text-purple-200">נמצאו בין הפסקים לספרי הקודש</p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-300" />
            <Library className="w-10 h-10 text-white/80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Books List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              ספרי קודש
            </h2>
            <div className="space-y-2">
              {holyBooks.map(book => {
                const data = connectionsData[book.id];
                const count = data?.references.length || 0;
                const isSelected = selectedBook === book.id;
                
                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(isSelected ? null : book.id)}
                    disabled={count === 0}
                    className={`
                      w-full p-4 rounded-xl text-right transition-all flex items-center gap-3
                      ${isSelected 
                        ? 'bg-purple-100 border-2 border-purple-300 shadow-md' 
                        : count > 0
                          ? 'bg-gray-50 border border-gray-100 hover:bg-purple-50 hover:border-purple-200'
                          : 'bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="text-2xl">{book.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{book.name}</div>
                      <div className="text-sm text-gray-500">
                        {count > 0 ? `${count} הפניות` : 'אין הפניות'}
                      </div>
                    </div>
                    {count > 0 && (
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-bold
                        ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* References Panel */}
        <div className="lg:col-span-2">
          {selectedBookData ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-l from-purple-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{selectedBookData.book.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedBookData.book.name}
                    </h3>
                    <p className="text-gray-500">
                      {selectedBookData.references.length} מקומות מוזכרים בפסקים
                    </p>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`חיפוש ב${selectedBookData.book.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* References List */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {filteredReferences.length > 0 ? (
                  <div className="space-y-4">
                    {filteredReferences.map((ref, idx) => (
                      <div 
                        key={idx}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <span className="font-bold text-gray-800">{ref.source}</span>
                        </div>
                        <div className="space-y-2">
                          {ref.psakim.map(psak => (
                            <Link
                              key={psak.id}
                              to={`/psak/${psak.id}`}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors group"
                            >
                              <FileText className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                              <span className="text-sm text-gray-600 group-hover:text-purple-700">
                                פסק #{psak.number}: {psak.title}
                              </span>
                              <ExternalLink className="w-3 h-3 text-gray-300 mr-auto opacity-0 group-hover:opacity-100" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>לא נמצאו תוצאות</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <Library className="w-16 h-16 mx-auto mb-4 text-purple-300" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                בחר ספר קודש לצפייה בקישורים
              </h3>
              <p className="text-gray-400">
                לחץ על אחד מספרי הקודש משמאל לצפייה בכל ההפניות אליו מהפסקים
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          על מערכת הקישורים
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-indigo-700">
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-500">1.</span>
            <p>זיהוי אוטומטי של הפניות לגמרא, שו"ע, רמב"ם ועוד</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-500">2.</span>
            <p>מיפוי בין מקורות ההלכה לפסקי הדין הרלוונטיים</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-indigo-500">3.</span>
            <p>בעתיד: קישור ישיר לטקסט המלא בספרות התורנית</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;
