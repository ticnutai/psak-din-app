import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PsakDin } from '../types';
import { searchPsakim, formatHebrewDate } from '../utils/psakUtils';

type ViewMode = 'grid' | 'table' | 'compact' | 'list';

interface PsakimListProps {
  psakim: PsakDin[];
  onDelete: (id: string) => void;
  onRemoveDuplicates: () => void;
}

const PsakimList = ({ psakim, onDelete, onRemoveDuplicates }: PsakimListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(psakim.flatMap(p => p.categories))];
  }, [psakim]);

  // Filter and search psakim
  const filteredPsakim = useMemo(() => {
    let result = searchPsakim(psakim, searchQuery);
    
    if (selectedCategory) {
      result = result.filter(p => p.categories.includes(selectedCategory));
    }
    
    return result.sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      return (a.number - b.number) * order;
    });
  }, [psakim, searchQuery, selectedCategory, sortOrder]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('האם אתה בטוח שברצונך למחוק פסק דין זה?')) {
      onDelete(id);
    }
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredPsakim.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPsakim.map(p => p.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedIds.size} פסקי דין?`)) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const viewModes: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'grid', label: 'רשת', icon: '▦' },
    { mode: 'table', label: 'טבלה', icon: '▤' },
    { mode: 'compact', label: 'קומפקט', icon: '▥' },
    { mode: 'list', label: 'רשימה', icon: '☰' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold flex items-center justify-center">
              <span className="text-lg font-bold text-navy-900">פד</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">
                פסקי דין
              </h1>
              <p className="text-mouse-600">
                {psakim.length} פסקי דין במאגר
              </p>
            </div>
          </div>
          
          {/* View Mode Selector */}
          <div className="flex items-center gap-2 bg-mouse-100 p-1 rounded-xl">
            {viewModes.map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  viewMode === mode
                    ? 'bg-gold-500 text-navy-900 shadow-md'
                    : 'text-navy-700 hover:bg-white'
                }`}
                title={label}
              >
                <span className="text-lg">{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-sm">חפש</span>
              <input
                type="text"
                placeholder="חיפוש בפסקי דין..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-16 pl-4 py-3 border-2 border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 outline-none transition-all bg-mouse-50"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500 font-bold text-sm">סנן</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pr-16 pl-8 py-3 border-2 border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 outline-none appearance-none bg-mouse-50 cursor-pointer text-navy-800"
            >
              <option value="">כל הקטגוריות</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-4 py-3 border-2 border-gold-300 rounded-xl hover:bg-gold-50 transition-all bg-mouse-50"
          >
            <span className="text-navy-700 font-bold">{sortOrder === 'asc' ? '▲' : '▼'}</span>
            <span className="text-navy-700">מיון</span>
          </button>

          {/* Selection Mode Toggle */}
          <button
            onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
            className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl transition-all font-bold ${
              selectionMode
                ? 'border-gold-500 bg-gold-500 text-navy-900'
                : 'border-gold-300 bg-mouse-50 text-navy-700 hover:bg-gold-50'
            }`}
          >
            <span>☑</span>
            <span>{selectionMode ? 'בטל בחירה' : 'בחירה מרובה'}</span>
          </button>

          {/* Remove Duplicates Button */}
          <button
            onClick={onRemoveDuplicates}
            className="flex items-center gap-2 px-4 py-3 border-2 border-red-300 bg-red-50 rounded-xl hover:bg-red-100 transition-all text-red-700 font-bold"
            title="הסר פסקי דין כפולים"
          >
            <span>🗑️</span>
            <span>הסר כפילויות</span>
          </button>
        </div>

        {/* Selection Mode Bar */}
        {selectionMode && (
          <div className="mt-4 pt-4 border-t border-gold-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gold-100 text-gold-800 rounded-lg hover:bg-gold-200 transition-all font-medium"
              >
                {selectedIds.size === filteredPsakim.length ? 'בטל הכל' : 'בחר הכל'}
              </button>
              <span className="text-navy-700 font-medium">
                נבחרו {selectedIds.size} פסקי דין
              </span>
            </div>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                selectedIds.size > 0
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-mouse-200 text-mouse-400 cursor-not-allowed'
              }`}
            >
              <span>🗑️</span>
              <span>מחק נבחרים ({selectedIds.size})</span>
            </button>
          </div>
        )}
      </div>

      {/* Psakim Display */}
      {filteredPsakim.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPsakim.map(psak => (
                <div key={psak.id} className="relative">
                  {selectionMode && (
                    <button
                      onClick={(e) => toggleSelection(psak.id, e)}
                      className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedIds.has(psak.id)
                          ? 'bg-gold-500 border-gold-600 text-navy-900'
                          : 'bg-white border-gold-300 hover:border-gold-500'
                      }`}
                    >
                      {selectedIds.has(psak.id) && '✓'}
                    </button>
                  )}
                  <Link
                    to={selectionMode ? '#' : `/psak/${psak.id}`}
                    onClick={selectionMode ? (e) => toggleSelection(psak.id, e) : undefined}
                    className={`group block bg-white rounded-2xl p-6 border-2 shadow-elegant hover:shadow-gold transition-all ${
                      selectedIds.has(psak.id)
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-gold-300 hover:border-gold-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gold-100 rounded-lg group-hover:bg-gold-200 transition-colors flex items-center justify-center">
                          <span className="text-sm font-bold text-gold-600">פד</span>
                        </div>
                        <span className="text-sm font-medium text-gold-700">
                          פסק #{psak.number}
                        </span>
                      </div>
                      {!selectionMode && (
                        <button
                          onClick={(e) => handleDelete(psak.id, e)}
                          className="w-8 h-8 text-mouse-400 hover:text-white hover:bg-navy-800 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-navy-900 mb-2 line-clamp-2 group-hover:text-gold-700 transition-colors">
                      {psak.title}
                    </h3>

                    <p className="text-mouse-600 text-sm mb-4 line-clamp-3">
                      {psak.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {psak.categories.slice(0, 3).map(cat => (
                        <span 
                          key={cat}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gold-100 text-navy-700 rounded-lg text-xs border border-gold-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gold-200">
                      <span className="text-xs text-mouse-500">
                        {formatHebrewDate(psak.dateAdded)}
                      </span>
                      <div className="flex items-center gap-1 text-gold-600 text-sm font-medium">
                        <span>צפייה ►</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border-2 border-gold-400 shadow-elegant overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-l from-navy-900 to-navy-800 text-white">
                  <tr>
                    {selectionMode && (
                      <th className="p-4 w-12">
                        <button
                          onClick={handleSelectAll}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedIds.size === filteredPsakim.length
                              ? 'bg-gold-500 border-gold-600 text-navy-900'
                              : 'border-gold-400 hover:border-gold-300'
                          }`}
                        >
                          {selectedIds.size === filteredPsakim.length && '✓'}
                        </button>
                      </th>
                    )}
                    <th className="p-4 text-right font-bold text-gold-400">מספר</th>
                    <th className="p-4 text-right font-bold text-gold-400">כותרת</th>
                    <th className="p-4 text-right font-bold text-gold-400">קטגוריות</th>
                    <th className="p-4 text-right font-bold text-gold-400">תאריך</th>
                    <th className="p-4 text-center font-bold text-gold-400">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPsakim.map((psak, idx) => (
                    <tr 
                      key={psak.id} 
                      className={`border-b border-gold-200 hover:bg-gold-50 transition-colors ${
                        selectedIds.has(psak.id) ? 'bg-gold-100' : idx % 2 === 0 ? 'bg-white' : 'bg-mouse-50'
                      }`}
                    >
                      {selectionMode && (
                        <td className="p-4">
                          <button
                            onClick={(e) => toggleSelection(psak.id, e)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              selectedIds.has(psak.id)
                                ? 'bg-gold-500 border-gold-600 text-navy-900'
                                : 'border-gold-300 hover:border-gold-500'
                            }`}
                          >
                            {selectedIds.has(psak.id) && '✓'}
                          </button>
                        </td>
                      )}
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gold-100 text-gold-700 rounded-lg text-sm font-bold">
                          #{psak.number}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link 
                          to={`/psak/${psak.id}`}
                          className="text-navy-900 hover:text-gold-600 font-medium transition-colors"
                        >
                          {psak.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {psak.categories.slice(0, 2).map(cat => (
                            <span key={cat} className="px-2 py-0.5 bg-mouse-100 text-navy-700 rounded text-xs">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-mouse-600 text-sm">
                        {formatHebrewDate(psak.dateAdded)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/psak/${psak.id}`}
                            className="px-3 py-1 bg-gold-100 text-gold-700 rounded-lg text-sm font-medium hover:bg-gold-200 transition-colors"
                          >
                            צפייה
                          </Link>
                          {!selectionMode && (
                            <button
                              onClick={(e) => handleDelete(psak.id, e)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                              מחק
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Compact View */}
          {viewMode === 'compact' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPsakim.map(psak => (
                <div key={psak.id} className="relative">
                  {selectionMode && (
                    <button
                      onClick={(e) => toggleSelection(psak.id, e)}
                      className={`absolute top-2 right-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition-all ${
                        selectedIds.has(psak.id)
                          ? 'bg-gold-500 border-gold-600 text-navy-900'
                          : 'bg-white border-gold-300 hover:border-gold-500'
                      }`}
                    >
                      {selectedIds.has(psak.id) && '✓'}
                    </button>
                  )}
                  <Link
                    to={selectionMode ? '#' : `/psak/${psak.id}`}
                    onClick={selectionMode ? (e) => toggleSelection(psak.id, e) : undefined}
                    className={`block p-4 rounded-xl border-2 hover:shadow-md transition-all ${
                      selectedIds.has(psak.id)
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-gold-300 bg-white hover:border-gold-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 bg-gold-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-gold-600">#{psak.number}</span>
                      </div>
                      <h3 className="font-bold text-navy-900 text-sm line-clamp-2 mb-1">
                        {psak.title}
                      </h3>
                      <span className="text-xs text-mouse-500">
                        {formatHebrewDate(psak.dateAdded)}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredPsakim.map(psak => (
                <div 
                  key={psak.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    selectedIds.has(psak.id)
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-gold-300 bg-white hover:border-gold-500'
                  }`}
                >
                  {selectionMode && (
                    <button
                      onClick={(e) => toggleSelection(psak.id, e)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedIds.has(psak.id)
                          ? 'bg-gold-500 border-gold-600 text-navy-900'
                          : 'border-gold-300 hover:border-gold-500'
                      }`}
                    >
                      {selectedIds.has(psak.id) && '✓'}
                    </button>
                  )}
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gold-600">#{psak.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/psak/${psak.id}`}
                      className="font-bold text-navy-900 hover:text-gold-600 transition-colors block truncate"
                    >
                      {psak.title}
                    </Link>
                    <p className="text-mouse-600 text-sm truncate">{psak.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {psak.categories.slice(0, 2).map(cat => (
                      <span key={cat} className="px-2 py-0.5 bg-gold-100 text-navy-700 rounded text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-mouse-500 flex-shrink-0">
                    {formatHebrewDate(psak.dateAdded)}
                  </span>
                  <Link
                    to={`/psak/${psak.id}`}
                    className="px-4 py-2 bg-gold-100 text-gold-700 rounded-lg text-sm font-medium hover:bg-gold-200 transition-colors flex-shrink-0"
                  >
                    צפייה ►
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gold-400 shadow-elegant">
          <div className="w-20 h-20 mx-auto mb-4 bg-gold-100 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-gold-400">פד</span>
          </div>
          <h3 className="text-xl font-medium text-navy-800 mb-2">
            {searchQuery || selectedCategory ? 'לא נמצאו תוצאות' : 'אין פסקי דין במאגר'}
          </h3>
          <p className="text-mouse-500 mb-4">
            {searchQuery || selectedCategory 
              ? 'נסה לשנות את החיפוש או הסינון'
              : 'התחל בהעלאת פסקי דין חדשים'}
          </p>
          {!searchQuery && !selectedCategory && (
            <Link 
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-900 rounded-xl hover:bg-gold-600 transition-colors font-bold"
            >
              העלאת פסקים
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default PsakimList;
