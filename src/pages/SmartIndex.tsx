import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { PsakDin } from '../types';
import { buildSourceIndex, getSourcesByFrequency } from '../utils/smartReferences';

interface SmartIndexProps {
  psakim: PsakDin[];
}

type SourceType = 'all' | 'gemara' | 'shulchan_aruch' | 'rambam' | 'mishna';

interface TreeNode {
  key: string;
  label: string;
  count: number;
  children?: TreeNode[];
  source?: string; // The normalized source key
}

// Shulchan Aruch structure - 4 parts
const SHULCHAN_ARUCH_STRUCTURE = {
  'אורח חיים': { prefix: 'או"ח', range: [1, 697] },
  'יורה דעה': { prefix: 'יו"ד', range: [1, 403] },
  'אבן העזר': { prefix: 'אבה"ע', range: [1, 178] },
  'חושן משפט': { prefix: 'חו"מ', range: [1, 427] }
};

const SHULCHAN_ARUCH_ORDER = ['אורח חיים', 'יורה דעה', 'אבן העזר', 'חושן משפט'];

// Rambam structure - 14 books
const RAMBAM_STRUCTURE = [
  'ספר המדע',
  'ספר אהבה',
  'ספר זמנים',
  'ספר נשים',
  'ספר קדושה',
  'ספר הפלאה',
  'ספר זרעים',
  'ספר עבודה',
  'ספר קרבנות',
  'ספר טהרה',
  'ספר נזקים',
  'ספר קנין',
  'ספר משפטים',
  'ספר שופטים'
];

// Shas structure - 6 Sedarim with their Masechtot in order
const SHAS_STRUCTURE = {
  'זרעים': ['ברכות', 'פאה', 'דמאי', 'כלאים', 'שביעית', 'תרומות', 'מעשרות', 'מעשר שני', 'חלה', 'ערלה', 'בכורים'],
  'מועד': ['שבת', 'עירובין', 'פסחים', 'שקלים', 'יומא', 'סוכה', 'ביצה', 'ראש השנה', 'תענית', 'מגילה', 'מועד קטן', 'חגיגה'],
  'נשים': ['יבמות', 'כתובות', 'נדרים', 'נזיר', 'סוטה', 'גיטין', 'קידושין'],
  'נזיקין': ['בבא קמא', 'בבא מציעא', 'בבא בתרא', 'סנהדרין', 'מכות', 'שבועות', 'עדויות', 'עבודה זרה', 'אבות', 'הוריות'],
  'קדשים': ['זבחים', 'מנחות', 'חולין', 'בכורות', 'ערכין', 'תמורה', 'כריתות', 'מעילה', 'תמיד', 'קינים'],
  'טהרות': ['כלים', 'אהלות', 'נגעים', 'פרה', 'טהרות', 'מקואות', 'נידה', 'מכשירין', 'זבים', 'טבול יום', 'ידים', 'עוקצין']
};

const SEDER_ORDER = ['זרעים', 'מועד', 'נשים', 'נזיקין', 'קדשים', 'טהרות'];

// Get Seder for a Masechet
const getSederForMasechet = (masechet: string): string | null => {
  for (const [seder, masechtot] of Object.entries(SHAS_STRUCTURE)) {
    if (masechtot.includes(masechet)) {
      return seder;
    }
  }
  return null;
};

