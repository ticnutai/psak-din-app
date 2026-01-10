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
  Check
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { extractAllSources } from '../utils/smartReferences';

interface PsakViewProps {
  psakim: PsakDin[];
}

const PsakView = ({ psakim }: PsakViewProps) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const psak = psakim.find(p => p.id === id);

  // Get highlight info from navigation state
  const highlightSource = location.state?.highlightSource;
  const occurrenceIndex = location.state?.occurrenceIndex ?? 0;

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
    // Simple approach: wrap the text at position with highlight span
    // This works on plain text - for HTML we'd need more sophisticated parsing
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
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/psakim"
          className="inline-flex items-center gap-2 text-mouse-500 hover:text-gold-600 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לרשימת הפסקים
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-l from-navy-900 to-navy-800 rounded-2xl p-8 text-white mb-6 shadow-xl border-2 border-gold-400">
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
              className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500/30 text-gold-200 rounded-full text-sm border border-gold-500/50"
            >
              <Tag className="w-3 h-3" />
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 border-2 border-gold-400 shadow-elegant">
            <h2 className="text-xl font-bold text-navy-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-600" />
              תוכן הפסק
            </h2>
            <div 
              ref={contentRef}
              className="psak-content hebrew-text text-navy-800"
              dangerouslySetInnerHTML={{ __html: psak.content }}
            />
          </div>
        </div>

        {/* Sidebar - References */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
            <h3 className="text-lg font-bold text-navy-900 mb-4">תקציר</h3>
            <p className="text-mouse-600 leading-relaxed">{psak.summary}</p>
          </div>

          {/* References */}
          {Object.keys(referencesByType).length > 0 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
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
                          className="p-3 bg-gold-50 rounded-lg border-2 border-gold-200 group cursor-pointer hover:bg-gold-100 transition-colors"
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
    </div>
  );
};

export default PsakView;
