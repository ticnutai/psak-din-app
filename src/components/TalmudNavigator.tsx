import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

// נתוני הש"ס
const SEDARIM = [
  {
    name: 'זרעים',
    masechtot: [
      { name: 'ברכות', pages: 64 },
      { name: 'שבת', pages: 157 },
      { name: 'עירובין', pages: 105 },
      { name: 'פסחים', pages: 121 },
      { name: 'שקלים', pages: 22 },
      { name: 'יומא', pages: 88 },
      { name: 'סוכה', pages: 56 },
      { name: 'ביצה', pages: 40 },
      { name: 'ראש השנה', pages: 35 },
      { name: 'תענית', pages: 31 },
      { name: 'מגילה', pages: 32 },
      { name: 'מועד קטן', pages: 29 },
      { name: 'חגיגה', pages: 27 }
    ]
  },
  {
    name: 'מועד',
    masechtot: [
      { name: 'שבת', pages: 157 },
      { name: 'עירובין', pages: 105 },
      { name: 'פסחים', pages: 121 },
      { name: 'שקלים', pages: 22 },
      { name: 'יומא', pages: 88 },
      { name: 'סוכה', pages: 56 },
      { name: 'ביצה', pages: 40 },
      { name: 'ראש השנה', pages: 35 },
      { name: 'תענית', pages: 31 },
      { name: 'מגילה', pages: 32 },
      { name: 'מועד קטן', pages: 29 },
      { name: 'חגיגה', pages: 27 }
    ]
  },
  {
    name: 'נשים',
    masechtot: [
      { name: 'יבמות', pages: 122 },
      { name: 'כתובות', pages: 112 },
      { name: 'נדרים', pages: 91 },
      { name: 'נזיר', pages: 66 },
      { name: 'סוטה', pages: 49 },
      { name: 'גיטין', pages: 90 },
      { name: 'קידושין', pages: 82 }
    ]
  },
  {
    name: 'נזיקין',
    masechtot: [
      { name: 'בבא קמא', pages: 119 },
      { name: 'בבא מציעא', pages: 119 },
      { name: 'בבא בתרא', pages: 176 },
      { name: 'סנהדרין', pages: 113 },
      { name: 'מכות', pages: 24 },
      { name: 'שבועות', pages: 49 },
      { name: 'עדויות', pages: 8 },
      { name: 'עבודה זרה', pages: 76 },
      { name: 'אבות', pages: 5 },
      { name: 'הוריות', pages: 14 }
    ]
  },
  {
    name: 'קדשים',
    masechtot: [
      { name: 'זבחים', pages: 120 },
      { name: 'מנחות', pages: 110 },
      { name: 'חולין', pages: 142 },
      { name: 'בכורות', pages: 61 },
      { name: 'ערכין', pages: 34 },
      { name: 'תמורה', pages: 34 },
      { name: 'כריתות', pages: 28 },
      { name: 'מעילה', pages: 22 },
      { name: 'תמיד', pages: 9 },
      { name: 'מידות', pages: 4 },
      { name: 'קינים', pages: 3 }
    ]
  },
  {
    name: 'טהרות',
    masechtot: [
      { name: 'כלים', pages: 30 },
      { name: 'אהלות', pages: 18 },
      { name: 'נגעים', pages: 14 },
      { name: 'פרה', pages: 12 },
      { name: 'טהרות', pages: 10 },
      { name: 'מקואות', pages: 10 },
      { name: 'נדה', pages: 73 },
      { name: 'מכשירין', pages: 6 },
      { name: 'זבים', pages: 5 },
      { name: 'טבול יום', pages: 4 },
      { name: 'ידים', pages: 4 },
      { name: 'עוקצין', pages: 3 }
    ]
  }
];

type NavigationLevel = 'seder' | 'masechet' | 'daf' | 'amud';