const SmartIndex: React.FC<SmartIndexProps> = ({ psakim }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<SourceType>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showPsakSelector, setShowPsakSelector] = useState(false);
  const [selectedPsakIds, setSelectedPsakIds] = useState<Set<string>>(
    new Set(psakim.map(p => p.id))
  );
  
  // Split View state
  const [showSplitView, setShowSplitView] = useState(false);
  const [splitViewSource, setSplitViewSource] = useState<string | null>(null);
  const [splitViewPsak, setSplitViewPsak] = useState<PsakDin | null>(null);
  const [splitSourceData, setSplitSourceData] = useState<any>(null);
  const [splitLoading, setSplitLoading] = useState(false);
  
  const SEFARIA_API = 'https://www.sefaria.org/api/texts/';
  const CACHE_KEY_PREFIX = 'source-cache-';

  // Helper functions - defined first
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      gemara: 'גמרא',
      shulchan_aruch: 'שולחן ערוך',
      rambam: 'רמב"ם',
      mishna: 'משנה',
      tur: 'טור',
      other: 'אחר',
    };
    return labels[type] || type;
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

  const buildGemaraTree = (gemaraSources: any[]): TreeNode => {
    // Group by Seder, then Masechet
    const bySeder: { [seder: string]: { [masechet: string]: any[] } } = {};
    
    for (const source of gemaraSources) {
      const match = source.source.match(/gemara:([^:]+):(\d+)([אב]?)/);
      if (!match) continue;
      
      const masechet = match[1];
      const seder = getSederForMasechet(masechet) || 'אחר';
      
      if (!bySeder[seder]) {
        bySeder[seder] = {};
      }
      if (!bySeder[seder][masechet]) {
        bySeder[seder][masechet] = [];
      }
      bySeder[seder][masechet].push(source);
    }
    
    // Build Sedarim nodes in order
    const sedarim = SEDER_ORDER
      .filter(seder => bySeder[seder])
      .map(seder => {
        const masechtotInSeder = bySeder[seder];
        
        // Build Masechtot nodes in order
        const masechtot = (SHAS_STRUCTURE[seder as keyof typeof SHAS_STRUCTURE] || [])
          .filter(masechet => masechtotInSeder[masechet])
          .map(masechet => {
            const sources = masechtotInSeder[masechet];
      // Group by daf
      const byDaf: { [daf: string]: any[] } = {};
      
      for (const source of sources) {
        const match = source.source.match(/gemara:[^:]+:(\d+)([אב]?)/);
        if (!match) continue;
        
        const daf = match[1];
        if (!byDaf[daf]) {
          byDaf[daf] = [];
        }
        byDaf[daf].push(source);
      }
      
            // Build daf nodes - sort numerically and FILTER OUT daf 1 (doesn't exist in Gemara)
            const dafim = Object.entries(byDaf)
              .filter(([daf]) => parseInt(daf) > 1) // Skip daf 1 - Gemara starts from daf 2
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([daf, dafSources]) => {
                const dafNumber = parseInt(daf);
                const hebrewDaf = numberToHebrew(dafNumber);
                
                // Always group by amud (א and ב) - every daf has both
                const amudA = dafSources.filter((s: any) => s.source.endsWith('א'));
                const amudB = dafSources.filter((s: any) => s.source.endsWith('ב'));
                
                const children: TreeNode[] = [];
                
                // Add עמוד א if exists
                if (amudA.length > 0) {
                  children.push({
                    key: amudA[0].source,
                    label: `עמוד א`,
                    count: amudA.reduce((sum: number, s: any) => sum + s.count, 0),
                    source: amudA[0].source,
                  });
                }
                
                // Add עמוד ב if exists
                if (amudB.length > 0) {
                  children.push({
                    key: amudB[0].source,
                    label: `עמוד ב`,
                    count: amudB.reduce((sum: number, s: any) => sum + s.count, 0),
                    source: amudB[0].source,
                  });
                }
                
                // If no amudim specified, show just the daf (no children)
                if (children.length === 0) {
                  return {
                    key: dafSources[0].source,
                    label: `דף ${hebrewDaf}`,
                    count: dafSources.reduce((sum: number, s: any) => sum + s.count, 0),
                    source: dafSources[0].source,
                  };
                }
                
                // If there are amudim, show daf with children AND add source to daf (default to עמוד א)
                return {
                  key: `daf-${masechet}-${daf}`,
                  label: `דף ${hebrewDaf}`,
                  count: dafSources.reduce((sum: number, s: any) => sum + s.count, 0),
                  source: `gemara:${masechet}:${daf}:א`, // Default daf source points to amud aleph
                  children,
                };
              });
            
            return {
              key: `masechet-${masechet}`,
              label: masechet,
              count: sources.reduce((sum: number, s: any) => sum + s.count, 0),
              source: `gemara:${masechet}:2:א`, // Default masechet source points to daf bet amud aleph
              children: dafim,
            };
          });
        
        return {
          key: `seder-${seder}`,
          label: seder,
          count: Object.values(masechtotInSeder).flat().reduce((sum: number, s: any) => sum + s.count, 0),
          children: masechtot,
        };
      });
    
    return {
      key: 'gemara',
      label: 'גמרא',
      count: gemaraSources.reduce((sum, s) => sum + s.count, 0),
      children: sedarim,
    };
  };

  const buildShulchanAruchTree = (shulchanAruchSources: any[]): TreeNode => {
    // Group by Chelek (part)
    const byChelek: { [chelek: string]: any[] } = {};
    
    for (const source of shulchanAruchSources) {
      // Match patterns like: shulchan_aruch:או"ח:123 or shulchan_aruch:אורח חיים:123
      const match = source.source.match(/shulchan_aruch:([^:]+):(\d+)/);
      if (!match) continue;
      
      let chelek = match[1];
      // Normalize chelek names
      if (chelek.includes('או"ח') || chelek.includes('אורח חיים')) chelek = 'אורח חיים';
      else if (chelek.includes('יו"ד') || chelek.includes('יורה דעה')) chelek = 'יורה דעה';
      else if (chelek.includes('אבה"ע') || chelek.includes('אבן העזר')) chelek = 'אבן העזר';
      else if (chelek.includes('חו"מ') || chelek.includes('חושן משפט')) chelek = 'חושן משפט';
      
      if (!byChelek[chelek]) {
        byChelek[chelek] = [];
      }
      byChelek[chelek].push(source);
    }
    
    // Build Chalakim nodes in order
    const chalakim = SHULCHAN_ARUCH_ORDER
      .filter(chelek => byChelek[chelek])
      .map(chelek => {
        const sources = byChelek[chelek];
        const prefix = SHULCHAN_ARUCH_STRUCTURE[chelek as keyof typeof SHULCHAN_ARUCH_STRUCTURE].prefix;
        
        // Group by Siman
        const bySiman: { [siman: string]: any[] } = {};
        for (const source of sources) {
          const match = source.source.match(/:(\d+)/);
          if (match) {
            const siman = match[1];
            if (!bySiman[siman]) {
              bySiman[siman] = [];
            }
            bySiman[siman].push(source);
          }
        }
        
        // Build Siman nodes
        const simanim = Object.entries(bySiman)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([siman, simanSources]) => ({
            key: simanSources[0].source,
            label: `סימן ${numberToHebrew(parseInt(siman))}`,
            count: simanSources.reduce((sum: number, s: any) => sum + s.count, 0),
            source: simanSources[0].source,
          }));
        
        return {
          key: `shulchan-aruch-${chelek}`,
          label: `${chelek} (${prefix})`,
          count: sources.reduce((sum: number, s: any) => sum + s.count, 0),
          children: simanim,
        };
      });
    
    return {
      key: 'shulchan_aruch',
      label: 'שולחן ערוך',
      count: shulchanAruchSources.reduce((sum, s) => sum + s.count, 0),
      children: chalakim,
    };
  };

  const buildRambamTree = (rambamSources: any[]): TreeNode => {
    // Group by Sefer (book)
    const bySefer: { [sefer: string]: any[] } = {};
    
    for (const source of rambamSources) {
      // Match pattern like: rambam:ספר המדע:הלכות יסודי התורה:פרק א:הלכה א
      const match = source.source.match(/rambam:([^:]+)/);
      if (!match) continue;
      
      const sefer = match[1];
      if (!bySefer[sefer]) {
        bySefer[sefer] = [];
      }
      bySefer[sefer].push(source);
    }
    
    // Build Sefarim nodes in order
    const sefarim = RAMBAM_STRUCTURE
      .filter(sefer => bySefer[sefer])
      .map(sefer => ({
        key: `rambam-${sefer}`,
        label: sefer,
        count: bySefer[sefer].reduce((sum: number, s: any) => sum + s.count, 0),
        children: bySefer[sefer].map((s: any) => ({
          key: s.source,
          label: s.display,
          count: s.count,
          source: s.source,
        })),
      }));
    
    return {
      key: 'rambam',
      label: 'רמב"ם',
      count: rambamSources.reduce((sum, s) => sum + s.count, 0),
      children: sefarim,
    };
  };

  // Build the index only from selected psakim
  const sourceIndex = useMemo(() => {
    const selectedPsakim = psakim.filter(p => selectedPsakIds.has(p.id));
    return buildSourceIndex(
      selectedPsakim.map(p => ({
        id: p.id,
        title: p.title,
        number: p.number,
        rawText: p.rawText,
      }))
    );
  }, [psakim, selectedPsakIds]);

  // Build tree structure for Gemara sources
  const treeData = useMemo(() => {
    const sources = getSourcesByFrequency(sourceIndex);
    
    // Filter by type
    let filtered = sources;
    if (filterType !== 'all') {
      filtered = sources.filter(s => s.type === filterType);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.display.toLowerCase().includes(query));
    }

    // Group by type and build tree
    const tree: TreeNode[] = [];
    
    // Gemara with full Shas structure
    if (filterType === 'all' || filterType === 'gemara') {
      const gemaraSources = filtered.filter(s => s.type === 'gemara');
      if (gemaraSources.length > 0) {
        const gemaraNode = buildGemaraTree(gemaraSources);
        if (gemaraNode.children && gemaraNode.children.length > 0) {
          tree.push(gemaraNode);
        }
      }
    }
    
    // Shulchan Aruch with 4 parts structure
    if (filterType === 'all' || filterType === 'shulchan_aruch') {
      const shulchanAruchSources = filtered.filter(s => s.type === 'shulchan_aruch');
      if (shulchanAruchSources.length > 0) {
        const shulchanAruchNode = buildShulchanAruchTree(shulchanAruchSources);
        if (shulchanAruchNode.children && shulchanAruchNode.children.length > 0) {
          tree.push(shulchanAruchNode);
        }
      }
    }
    
    // Rambam with 14 books structure
    if (filterType === 'all' || filterType === 'rambam') {
      const rambamSources = filtered.filter(s => s.type === 'rambam');
      if (rambamSources.length > 0) {
        const rambamNode = buildRambamTree(rambamSources);
        if (rambamNode.children && rambamNode.children.length > 0) {
          tree.push(rambamNode);
        }
      }
    }
    
    // Mishna as flat list
    if (filterType === 'all' || filterType === 'mishna') {
      const mishnaSources = filtered.filter(s => s.type === 'mishna');
      if (mishnaSources.length > 0) {
        tree.push({
          key: 'mishna',
          label: getTypeLabel('mishna'),
          count: mishnaSources.reduce((sum, s) => sum + s.count, 0),
          children: mishnaSources.map(s => ({
            key: s.source,
            label: s.display,
            count: s.count,
            source: s.source,
          })),
        });
      }
    }
    
    return tree;
  }, [sourceIndex, filterType, searchQuery]);

  const toggleNode = (key: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getNodeIcon = (level: number, hasChildren: boolean) => {
    if (level === 0) return <span className="w-5 h-5 flex items-center justify-center bg-navy-100 text-navy-900 rounded text-xs font-bold">גמ</span>; // גמרא
    if (level === 1) return <span className="w-5 h-5 flex items-center justify-center bg-gold-100 text-gold-700 rounded text-xs font-bold">סד</span>; // סדר
    if (level === 2) return <span className="w-4 h-4 flex items-center justify-center bg-navy-50 text-navy-700 rounded text-xs font-bold">מס</span>; // מסכת
    if (level === 3 && hasChildren) return <span className="w-4 h-4 flex items-center justify-center bg-gold-50 text-gold-600 rounded text-xs font-bold">דף</span>; // דף
    return <span className="w-3.5 h-3.5 flex items-center justify-center bg-mouse-100 text-mouse-600 rounded text-xs font-bold">ע</span>; // עמוד
  };

  const getNodeStyle = (level: number, isSelected: boolean, isExpanded: boolean) => {
    if (isSelected) {
      return 'bg-gradient-to-l from-gold-100 to-white border-r-4 border-gold-500 shadow-sm';
    }
    
    if (level === 0) {
      return isExpanded 
        ? 'bg-gradient-to-l from-navy-50 to-white hover:from-navy-100' 
        : 'hover:bg-gradient-to-l hover:from-navy-50 hover:to-white';
    }
    if (level === 1) {
      return isExpanded
        ? 'bg-gradient-to-l from-gold-50 to-white hover:from-gold-100'
        : 'hover:bg-gradient-to-l hover:from-gold-50 hover:to-white';
    }
    if (level === 2) {
      return isExpanded
        ? 'bg-gradient-to-l from-mouse-200 to-white hover:from-mouse-300'
        : 'hover:bg-gradient-to-l hover:from-mouse-100 hover:to-white';
    }
    if (level === 3) {
      return isExpanded
        ? 'bg-gradient-to-l from-gold-50/50 to-white hover:from-gold-50'
        : 'hover:bg-gradient-to-l hover:from-gold-50/50 hover:to-white';
    }
    return 'hover:bg-mouse-100';
  };

  const renderTree = (nodes: TreeNode[], level: number = 0): React.ReactNode => {
    return nodes.map((node, _index) => {
      const isExpanded = expandedNodes.has(node.key);
      const hasChildren = !!(node.children && node.children.length > 0);
      // isNodeLast used for styling reference: _index === nodes.length - 1
      const indent = level * 24;
      const isSelected = selectedSource === node.source;
      
      return (
        <div key={node.key} className="relative">
          {/* Tree line connector */}
          {level > 0 && (
            <div 
              className="absolute top-0 bottom-0 border-r-2 border-mouse-200"
              style={{ right: `${indent - 12}px` }}
            />
          )}
          
          {/* Horizontal connector */}
          {level > 0 && (
            <div 
              className="absolute top-5 h-px bg-mouse-200"
              style={{ 
                right: `${indent - 12}px`,
                width: '12px'
              }}
            />
          )}
          
          <button
            onClick={(e) => {
              // Only toggle/select if clicking on the main area, not the view button
              if ((e.target as HTMLElement).closest('.view-source-btn')) {
                return;
              }
              if (hasChildren) {
                toggleNode(node.key);
              }
              if (node.source) {
                setSelectedSource(selectedSource === node.source ? null : node.source);
              }
            }}
            className={`w-full text-right px-4 py-3 transition-all duration-200 flex items-center gap-3 relative z-10 ${
              getNodeStyle(level, isSelected, isExpanded)
            }`}
            style={{ paddingRight: `${indent + 16}px` }}
          >
            {/* Icon */}
            <span className="flex-shrink-0">
              {getNodeIcon(level, hasChildren)}
            </span>
            
            {/* Expand/Collapse chevron */}
            {hasChildren && (
              <span className={`flex-shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-0' : 'rotate-180'
              }`}>
                <ChevronDown className={`w-4 h-4 ${
                  level === 0 ? 'text-navy-900' : level === 1 ? 'text-gold-600' : level === 2 ? 'text-navy-700' : 'text-mouse-500'
                }`} />
              </span>
            )}
            
            {/* Label */}
            <span className={`flex-1 text-right transition-all ${
              level === 0 ? 'text-xl font-bold text-navy-900' : 
              level === 1 ? 'text-lg font-bold text-gold-700' : 
              level === 2 ? 'text-base font-semibold text-navy-800' : 
              level === 3 ? 'font-medium text-navy-700' :
              'text-sm text-mouse-600'
            }`}>
              {node.label}
            </span>
            
            {/* View Source Button - show for all nodes with source (including parent nodes) */}
            {node.source && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openSource(node.source!);
                }}
                className="view-source-btn flex-shrink-0 px-3 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg border border-gold-400"
                title="צפה במקור המלא"
              >
                <span>צפה</span>
              </button>
            )}
            
            {/* Count badge */}
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              isSelected 
                ? 'bg-gold-500 text-navy-900 shadow-sm' 
                : level === 0
                ? 'bg-navy-900 text-gold-400'
                : level === 1
                ? 'bg-gold-500 text-navy-900'
                : level === 2
                ? 'bg-navy-100 text-navy-700'
                : 'bg-mouse-200 text-mouse-600'
            }`}>
              {node.count}
            </span>
          </button>
          
          {/* Children */}
          {hasChildren && isExpanded && node.children && (
            <div className="relative">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const selectedSourceData = selectedSource ? sourceIndex[selectedSource] : null;

  const handlePsakClick = (psakId: string, occurrenceIndex: number) => {
    navigate(`/psak/${psakId}`, {
      state: {
        highlightSource: selectedSource,
        occurrenceIndex,
      },
    });
  };

  const togglePsakSelection = (psakId: string) => {
    setSelectedPsakIds(prev => {
      const next = new Set(prev);
      if (next.has(psakId)) {
        next.delete(psakId);
      } else {
        next.add(psakId);
      }
      return next;
    });
  };

  const selectAllPsakim = () => {
    setSelectedPsakIds(new Set(psakim.map(p => p.id)));
  };

  const deselectAllPsakim = () => {
    setSelectedPsakIds(new Set());
  };

  // Open source in internal viewer
  const openSource = (source: string) => {
    // Encode the source for URL
    const encodedSource = encodeURIComponent(source);
    navigate(`/source/${encodedSource}`);
  };
  
  // Parse source to Sefaria ref
  const parseSourceToSefaria = (source: string): string | null => {
    // המרת שמות מסכתות מעברית לאנגלית עבור Sefaria API
    const masechetToEnglish: Record<string, string> = {
      'ברכות': 'Berakhot',
      'שבת': 'Shabbat',
      'עירובין': 'Eruvin',
      'פסחים': 'Pesachim',
      'שקלים': 'Shekalim',
      'יומא': 'Yoma',
      'סוכה': 'Sukkah',
      'ביצה': 'Beitzah',
      'ראש השנה': 'Rosh_Hashanah',
      'תענית': 'Taanit',
      'מגילה': 'Megillah',
      'מועד קטן': 'Moed_Katan',
      'חגיגה': 'Chagigah',
      'יבמות': 'Yevamot',
      'כתובות': 'Ketubot',
      'נדרים': 'Nedarim',
      'נזיר': 'Nazir',
      'סוטה': 'Sotah',
      'גיטין': 'Gittin',
      'קידושין': 'Kiddushin',
      'בבא קמא': 'Bava_Kamma',
      'בבא מציעא': 'Bava_Metzia',
      'בבא בתרא': 'Bava_Batra',
      'סנהדרין': 'Sanhedrin',
      'מכות': 'Makkot',
      'שבועות': 'Shevuot',
      'עבודה זרה': 'Avodah_Zarah',
      'הוריות': 'Horayot',
      'זבחים': 'Zevachim',
      'מנחות': 'Menachot',
      'חולין': 'Chullin',
      'בכורות': 'Bekhorot',
      'ערכין': 'Arakhin',
      'תמורה': 'Temurah',
      'כריתות': 'Keritot',
      'מעילה': 'Meilah',
      'תמיד': 'Tamid',
      'קינים': 'Kinnim',
      'נידה': 'Niddah'
    };

    const gemaraMatch = source.match(/gemara:([^:]+):(\d+):?([אב]?)/);
    if (gemaraMatch) {
      const masechet = gemaraMatch[1];
      const daf = gemaraMatch[2];
      const amud = gemaraMatch[3] || 'א';
      const amudLetter = amud === 'א' ? 'a' : 'b';
      
      // המרה לאנגלית
      const englishName = masechetToEnglish[masechet] || masechet.replace(/ /g, '_');
      return `${englishName}.${daf}${amudLetter}`;
    }
    
    const shulchanAruchMatch = source.match(/shulchan_aruch:([^:]+):(\d+)/);
    if (shulchanAruchMatch) {
      let chelek = shulchanAruchMatch[1];
      const siman = shulchanAruchMatch[2];
      
      if (chelek.includes('או"ח') || chelek.includes('אורח חיים')) chelek = 'Orach_Chaim';
      else if (chelek.includes('יו"ד') || chelek.includes('יורה דעה')) chelek = 'Yoreh_Deah';
      else if (chelek.includes('אבה"ע') || chelek.includes('אבן העזר')) chelek = 'Even_HaEzer';
      else if (chelek.includes('חו"מ') || chelek.includes('חושן משפט')) chelek = 'Choshen_Mishpat';
      
      return `Shulchan_Arukh,_${chelek}.${siman}`;
    }
    
    return null;
  };
  
  // Open Split View
  const openSplitView = async (source: string, psak: PsakDin) => {
    setSplitViewSource(source);
    setSplitViewPsak(psak);
    setShowSplitView(true);
    setSplitLoading(true);
    
    try {
      // Try cache first
      const cacheKey = CACHE_KEY_PREFIX + source;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        setSplitSourceData(JSON.parse(cached));
        setSplitLoading(false);
        return;
      }
      
      // Fetch from Sefaria
      const sefariaRef = parseSourceToSefaria(source);
      if (!sefariaRef) {
        setSplitSourceData(null);
        setSplitLoading(false);
        return;
      }
      
      const response = await fetch(`${SEFARIA_API}${encodeURIComponent(sefariaRef)}?context=0&commentary=0`);
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setSplitSourceData(data);
      }
    } catch (error) {
      console.error('Error loading source for split view:', error);
    } finally {
      setSplitLoading(false);
    }
  };
  
  // Render source text for split view
  const renderSplitSourceText = () => {
    if (!splitSourceData) return null;
    const textContent = splitSourceData.he || splitSourceData.text;
    if (!textContent) return null;
    
    if (Array.isArray(textContent)) {
      return textContent.map((segment: any, idx: number) => {
        if (typeof segment === 'string' && segment.trim()) {
          return (
            <p key={idx} className="mb-4 leading-loose text-lg" dangerouslySetInnerHTML={{ __html: segment }} />
          );
        } else if (Array.isArray(segment)) {
          return segment.map((s: string, sIdx: number) => (
            <p key={`${idx}-${sIdx}`} className="mb-3 leading-loose text-lg" dangerouslySetInnerHTML={{ __html: s }} />
          ));
        }
        return null;
      });
    }
    
    return <p className="leading-loose text-lg" dangerouslySetInnerHTML={{ __html: textContent }} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold">
            <span className="w-8 h-8 flex items-center justify-center text-navy-900 text-2xl font-bold">אח</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">אינדקס חכם</h1>
            <p className="text-mouse-600">תצוגת עץ היררכית - מסכתות, דפים ועמודים</p>
          </div>
        </div>
        <button
          onClick={() => setShowPsakSelector(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-gold-400 rounded-xl hover:bg-navy-800 transition-colors font-medium border border-navy-700"
        >
          <span>⚙</span>
          <span>נתח פסקים ({selectedPsakIds.size}/{psakim.length})</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl border-2 border-gold-400 shadow-elegant space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gold-500">🔍</span>
          <input
            type="text"
            placeholder="חפש מקור (למשל: בבא מציעא, דף לה, או'ח)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border-2 border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 bg-mouse-50"
          />
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gold-600">▼</span>
          <span className="text-sm font-medium text-navy-800">סינון לפי סוג:</span>
          {(['all', 'gemara', 'shulchan_aruch', 'rambam', 'mishna'] as SourceType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setExpandedNodes(new Set()); // Reset expanded state on filter change
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border-2 ${
                filterType === type
                  ? 'bg-gold-500 text-navy-900 border-gold-600'
                  : 'bg-mouse-100 text-navy-700 border-mouse-300 hover:bg-mouse-200 hover:border-gold-400'
              }`}
            >
              {type === 'all' ? 'הכל' : getTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-mouse-600 pt-3 border-t border-gold-200">
          <span>סה"כ מקורות: <strong className="text-navy-900">{Object.keys(sourceIndex).length}</strong></span>
          <span>סה"כ פסקים: <strong className="text-navy-900">{psakim.length}</strong></span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tree View */}
        <div className="bg-white rounded-2xl border-2 border-gold-400 shadow-elegant overflow-hidden">
          <div className="p-4 border-b-2 border-gold-300 bg-gradient-to-l from-gold-100 to-mouse-50">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center bg-gold-100 text-gold-700 rounded text-xs font-bold">מק</span>
              מקורות - תצוגת עץ
            </h2>
          </div>
          <div className="divide-y divide-mouse-200 max-h-[700px] overflow-y-auto">
            {treeData.length === 0 ? (
              <div className="p-8 text-center text-mouse-500">
                <span className="w-12 h-12 mx-auto mb-2 block text-gold-300 text-4xl">📚</span>
                <p>לא נמצאו מקורות</p>
              </div>
            ) : (
              renderTree(treeData)
            )}
          </div>
        </div>

        {/* Right: Psakim for Selected Source */}
        <div className="bg-white rounded-2xl border-2 border-gold-400 shadow-elegant overflow-hidden">
          <div className="p-4 border-b-2 border-gold-300 bg-gradient-to-l from-navy-100 to-mouse-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">
              {selectedSourceData ? `פסקי דין - ${selectedSourceData.display}` : 'בחר מקור'}
            </h2>
            {selectedSource && (
              <button
                onClick={() => openSource(selectedSource)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600 transition-colors text-sm font-bold border border-gold-600"
                title="צפה במקור המלא"
              >
                <span>⇢</span>
                <span>צפה במקור</span>
              </button>
            )}
          </div>
          <div className="divide-y divide-mouse-200 max-h-[700px] overflow-y-auto">
            {!selectedSourceData ? (
              <div className="p-8 text-center text-mouse-500">
                <span className="w-12 h-12 mx-auto mb-2 block text-gold-300 text-4xl">🔍</span>
                <p>לחץ על מקור כדי לראות את הפסקים המתייחסים אליו</p>
              </div>
            ) : (
              selectedSourceData.psakim.map((psakEntry) => {
                const psak = psakim.find(p => p.id === psakEntry.psakId);
                return (
                <div key={psakEntry.psakId} className="p-4 hover:bg-mouse-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-navy-900">
                        {psakEntry.psakTitle}
                      </h3>
                      <span className="text-sm text-mouse-500">
                        פסק מס' {psakEntry.psakNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Split View Button */}
                      {psak && selectedSource && (
                        <button
                          onClick={() => openSplitView(selectedSource, psak)}
                          className="flex items-center gap-1 px-2 py-1 bg-navy-900 text-gold-400 rounded-lg hover:bg-navy-800 transition-colors text-xs font-bold"
                          title="תצוגה מפוצלת - גמרא ופסק יחד"
                        >
                          <span>‖</span>
                          <span>מפוצל</span>
                        </button>
                      )}
                      <span className="bg-gold-500 text-navy-900 px-2 py-1 rounded-full text-xs font-bold">
                        {psakEntry.occurrences.length}×
                      </span>
                    </div>
                  </div>
                  
                  {/* Occurrences */}
                  <div className="space-y-2 mt-3">
                    {psakEntry.occurrences.map((occurrence, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePsakClick(psakEntry.psakId, idx)}
                          className="w-full text-right p-4 bg-mouse-100 rounded-xl border-2 border-gold-200 hover:border-gold-500 hover:shadow-md transition-all group"
                        >
                          <div className="text-base text-navy-700 leading-relaxed">
                            <span className="text-mouse-400">...</span>
                            <span className="bg-gold-200 text-navy-900 font-bold text-lg px-2 py-1 rounded">
                              {occurrence.text}
                            </span>
                            <span className="text-mouse-400">...</span>
                          </div>
                          <div className="text-sm text-gold-600 font-bold mt-3 group-hover:underline flex items-center justify-end gap-2">
                            <span>לחץ לפתיחת הפסק המלא</span>
                            <span>←</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )})
            )}
          </div>
        </div>
      </div>

      {/* Psak Selector Modal */}
      {showPsakSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col border-2 border-gold-400">
            <div className="p-6 border-b-2 border-gold-300 bg-gradient-to-l from-gold-100 to-mouse-50">
              <h2 className="text-2xl font-bold text-navy-900">בחירת פסקים לניתוח</h2>
              <p className="text-mouse-600 mt-1">בחר את הפסקים שברצונך לכלול באינדקס החכם</p>
            </div>

            <div className="p-4 border-b-2 border-gold-200 flex gap-2 bg-mouse-50">
              <button
                onClick={selectAllPsakim}
                className="px-4 py-2 bg-navy-900 text-gold-400 rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
              >
                בחר הכל
              </button>
              <button
                onClick={deselectAllPsakim}
                className="px-4 py-2 bg-mouse-200 text-navy-700 rounded-lg hover:bg-mouse-300 transition-colors text-sm"
              >
                בטל הכל
              </button>
              <div className="flex-1"></div>
              <span className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg font-bold text-sm">
                נבחרו: {selectedPsakIds.size} מתוך {psakim.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-mouse-50">
              <div className="space-y-2">
                {psakim.map((psak) => {
                  const isSelected = selectedPsakIds.has(psak.id);
                  return (
                    <button
                      key={psak.id}
                      onClick={() => togglePsakSelection(psak.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-right flex items-start gap-3 ${
                        isSelected
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-mouse-300 bg-white hover:border-gold-300'
                      }`}
                    >
                      <div className="pt-1">
                        {isSelected ? (
                          <span className="w-5 h-5 flex items-center justify-center text-gold-600">✓</span>
                        ) : (
                          <span className="w-5 h-5 flex items-center justify-center border-2 border-mouse-400 rounded">&nbsp;</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-navy-900">{psak.title}</div>
                        <div className="text-sm text-mouse-500">פסק מס' {psak.number}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t-2 border-gold-300 flex gap-3 bg-mouse-50">
              <button
                onClick={() => setShowPsakSelector(false)}
                disabled={selectedPsakIds.size === 0}
                className="flex-1 px-6 py-3 bg-gold-500 text-navy-900 rounded-xl font-bold hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                נתח ({selectedPsakIds.size} פסקים)
              </button>
              <button
                onClick={() => {
                  setSelectedPsakIds(new Set(psakim.map(p => p.id)));
                  setShowPsakSelector(false);
                }}
                className="px-6 py-3 bg-mouse-200 text-navy-700 rounded-xl hover:bg-mouse-300 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Split View Modal - Gemara on one side, Psak on the other */}
      {showSplitView && splitViewPsak && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col border-2 border-gold-400">
            {/* Header */}
            <div className="p-4 border-b-2 border-gold-400 bg-gradient-to-l from-gold-500 to-navy-900 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <span className="text-xl">‖</span>
                <h2 className="text-xl font-bold">תצוגה מפוצלת - מקור ופסק</h2>
              </div>
              <button
                onClick={() => {
                  setShowSplitView(false);
                  setSplitViewSource(null);
                  setSplitViewPsak(null);
                  setSplitSourceData(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="סגור תצוגה מפוצלת"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            
            {/* Split Content */}
            <div className="flex-1 grid grid-cols-2 divide-x-2 divide-gold-300 overflow-hidden">
              {/* Left side - Source (Gemara) */}
              <div className="flex flex-col overflow-hidden">
                <div className="p-3 bg-gold-100 border-b-2 border-gold-300">
                  <h3 className="font-bold text-navy-900 flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-gold-200 text-gold-700 rounded text-xs font-bold">מק</span>
                    {splitSourceData?.heTitle || splitViewSource?.replace(/gemara:|shulchan_aruch:|rambam:/g, '').replace(/:/g, ' ') || 'מקור'}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-mouse-100" dir="rtl">
                  {splitLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="w-8 h-8 border-4 border-gold-600 border-t-transparent rounded-full animate-spin"></span>
                      <span className="mr-3 text-mouse-600">טוען מקור...</span>
                    </div>
                  ) : splitSourceData ? (
                    <div className="font-serif text-lg leading-loose text-navy-900">
                      {renderSplitSourceText()}
                    </div>
                  ) : (
                    <div className="text-center text-mouse-500 py-8">
                      <p>לא ניתן לטעון את המקור</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Psak */}
              <div className="flex flex-col overflow-hidden">
                <div className="p-3 bg-navy-100 border-b-2 border-gold-300">
                  <h3 className="font-bold text-navy-900 flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-navy-200 text-navy-700 rounded text-xs font-bold">פס</span>
                    {splitViewPsak.title}
                    <span className="text-sm text-mouse-500 font-normal">
                      (פסק מס' {splitViewPsak.number})
                    </span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-white" dir="rtl">
                  <div 
                    className="prose prose-lg max-w-none text-navy-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: splitViewPsak.content || '' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Footer with actions */}
            <div className="p-4 border-t-2 border-gold-400 bg-mouse-100 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => openSource(splitViewSource!)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600 transition-colors text-sm font-bold"
                >
                  <span>צפה</span>
                  פתח מקור בעמוד מלא
                </button>
                <button
                  onClick={() => navigate(`/psak/${splitViewPsak.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-gold-400 rounded-lg hover:bg-navy-800 transition-colors text-sm font-bold"
                >
                  <span>פס</span>
                  פתח פסק בעמוד מלא
                </button>
              </div>
              <button
                onClick={() => setShowSplitView(false)}
                className="px-4 py-2 bg-mouse-200 text-navy-700 rounded-lg hover:bg-mouse-300 transition-colors"
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

export default SmartIndex;
