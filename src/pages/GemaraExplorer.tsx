import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// מבנה הש"ס - 6 סדרים עם המסכתות שיש להם גמרא בבלי בלבד
const SHAS_STRUCTURE = {
  'זרעים': {
    color: 'from-navy-700 to-navy-800',
    // רק ברכות יש גמרא בבלי בסדר זרעים
    masechtot: ['ברכות']
  },
  'מועד': {
    color: 'from-gold-500 to-gold-600',
    // שקלים אין גמרא בבלי (רק ירושלמי)
    masechtot: ['שבת', 'עירובין', 'פסחים', 'יומא', 'סוכה', 'ביצה', 'ראש השנה', 'תענית', 'מגילה', 'מועד קטן', 'חגיגה']
  },
  'נשים': {
    color: 'from-navy-600 to-navy-700',
    masechtot: ['יבמות', 'כתובות', 'נדרים', 'נזיר', 'סוטה', 'גיטין', 'קידושין']
  },
  'נזיקין': {
    color: 'from-gold-600 to-gold-700',
    // עדויות ואבות אין גמרא בבלי
    masechtot: ['בבא קמא', 'בבא מציעא', 'בבא בתרא', 'סנהדרין', 'מכות', 'שבועות', 'עבודה זרה', 'הוריות']
  },
  'קדשים': {
    color: 'from-navy-800 to-navy-900',
    // קינים אין גמרא בבלי
    masechtot: ['זבחים', 'מנחות', 'חולין', 'בכורות', 'ערכין', 'תמורה', 'כריתות', 'מעילה', 'תמיד']
  },
  'טהרות': {
    color: 'from-mouse-500 to-mouse-600',
    // רק נידה יש גמרא בבלי בסדר טהרות
    masechtot: ['נידה']
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
    
    // ניווט לדף המקור בתוך האפליקציה - עם פסקי דין קשורים
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
            <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold flex items-center justify-center">
              <span className="text-lg font-bold text-navy-900">גמ</span>
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
              className="flex items-center gap-2 px-4 py-2 bg-mouse-200 text-navy-900 rounded-xl hover:bg-mouse-300 transition-colors font-medium"
            >
              <span>◀</span>
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
                    <span className="text-2xl font-bold text-white">{seder.substring(0, 2)}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{seder}</h2>
                <p className="text-mouse-600">
                  {sederData.masechtot.length} מסכתות
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>לחץ לפתיחה</span>
                  <span>►</span>
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
                  className="group flex items-center justify-between p-4 bg-mouse-50 rounded-xl border-2 border-gold-200 hover:border-gold-500 hover:bg-gold-50 transition-all"
                >
                  <div className="text-right">
                    <div className="text-lg font-bold text-navy-900">{masechet}</div>
                    <div className="text-sm text-mouse-600">{pageCount} דפים</div>
                  </div>
                  <div className="w-10 h-10 bg-gold-100 rounded-lg group-hover:bg-gold-200 transition-colors flex items-center justify-center">
                    <span className="text-sm font-bold text-gold-600">מס</span>
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
                <div className="bg-mouse-50 rounded-xl border-2 border-gold-300 p-3 text-center">
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
                {/* Indicator dot */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gold-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {viewMode === 'sedarim' && (
        <div className="fixed bottom-8 right-8">
          <button className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center text-navy-900 hover:scale-110">
            <span className="text-xl font-bold">גמ</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GemaraExplorer;
