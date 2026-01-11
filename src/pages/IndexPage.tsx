import { useMemo, useState } from 'react';
import { PsakDin, IndexEntry, ReferenceType } from '../types';
import { getReferenceTypeName } from '../utils/psakUtils';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronLeft, Lightbulb } from 'lucide-react';

interface IndexPageProps {
  psakim: PsakDin[];
}

const IndexPage = ({ psakim }: IndexPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ReferenceType | ''>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Build index from psakim
  const indexData = useMemo(() => {
    const topicsMap = new Map<string, IndexEntry>();
    const referencesMap = new Map<string, { type: ReferenceType; count: number; psakim: string[] }>();

    psakim.forEach(psak => {
      // Index categories as topics
      psak.categories.forEach(cat => {
        const existing = topicsMap.get(cat);
        if (existing) {
          existing.occurrences.push({
            psakId: psak.id,
            psakTitle: psak.title,
            context: psak.summary || '',
            position: 0
          });
        } else {
          topicsMap.set(cat, {
            id: cat,
            term: cat,
            termType: 'topic',
            occurrences: [{
              psakId: psak.id,
              psakTitle: psak.title,
              context: psak.summary || '',
              position: 0
            }],
            relatedTerms: []
          });
        }
      });

      // Index references
      psak.references.forEach(ref => {
        const key = ref.source;
        const existing = referencesMap.get(key);
        if (existing) {
          existing.count++;
          if (!existing.psakim.includes(psak.id)) {
            existing.psakim.push(psak.id);
          }
        } else {
          referencesMap.set(key, {
            type: ref.type,
            count: 1,
            psakim: [psak.id]
          });
        }
      });
    });

    return {
      topics: Array.from(topicsMap.values()),
      references: Array.from(referencesMap.entries()).map(([source, data]) => ({
        source,
        ...data
      }))
    };
  }, [psakim]);

  // Filter references
  const filteredReferences = useMemo(() => {
    return indexData.references.filter(ref => {
      const matchesSearch = !searchQuery || 
        ref.source.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !selectedType || ref.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [indexData.references, searchQuery, selectedType]);

  // Group by type
  const referencesByType = useMemo(() => {
    const grouped: Record<ReferenceType, typeof filteredReferences> = {} as any;
    filteredReferences.forEach(ref => {
      if (!grouped[ref.type]) {
        grouped[ref.type] = [];
      }
      grouped[ref.type].push(ref);
    });
    return grouped;
  }, [filteredReferences]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const referenceTypes: ReferenceType[] = [
    'gemara', 'shulchan_aruch', 'rambam', 'tur', 'mishna', 'responsa', 'other'
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-800 mb-2 flex items-center gap-3">
          <span className="w-8 h-8 flex items-center justify-center bg-gold-500 text-navy-900 rounded text-lg font-bold">אי</span>
          אינדקס מפורט
        </h1>
        <p className="text-mouse-600">
          אינדקס חכם של כל ההפניות והנושאים מפסקי הדין
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gold-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-navy-100 rounded-lg">
              <span className="w-5 h-5 flex items-center justify-center text-navy-600 text-sm font-bold">פד</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-800">{psakim.length}</div>
              <div className="text-sm text-mouse-500">פסקי דין</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gold-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-100 rounded-lg">
              <span className="w-5 h-5 flex items-center justify-center text-gold-600 text-sm font-bold">מק</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-800">{indexData.references.length}</div>
              <div className="text-sm text-mouse-500">הפניות למקורות</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gold-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-100 rounded-lg">
              <span className="w-5 h-5 flex items-center justify-center text-gold-600 text-sm font-bold">נש</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-800">{indexData.topics.length}</div>
              <div className="text-sm text-mouse-500">נושאים</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gold-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-navy-100 rounded-lg">
              <span className="w-5 h-5 flex items-center justify-center text-navy-600 text-sm font-bold">#</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy-800">
                {Object.keys(referencesByType).length}
              </div>
              <div className="text-sm text-mouse-500">סוגי מקורות</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mouse-400">🔍</span>
              <input
                type="text"
                placeholder="חיפוש באינדקס..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gold-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mouse-400">▼</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ReferenceType | '')}
              className="pr-12 pl-8 py-3 border border-gold-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
            >
              <option value="">כל סוגי המקורות</option>
              {referenceTypes.map(type => (
                <option key={type} value={type}>{getReferenceTypeName(type)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      {indexData.topics.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200 mb-6">
          <h2 className="text-xl font-bold text-navy-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center bg-gold-100 text-gold-600 rounded text-xs font-bold">נש</span>
            נושאים עיקריים
          </h2>
          <div className="flex flex-wrap gap-2">
            {indexData.topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => toggleExpand(`topic-${topic.id}`)}
                className={`
                  px-4 py-2 rounded-xl border transition-all
                  ${expandedItems.has(`topic-${topic.id}`)
                    ? 'bg-gold-100 border-gold-300 text-navy-800'
                    : 'bg-mouse-50 border-mouse-200 text-navy-700 hover:bg-gold-50 hover:border-gold-200'
                  }
                `}
              >
                <span className="font-medium">{topic.term}</span>
                <span className="mr-2 text-sm opacity-70">({topic.occurrences.length})</span>
              </button>
            ))}
          </div>
          
          {/* Expanded topic details */}
          {indexData.topics.filter(t => expandedItems.has(`topic-${t.id}`)).map(topic => (
            <div key={`detail-${topic.id}`} className="mt-4 p-4 bg-gold-50 rounded-xl border border-gold-100">
              <h4 className="font-bold text-navy-800 mb-2">{topic.term}</h4>
              <div className="space-y-2">
                {topic.occurrences.map((occ, idx) => (
                  <Link
                    key={idx}
                    to={`/psak/${occ.psakId}`}
                    className="block p-3 bg-white rounded-lg hover:bg-gold-100 transition-colors"
                  >
                    <div className="font-medium text-navy-800">{occ.psakTitle}</div>
                    <div className="text-sm text-mouse-500 line-clamp-1">{occ.context}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* References by Type */}
      {Object.entries(referencesByType).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(referencesByType).map(([type, refs]) => (
            <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleExpand(type)}
                className="w-full p-6 flex items-center justify-between bg-gradient-to-l from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-gray-800">
                      {getReferenceTypeName(type as ReferenceType)}
                    </h3>
                    <p className="text-sm text-gray-500">{refs.length} הפניות</p>
                  </div>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedItems.has(type) ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {expandedItems.has(type) && (
                <div className="p-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {refs.map((ref, idx) => (
                      <div 
                        key={idx}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">{ref.source}</span>
                          <span className="text-sm text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            {ref.count}x
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            ב-{ref.psakim.length} פסקים
                          </span>
                          <ChevronLeft className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-amber-300" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            האינדקס יתמלא אוטומטית
          </h3>
          <p className="text-gray-400 mb-4">
            העלה פסקי דין והמערכת תזהה ותקטלג את כל ההפניות למקורות
          </p>
          <Link 
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            העלאת פסקים
          </Link>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
