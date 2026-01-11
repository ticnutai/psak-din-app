import React, { useState, useMemo } from 'react';
import { Navigation } from 'lucide-react';
import { PsakDin, Reference } from '../types';

interface NavigationSidebarProps {
  psak: PsakDin;
  onNavigate: (position: number) => void;
  onSourceClick: (source: string) => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

type TabType = 'summary' | 'toc' | 'sources';

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  psak,
  onNavigate,
  onSourceClick,
  isPinned = false,
  onTogglePin,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Extract headings from HTML content
  const tocItems = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(psak.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    return Array.from(headings).map((heading, index) => ({
      id: index,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.substring(1)),
      position: 0,
    }));
  }, [psak.content]);

  // Group references by type
  const groupedReferences = useMemo(() => {
    const groups: { [key: string]: Reference[] } = {};
    
    psak.references.forEach((ref) => {
      const type = ref.type === 'gemara' ? 'גמרא' :
                   ref.type === 'shulchan_aruch' ? 'שולחן ערוך' :
                   ref.type === 'rambam' ? 'רמב"ם' :
                   ref.type === 'mishna' ? 'משנה' :
                   ref.type === 'tur' ? 'טור' :
                   'אחר';
      
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(ref);
    });
    
    return groups;
  }, [psak.references]);

  // Filter references by search
  const filteredReferences = useMemo(() => {
    if (!searchQuery && !selectedCategory) return groupedReferences;
    
    const filtered: { [key: string]: Reference[] } = {};
    
    Object.entries(groupedReferences).forEach(([type, refs]) => {
      if (selectedCategory && type !== selectedCategory) return;
      
      const matchingRefs = refs.filter(ref =>
        ref.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ref.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingRefs.length > 0) {
        filtered[type] = matchingRefs;
      }
    });
    
    return filtered;
  }, [groupedReferences, searchQuery, selectedCategory]);

  const renderSummaryTab = () => (
    <div className="space-y-3">
      {/* Psak Info */}
      <div className="bg-white border-2 border-gold-400 rounded-xl p-4">
        <div className="text-sm text-mouse-500 mb-1">פסק מס׳</div>
        <div className="text-2xl font-bold text-navy-900">{psak.number}</div>
      </div>

      {/* Title */}
      <div className="bg-white border-2 border-gold-400 rounded-xl p-4">
        <div className="text-sm text-mouse-500 mb-2">כותרת</div>
        <div className="text-navy-900 font-medium leading-relaxed">{psak.title}</div>
      </div>

      {/* Date */}
      {psak.dateAdded && (
        <div className="bg-white border-2 border-gold-400 rounded-xl p-4">
          <div className="text-sm text-mouse-500 mb-1">תאריך הוספה</div>
          <div className="text-navy-900">{new Date(psak.dateAdded).toLocaleDateString('he-IL')}</div>
        </div>
      )}

      {/* Summary */}
      {psak.summary && (
        <div className="bg-white border-2 border-gold-400 rounded-xl p-4">
          <div className="text-sm text-mouse-500 mb-2">תקציר</div>
          <div className="text-navy-800 text-sm leading-relaxed">{psak.summary}</div>
        </div>
      )}

      {/* Categories */}
      {psak.categories.length > 0 && (
        <div className="bg-white border-2 border-gold-400 rounded-xl p-4">
          <div className="text-sm text-mouse-500 mb-3">קטגוריות</div>
          <div className="flex flex-wrap gap-2">
            {psak.categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gold-100 border border-gold-400 rounded-lg text-navy-800 text-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border-2 border-gold-400 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gold-500">{psak.references.length}</div>
          <div className="text-xs text-mouse-500 mt-1">מקורות</div>
        </div>
        <div className="bg-white border-2 border-gold-400 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gold-500">{psak.categories.length}</div>
          <div className="text-xs text-mouse-500 mt-1">קטגוריות</div>
        </div>
      </div>
    </div>
  );

  const renderTocTab = () => (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="חפש בתוכן..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-4 pl-4 py-2.5 bg-white border-2 border-gold-400 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 outline-none text-navy-900 placeholder-mouse-400"
        />
      </div>

      {/* TOC Items */}
      <div className="space-y-2">
        {tocItems.length > 0 ? (
          tocItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.position)}
              className="w-full text-right px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all"
              style={{ paddingRight: `${item.level * 12 + 16}px` }}
            >
              <div className="text-navy-900 font-medium">{item.text}</div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-mouse-500 text-sm">
            לא נמצאו כותרות בפסק
          </div>
        )}
      </div>
    </div>
  );

  const renderSourcesTab = () => (
    <div className="space-y-3">
      {/* Search and Filter */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="סנן מקורות..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-4 pl-4 py-2.5 bg-white border-2 border-gold-400 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 outline-none text-navy-900 placeholder-mouse-400"
        />
        
        {Object.keys(groupedReferences).length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-gold-400 text-navy-900'
                  : 'bg-white border border-gold-400 text-navy-800 hover:bg-gold-50'
              }`}
            >
              הכל
            </button>
            {Object.keys(groupedReferences).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCategory(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === type
                    ? 'bg-gold-400 text-navy-900'
                    : 'bg-white border border-gold-400 text-navy-800 hover:bg-gold-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {Object.entries(filteredReferences).map(([type, refs]) => (
          <div key={type}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-navy-900 font-bold">{type}</h4>
              <span className="px-2 py-0.5 bg-gold-100 border border-gold-400 rounded text-navy-800 text-xs">
                {refs.length} מקורות
              </span>
            </div>
            <div className="space-y-2">
              {refs.map((ref, idx) => (
                <button
                  key={idx}
                  onClick={() => onSourceClick(ref.source)}
                  className="w-full text-right px-4 py-3 bg-white border-2 border-gold-400 rounded-xl hover:bg-gold-50 hover:shadow-md transition-all group"
                >
                  <div className="text-navy-900 font-medium mb-1 group-hover:text-gold-600">
                    {ref.source}
                  </div>
                  <div className="text-mouse-500 text-sm line-clamp-2">
                    {ref.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(filteredReferences).length === 0 && (
          <div className="text-center py-8 text-mouse-500 text-sm">
            לא נמצאו מקורות תואמים
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col relative">
      {/* Floating Icon Button */}
      {onTogglePin && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-50 group">
          <button
            onClick={onTogglePin}
            className={`
              w-8 h-8 rounded-full shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${isPinned 
                ? 'bg-gold-500 text-white hover:bg-gold-600' 
                : 'bg-white text-gold-600 hover:bg-gold-50 border-2 border-gold-400'
              }
            `}
            title={isPinned ? 'בטל הצמדה' : 'הצמד'}
          >
            <Navigation className="w-4 h-4" />
          </button>
          {/* Tooltip on hover */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            <div className="bg-navy-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg">
              {isPinned ? 'בטל הצמדה' : 'הצמד סיידבר'}
            </div>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="h-full bg-cream-100 border-2 border-gold-400 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header with Tabs */}
        <div className="p-4 border-b-2 border-gold-400 bg-white">
          <h2 className="text-xl font-bold text-navy-900 text-center mb-4">ניווט ראשי</h2>
          
          {/* Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'summary'
                  ? 'bg-gold-400 text-navy-900 border-2 border-gold-500'
                  : 'bg-white border-2 border-gold-400 text-navy-800 hover:bg-gold-50'
              }`}
            >
              תקציר
            </button>
            <button
              onClick={() => setActiveTab('toc')}
              className={`px-3 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'toc'
                  ? 'bg-gold-400 text-navy-900 border-2 border-gold-500'
                  : 'bg-white border-2 border-gold-400 text-navy-800 hover:bg-gold-50'
              }`}
            >
              ראשים
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-2 rounded-xl font-medium transition-all ${
                activeTab === 'sources'
                  ? 'bg-gold-400 text-navy-900 border-2 border-gold-500'
                  : 'bg-white border-2 border-gold-400 text-navy-800 hover:bg-gold-50'
              }`}
            >
              מקורות
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'summary' && renderSummaryTab()}
          {activeTab === 'toc' && renderTocTab()}
          {activeTab === 'sources' && renderSourcesTab()}
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
