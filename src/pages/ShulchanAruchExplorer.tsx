import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowRight, ChevronLeft, BookMarked } from 'lucide-react';

// מבנה השולחן ערוך - 4 חלקים עם טווח סימנים
const SHULCHAN_ARUCH_STRUCTURE = {
  'אורח חיים': {
    prefix: 'או"ח',
    range: [1, 697],
    color: 'from-blue-500 to-blue-600',
    description: 'דיני תפילה, שבת ומועדים'
  },
  'יורה דעה': {
    prefix: 'יו"ד',
    range: [1, 403],
    color: 'from-green-500 to-green-600',
    description: 'דיני איסור והיתר, נדרים ונדבות'
  },
  'אבן העזר': {
    prefix: 'אבה"ע',
    range: [1, 178],
    color: 'from-pink-500 to-pink-600',
    description: 'דיני אישות וגירושין'
  },
  'חושן משפט': {
    prefix: 'חו"מ',
    range: [1, 427],
    color: 'from-purple-500 to-purple-600',
    description: 'דיני ממונות ודינים'
  }
};

const CHELEK_ORDER = ['אורח חיים', 'יורה דעה', 'אבן העזר', 'חושן משפט'];

// המרת מספר לעברית
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

type ViewMode = 'chalakim' | 'simanim';

const ShulchanAruchExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('chalakim');
  const [selectedChelek, setSelectedChelek] = useState<string | null>(null);
  const [searchSiman, setSearchSiman] = useState('');

  const handleChelekClick = (chelek: string) => {
    setSelectedChelek(chelek);
    setViewMode('simanim');
  };

  const handleSimanClick = (siman: number) => {
    if (!selectedChelek) return;
    const chelekData = SHULCHAN_ARUCH_STRUCTURE[selectedChelek as keyof typeof SHULCHAN_ARUCH_STRUCTURE];
    const source = `shulchan_aruch:${chelekData.prefix}:${siman}`;
    navigate(`/source/${encodeURIComponent(source)}`);
  };

  const handleBack = () => {
    setViewMode('chalakim');
    setSelectedChelek(null);
    setSearchSiman('');
  };

  // Filter simanim by search
  const getFilteredSimanim = () => {
    if (!selectedChelek) return [];
    const chelekData = SHULCHAN_ARUCH_STRUCTURE[selectedChelek as keyof typeof SHULCHAN_ARUCH_STRUCTURE];
    const [start, end] = chelekData.range;
    const allSimanim = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    
    if (!searchSiman) return allSimanim;
    
    const searchNum = parseInt(searchSiman);
    if (isNaN(searchNum)) return allSimanim;
    
    return allSimanim.filter(s => s.toString().includes(searchNum.toString()));
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold">
              <Scale className="w-8 h-8 text-navy-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">שולחן ערוך</h1>
              <p className="text-mouse-600">
                {viewMode === 'chalakim' && 'בחר חלק מתוך ארבעת חלקי השולחן ערוך'}
                {viewMode === 'simanim' && `${selectedChelek} - בחר סימן`}
              </p>
            </div>
          </div>
          {viewMode !== 'chalakim' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-cream-200 text-navy-900 rounded-xl hover:bg-cream-300 transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              חזור
            </button>
          )}
        </div>
      </div>

      {/* Chalakim Grid */}
      {viewMode === 'chalakim' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CHELEK_ORDER.map((chelek) => {
            const chelekData = SHULCHAN_ARUCH_STRUCTURE[chelek as keyof typeof SHULCHAN_ARUCH_STRUCTURE];
            const [start, end] = chelekData.range;
            const simanCount = end - start + 1;
            
            return (
              <button
                key={chelek}
                onClick={() => handleChelekClick(chelek)}
                className="group bg-white rounded-2xl p-8 border-2 border-gold-300 hover:border-gold-500 shadow-elegant hover:shadow-gold transition-all text-right"
              >
                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${chelekData.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <BookMarked className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{chelek}</h2>
                <p className="text-lg text-gold-600 font-bold mb-2">{chelekData.prefix}</p>
                <p className="text-mouse-600 text-sm mb-3">{chelekData.description}</p>
                <p className="text-mouse-500 text-sm">
                  סימנים {start} - {end} ({simanCount} סימנים)
                </p>
                <div className="mt-4 flex items-center gap-2 text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>לחץ לפתיחה</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Simanim Grid */}
      {viewMode === 'simanim' && selectedChelek && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="חפש מספר סימן..."
                value={searchSiman}
                onChange={(e) => setSearchSiman(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-cream-50 border-2 border-gold-300 rounded-xl focus:outline-none focus:border-gold-500 text-navy-900 placeholder-mouse-400"
              />
              <BookMarked className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
            </div>
          </div>

          {/* Quick navigation */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[1, 50, 100, 150, 200, 250, 300, 350, 400].map((jump) => {
              const chelekData = SHULCHAN_ARUCH_STRUCTURE[selectedChelek as keyof typeof SHULCHAN_ARUCH_STRUCTURE];
              const [, end] = chelekData.range;
              if (jump > end) return null;
              
              return (
                <button
                  key={jump}
                  onClick={() => {
                    const element = document.getElementById(`siman-${jump}`);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-3 py-1.5 bg-gold-100 text-navy-900 rounded-lg hover:bg-gold-200 transition-colors text-sm font-medium"
                >
                  סימן {jump}
                </button>
              );
            })}
          </div>

          {/* Simanim grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[600px] overflow-y-auto">
            {getFilteredSimanim().map((siman) => (
              <button
                key={siman}
                id={`siman-${siman}`}
                onClick={() => handleSimanClick(siman)}
                className="group relative bg-cream-50 rounded-xl border-2 border-gold-300 hover:border-gold-500 hover:bg-gold-50 transition-all p-4 text-center"
              >
                <div className="text-lg font-bold text-navy-900 mb-1">
                  סימן {numberToHebrew(siman)}
                </div>
                <div className="text-xs text-mouse-500">
                  {siman}
                </div>
                {/* Green indicator dot */}
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gold-50 rounded-xl border border-gold-200">
            <p className="text-center text-navy-900 font-medium">
              {getFilteredSimanim().length === 0 && 'לא נמצאו סימנים'}
              {getFilteredSimanim().length > 0 && (
                <>
                  מציג {getFilteredSimanim().length} סימנים
                  {searchSiman && ` (מתוך ${SHULCHAN_ARUCH_STRUCTURE[selectedChelek as keyof typeof SHULCHAN_ARUCH_STRUCTURE].range[1] - SHULCHAN_ARUCH_STRUCTURE[selectedChelek as keyof typeof SHULCHAN_ARUCH_STRUCTURE].range[0] + 1})`}
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {viewMode === 'chalakim' && (
        <div className="fixed bottom-8 right-8">
          <button className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center text-navy-900 hover:scale-110">
            <Scale className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ShulchanAruchExplorer;
