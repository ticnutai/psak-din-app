import { useMemo, useState } from 'react';
import { PsakDin } from '../types';
import { Link } from 'react-router-dom';

interface ConnectionsProps {
  psakim: PsakDin[];
}

// Mock holy books data - in a real app this would come from an API
const holyBooks = [
  { id: 'gemara', name: 'תלמוד בבלי', symbol: 'גמ', color: 'navy' },
  { id: 'shulchan_aruch', name: 'שולחן ערוך', symbol: 'ש"ע', color: 'gold' },
  { id: 'rambam', name: 'משנה תורה', symbol: 'רמ', color: 'navy' },
  { id: 'tur', name: 'ארבעה טורים', symbol: 'טור', color: 'gold' },
  { id: 'mishna', name: 'משנה', symbol: 'מש', color: 'navy' },
  { id: 'responsa', name: 'שאלות ותשובות', symbol: 'ש"ת', color: 'gold' },
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
        <h1 className="text-3xl font-bold text-navy-800 mb-2 flex items-center gap-3">
          <span className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center text-navy-900 font-bold">קש</span>
          קישור לספרי קודש
        </h1>
        <p className="text-mouse-600">
          חיבור פסקי הדין למקורות בגמרא, שולחן ערוך ושאר ספרי קודש
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-l from-navy-800 to-navy-900 rounded-2xl p-6 text-white mb-6 shadow-xl border-2 border-gold-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{totalConnections} קישורים</h2>
            <p className="text-mouse-300">נמצאו בין הפסקים לספרי הקודש</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center text-navy-900 font-bold">ספ</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Books List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gold-400 sticky top-6">
            <h2 className="text-lg font-bold text-navy-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-gold-500 rounded flex items-center justify-center text-navy-900 text-xs font-bold">ספ</span>
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
                        ? 'bg-gold-100 border-2 border-gold-500 shadow-md' 
                        : count > 0
                          ? 'bg-mouse-50 border border-mouse-200 hover:bg-gold-50 hover:border-gold-300'
                          : 'bg-mouse-50 border border-mouse-200 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${book.color === 'navy' ? 'bg-navy-800 text-gold-400' : 'bg-gold-500 text-navy-900'}`}>{book.symbol}</span>
                    <div className="flex-1">
                      <div className="font-medium text-navy-800">{book.name}</div>
                      <div className="text-sm text-mouse-500">
                        {count > 0 ? `${count} הפניות` : 'אין הפניות'}
                      </div>
                    </div>
                    {count > 0 && (
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-bold
                        ${isSelected ? 'bg-gold-500 text-navy-900' : 'bg-mouse-200 text-mouse-600'}
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
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gold-400 overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-l from-gold-50 to-mouse-50 border-b border-gold-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${selectedBookData.book.color === 'navy' ? 'bg-navy-800 text-gold-400' : 'bg-gold-500 text-navy-900'}`}>{selectedBookData.book.symbol}</span>
                  <div>
                    <h3 className="text-xl font-bold text-navy-800">
                      {selectedBookData.book.name}
                    </h3>
                    <p className="text-mouse-500">
                      {selectedBookData.references.length} מקומות מוזכרים בפסקים
                    </p>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-sm">חפש</span>
                  <input
                    type="text"
                    placeholder={`חיפוש ב${selectedBookData.book.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-16 pl-4 py-3 border-2 border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 outline-none"
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
                        className="p-4 bg-mouse-50 rounded-xl border border-gold-200 hover:border-gold-400 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-gold-500"></span>
                          <span className="font-bold text-navy-800">{ref.source}</span>
                        </div>
                        <div className="space-y-2">
                          {ref.psakim.map(psak => (
                            <Link
                              key={psak.id}
                              to={`/psak/${psak.id}`}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-mouse-200 hover:border-gold-400 hover:bg-gold-50 transition-colors group"
                            >
                              <span className="w-6 h-6 bg-gold-100 rounded flex items-center justify-center text-xs font-bold text-gold-600 group-hover:bg-gold-500 group-hover:text-navy-900">פד</span>
                              <span className="text-sm text-navy-600 group-hover:text-navy-800">
                                פסק #{psak.number}: {psak.title}
                              </span>
                              <span className="text-gold-500 mr-auto opacity-0 group-hover:opacity-100">►</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-mouse-500">
                    <div className="w-16 h-16 mx-auto mb-3 bg-mouse-100 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-mouse-300">חפ</span>
                    </div>
                    <p>לא נמצאו תוצאות</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border-2 border-gold-400">
              <div className="w-20 h-20 mx-auto mb-4 bg-gold-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-gold-400">ספ</span>
              </div>
              <h3 className="text-xl font-medium text-navy-600 mb-2">
                בחר ספר קודש לצפייה בקישורים
              </h3>
              <p className="text-mouse-400">
                לחץ על אחד מספרי הקודש משמאל לצפייה בכל ההפניות אליו מהפסקים
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-br from-gold-50 to-mouse-50 rounded-2xl p-6 border-2 border-gold-400">
        <h3 className="text-lg font-bold text-navy-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center text-navy-900 font-bold">?</span>
          על מערכת הקישורים
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-navy-700">
          <div className="flex items-start gap-2">
            <span className="font-bold text-gold-600">1.</span>
            <p>זיהוי אוטומטי של הפניות לגמרא, שו"ע, רמב"ם ועוד</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-gold-600">2.</span>
            <p>מיפוי בין מקורות ההלכה לפסקי הדין הרלוונטיים</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-gold-600">3.</span>
            <p>בעתיד: קישור ישיר לטקסט המלא בספרות התורנית</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;