export const TalmudNavigator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState<NavigationLevel>('seder');
  const [selectedSeder, setSelectedSeder] = useState<number | null>(null);
  const [selectedMasechet, setSelectedMasechet] = useState<number | null>(null);
  const [selectedDaf, setSelectedDaf] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSederClick = (index: number) => {
    setSelectedSeder(index);
    setLevel('masechet');
  };

  const handleMasechetClick = (index: number) => {
    setSelectedMasechet(index);
    setLevel('daf');
  };

  const handleDafClick = (daf: number) => {
    setSelectedDaf(daf);
    setLevel('amud');
  };

  const handleAmudClick = (amud: 'א' | 'ב') => {
    if (selectedSeder !== null && selectedMasechet !== null && selectedDaf !== null) {
      const seder = SEDARIM[selectedSeder];
      const masechet = seder.masechtot[selectedMasechet];
      // Use correct format: gemara:מסכת:דף:עמוד
      const reference = `gemara:${masechet.name}:${selectedDaf}:${amud}`;
      
      // Navigate to source page
      navigate(`/source/${encodeURIComponent(reference)}`);
      setIsOpen(false);
      
      // Reset state
      setTimeout(() => {
        setLevel('seder');
        setSelectedSeder(null);
        setSelectedMasechet(null);
        setSelectedDaf(null);
      }, 300);
    }
  };

  const getCurrentMasechtot = () => {
    if (selectedSeder === null) return [];
    return SEDARIM[selectedSeder].masechtot;
  };

  const getMaxPages = () => {
    if (selectedSeder === null || selectedMasechet === null) return 0;
    return SEDARIM[selectedSeder].masechtot[selectedMasechet].pages;
  };

  const generateDafButtons = () => {
    const maxPages = getMaxPages();
    const buttons = [];
    for (let i = 1; i <= maxPages; i++) {
      buttons.push(i);
    }
    return buttons;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Main Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300
          ${isOpen 
            ? 'bg-gold-400 text-navy-900 rotate-180' 
            : 'bg-navy-900 text-gold-400 hover:bg-navy-800'
          }
        `}
        title="בחירה מהירה - ניווט בש״ס"
      >
        <BookOpen className="w-6 h-6" />
      </button>

      {/* Navigation Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-2xl border-2 border-gold-400 p-4 w-96 max-h-96 overflow-y-auto">
          {/* Header with Level Buttons */}
          <div className="flex gap-2 mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
            <button
              onClick={() => setLevel('seder')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                level === 'seder' 
                  ? 'bg-gold-400 text-navy-900' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              סדר
            </button>
            <button
              onClick={() => selectedSeder !== null && setLevel('masechet')}
              disabled={selectedSeder === null}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                level === 'masechet' 
                  ? 'bg-gold-400 text-navy-900' 
                  : selectedSeder !== null
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              מסכת
            </button>
            <button
              onClick={() => selectedMasechet !== null && setLevel('daf')}
              disabled={selectedMasechet === null}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                level === 'daf' 
                  ? 'bg-gold-400 text-navy-900' 
                  : selectedMasechet !== null
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              דף
            </button>
            <button
              onClick={() => selectedDaf !== null && setLevel('amud')}
              disabled={selectedDaf === null}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                level === 'amud' 
                  ? 'bg-gold-400 text-navy-900' 
                  : selectedDaf !== null
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
            >
              עמוד
            </button>
          </div>

          {/* Content based on level */}
          <div className="grid grid-cols-3 gap-2">
            {/* Sedarim Level */}
            {level === 'seder' && SEDARIM.map((seder, index) => (
              <button
                key={index}
                onClick={() => handleSederClick(index)}
                className={`
                  relative py-3 px-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${selectedSeder === index
                    ? 'bg-gold-100 border-2 border-gold-400 text-navy-900'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {selectedSeder === index && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                {seder.name}
              </button>
            ))}

            {/* Masechtot Level */}
            {level === 'masechet' && getCurrentMasechtot().map((masechet, index) => (
              <button
                key={index}
                onClick={() => handleMasechetClick(index)}
                className={`
                  relative py-3 px-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${selectedMasechet === index
                    ? 'bg-gold-100 border-2 border-gold-400 text-navy-900'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {selectedMasechet === index && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                {masechet.name}
              </button>
            ))}

            {/* Daf Level */}
            {level === 'daf' && generateDafButtons().map((daf) => (
              <button
                key={daf}
                onClick={() => handleDafClick(daf)}
                className={`
                  relative py-3 px-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${selectedDaf === daf
                    ? 'bg-gold-100 border-2 border-gold-400 text-navy-900'
                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {selectedDaf === daf && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                {daf}
              </button>
            ))}

            {/* Amud Level */}
            {level === 'amud' && (
              <>
                <button
                  onClick={() => handleAmudClick('א')}
                  className="relative py-6 px-2 rounded-lg text-lg font-bold bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gold-100 hover:border-gold-400 transition-all"
                >
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  א׳
                </button>
                <button
                  onClick={() => handleAmudClick('ב')}
                  className="relative py-6 px-2 rounded-lg text-lg font-bold bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gold-100 hover:border-gold-400 transition-all"
                >
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  ב׳
                </button>
              </>
            )}
          </div>

          {/* Breadcrumb */}
          {(selectedSeder !== null || selectedMasechet !== null || selectedDaf !== null) && (
            <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
              {selectedSeder !== null && SEDARIM[selectedSeder].name}
              {selectedMasechet !== null && ` → ${getCurrentMasechtot()[selectedMasechet].name}`}
              {selectedDaf !== null && ` → דף ${selectedDaf}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
