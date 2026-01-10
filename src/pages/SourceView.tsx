import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Loader, Download, AlertCircle, FileText, Columns, X, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { PsakDin } from '../types';
import { buildSourceIndex } from '../utils/smartReferences';

const SEFARIA_API = 'https://www.sefaria.org/api/texts/';
const CACHE_KEY_PREFIX = 'source-cache-';

interface SourceViewProps {
  psakim: PsakDin[];
}

const SourceView: React.FC<SourceViewProps> = ({ psakim }) => {
  const { source } = useParams<{ source: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<any>(null);
  const [displayInfo, setDisplayInfo] = useState({ title: '', subtitle: '' });
  
  // Split view state
  const [showSplitView, setShowSplitView] = useState(false);
  const [selectedPsak, setSelectedPsak] = useState<PsakDin | null>(null);
  const [showRelatedPsakim, setShowRelatedPsakim] = useState(true);

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
    const gemaraMatch = source.match(/gemara:([^:]+):(\d+):?([אב]?)/);
    if (gemaraMatch) {
      const masechet = gemaraMatch[1];
      const daf = gemaraMatch[2];
      const amud = gemaraMatch[3] || 'א';
      return `${masechet}.${daf}${amud}`;
    }

    const shulchanMatch = source.match(/shulchan_aruch:([^:]+):(\d+)/);
    if (shulchanMatch) {
      let chelek = shulchanMatch[1];
      const siman = shulchanMatch[2];
      
      if (chelek.includes('או"ח') || chelek.includes('אורח חיים')) chelek = 'Orach_Chayim';
      else if (chelek.includes('יו"ד') || chelek.includes('יורה דעה')) chelek = 'Yoreh_De\'ah';
      else if (chelek.includes('אבה"ע') || chelek.includes('אבן העזר')) chelek = 'Even_HaEzer';
      else if (chelek.includes('חו"מ') || chelek.includes('חושן משפט')) chelek = 'Choshen_Mishpat';
      
      return `Shulchan_Arukh,_${chelek}.${siman}`;
    }

    const bookMatch = source.match(/book:([^:]+):?(\d*)/);    if (bookMatch) {
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
    
    // If text is array (multi-segment), join with paragraphs
    if (Array.isArray(text)) {
      return (
        <div className="space-y-4">
          {text.map((segment: any, idx: number) => {
            if (Array.isArray(segment)) {
              return (
                <div key={idx} className="space-y-2">
                  {segment.map((line: string, lineIdx: number) => (
                    <p key={lineIdx} className="text-lg leading-loose" dangerouslySetInnerHTML={{ __html: line }} />
                  ))}
                </div>
              );
            }
            if (typeof segment === 'string' && segment.trim()) {
              return <p key={idx} className="text-lg leading-loose" dangerouslySetInnerHTML={{ __html: segment }} />;
            }
            return null;
          })}
        </div>
      );
    }

    // Single text segment
    if (typeof text === 'string') {
      return <div className="text-lg leading-loose" dangerouslySetInnerHTML={{ __html: text }} />;
    }

    return <p className="text-gray-500">פורמט טקסט לא נתמך</p>;
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
    <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-navy-900 rounded-xl hover:bg-cream-100 transition-colors border-2 border-gold-300 font-medium"
          >
            <ArrowRight className="w-5 h-5" />
            <span>חזור</span>
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
          
          {/* Related Psakim count badge */}
          {relatedPsakim.length > 0 && (
            <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 px-4 py-2 rounded-xl shadow-gold flex items-center gap-2 border border-gold-400">
              <FileText className="w-5 h-5" />
              <span className="font-bold">{relatedPsakim.length} פסקי דין קשורים</span>
            </div>
          )}
        </div>

        {/* Main Content - Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Source Text (2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant overflow-hidden">
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
                {/* Source info */}
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
                <div className="prose prose-lg max-w-none text-right font-serif text-navy-800" dir="rtl">
                  {renderText()}
                </div>

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

          {/* Right: Related Psakim (1/3 width) */}
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
