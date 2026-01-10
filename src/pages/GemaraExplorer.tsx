import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ChevronLeft } from 'lucide-react';

// מבנה הש"ס - 6 סדרים עם המסכתות שלהם
const SHAS_STRUCTURE = {
  'זרעים': {
    color: 'from-emerald-500 to-emerald-600',
    masechtot: ['ברכות', 'פאה', 'דמאי', 'כלאים', 'שביעית', 'תרומות', 'מעשרות', 'מעשר שני', 'חלה', 'ערלה', 'בכורים']
  },
  'מועד': {
    color: 'from-blue-500 to-blue-600',
    masechtot: ['שבת', 'עירובין', 'פסחים', 'שקלים', 'יומא', 'סוכה', 'ביצה', 'ראש השנה', 'תענית', 'מגילה', 'מועד קטן', 'חגיגה']
  },
  'נשים': {
    color: 'from-pink-500 to-pink-600',
    masechtot: ['יבמות', 'כתובות', 'נדרים', 'נזיר', 'סוטה', 'גיטין', 'קידושין']
  },
  'נזיקין': {
    color: 'from-orange-500 to-orange-600',
    masechtot: ['בבא קמא', 'בבא מציעא', 'בבא בתרא', 'סנהדרין', 'מכות', 'שבועות', 'עדויות', 'עבודה זרה', 'אבות', 'הוריות']
  },
  'קדשים': {
    color: 'from-purple-500 to-purple-600',
    masechtot: ['זבחים', 'מנחות', 'חולין', 'בכורות', 'ערכין', 'תמורה', 'כריתות', 'מעילה', 'תמיד', 'קינים']
  },
  'טהרות': {
    color: 'from-teal-500 to-teal-600',
    masechtot: ['כלים', 'אהלות', 'נגעים', 'פרה', 'טהרות', 'מקואות', 'נידה', 'מכשירין', 'זבים', 'טבול יום', 'ידים', 'עוקצין']
  }
};

const SEDER_ORDER = ['זרעים', 'מועד', 'נשים', 'נזיקין', 'קדשים', 'טהרות'];

// מספרי דפים למסכת (דוגמאות - בפועל יש להוסיף את כל המסכתות)
const MASECHET_PAGES: Record<string, number> = {
  'ברכות': 64,
  'שבת': 157,
  'עירובין': 105,
  'פסחים': 121,
  'יומא': 88,
  'סוכה': 56,
  'ביצה': 40,
  'ראש השנה': 35,
  'תענית': 31,
  'מגילה': 32,
  'מועד קטן': 29,
  'חגיגה': 27,
  'יבמות': 122,
  'כתובות': 112,
  'נדרים': 91,
  'נזיר': 66,
  'סוטה': 49,
  'גיטין': 90,
  'קידושין': 82,
  'בבא קמא': 119,
  'בבא מציעא': 119,
  'בבא בתרא': 176,
  'סנהדרין': 113,
  'מכות': 24,
  'שבועות': 49,
  'עבודה זרה': 76,
  'הוריות': 14,
  'זבחים': 120,
  'מנחות': 110,
  'חולין': 142,
  'בכורות': 61,
  'ערכין': 34,
  'תמורה': 34,
  'כריתות': 28,
  'מעילה': 22,
  'תמיד': 9,
  'קינים': 3,
  'כלים': 30,
  'אהלות': 18,
  'נגעים': 14,
  'פרה': 12,
  'טהרות': 10,
  'מקואות': 10,
  'נידה': 10,
  'מכשירין': 6,
  'זבים': 5,
  'טבול יום': 4,
  'ידים': 4,
  'עוקצין': 3
};

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

type ViewMode = 'sedarim' | 'masechtot' | 'pages';

const GemaraExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('sedarim');
  const [selectedSeder, setSelectedSeder] = useState<string | null>(null);
  const [selectedMasechet, setSelectedMasechet] = useState<string | null>(null);

  const handleSederClick = (seder: string) => {
    setSelectedSeder(seder);
    setViewMode('masechtot');
  };

  const handleMasechetClick = (masechet: string) => {
    setSelectedMasechet(masechet);
    setViewMode('pages');
  };

  const handlePageClick = (page: number, amud: 'א' | 'ב') => {
    if (!selectedMasechet) return;
    const source = `gemara:${selectedMasechet}:${page}:${amud}`;
    navigate(`/source/${encodeURIComponent(source)}`);
  };

  const handleBack = () => {
    if (viewMode === 'pages') {
      setViewMode('masechtot');
      setSelectedMasechet(null);
    } else if (viewMode === 'masechtot') {
      setViewMode('sedarim');
      setSelectedSeder(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold">
              <BookOpen className="w-8 h-8 text-navy-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">גמרא</h1>
              <p className="text-mouse-600">
                {viewMode === 'sedarim' && 'בחר סדר מתוך ששת סדרי המשנה'}
                {viewMode === 'masechtot' && `סדר ${selectedSeder} - בחר מסכת`}
                {viewMode === 'pages' && `מסכת ${selectedMasechet} - בחר דף`}
              </p>
            </div>
          </div>
          {viewMode !== 'sedarim' && (
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

      {/* Sedarim Grid */}
      {viewMode === 'sedarim' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SEDER_ORDER.map((seder) => {
            const sederData = SHAS_STRUCTURE[seder as keyof typeof SHAS_STRUCTURE];
            return (
              <button
                key={seder}
                onClick={() => handleSederClick(seder)}
                className="group bg-white rounded-2xl p-8 border-2 border-gold-300 hover:border-gold-500 shadow-elegant hover:shadow-gold transition-all text-center"
              >
                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${sederData.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{seder}</h2>
                <p className="text-mouse-600">
                  {sederData.masechtot.length} מסכתות
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>לחץ לפתיחה</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Masechtot List */}
      {viewMode === 'masechtot' && selectedSeder && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHAS_STRUCTURE[selectedSeder as keyof typeof SHAS_STRUCTURE].masechtot.map((masechet) => {
              const pageCount = MASECHET_PAGES[masechet] || 0;
              return (
                <button
                  key={masechet}
                  onClick={() => handleMasechetClick(masechet)}
                  className="group flex items-center justify-between p-4 bg-cream-50 rounded-xl border-2 border-gold-200 hover:border-gold-500 hover:bg-gold-50 transition-all"
                >
                  <div className="text-right">
                    <div className="text-lg font-bold text-navy-900">{masechet}</div>
                    <div className="text-sm text-mouse-600">{pageCount} דפים</div>
                  </div>
                  <div className="p-2 bg-gold-100 rounded-lg group-hover:bg-gold-200 transition-colors">
                    <BookOpen className="w-5 h-5 text-gold-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pages Grid */}
      {viewMode === 'pages' && selectedMasechet && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: MASECHET_PAGES[selectedMasechet] || 0 }, (_, i) => i + 2).map((page) => (
              <div key={page} className="relative">
                {/* Card for the page */}
                <div className="bg-cream-50 rounded-xl border-2 border-gold-300 p-3 text-center">
                  <div className="text-xl font-bold text-navy-900 mb-2">
                    דף {numberToHebrew(page)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageClick(page, 'א')}
                      className="flex-1 px-3 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600 transition-colors text-sm font-bold"
                    >
                      עמוד א
                    </button>
                    <button
                      onClick={() => handlePageClick(page, 'ב')}
                      className="flex-1 px-3 py-2 bg-navy-900 text-gold-400 rounded-lg hover:bg-navy-800 transition-colors text-sm font-bold"
                    >
                      עמוד ב
                    </button>
                  </div>
                </div>
                {/* Green indicator dot */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button (like in the design) */}
      {viewMode === 'sedarim' && (
        <div className="fixed bottom-8 right-8">
          <button className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center text-navy-900 hover:scale-110">
            <BookOpen className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default GemaraExplorer;
