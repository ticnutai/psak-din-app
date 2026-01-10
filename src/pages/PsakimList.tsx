import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PsakDin } from '../types';
import { searchPsakim, formatHebrewDate } from '../utils/psakUtils';
import { 
  Search, 
  FileText, 
  Trash2, 
  Eye, 
  Filter,
  SortAsc,
  SortDesc,
  Tag
} from 'lucide-react';

interface PsakimListProps {
  psakim: PsakDin[];
  onDelete: (id: string) => void;
}

const PsakimList = ({ psakim, onDelete }: PsakimListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold">
            <FileText className="w-8 h-8 text-navy-900" />
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
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
              <input
                type="text"
                placeholder="חיפוש בפסקי דין..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 outline-none transition-all bg-cream-50"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pr-12 pl-8 py-3 border-2 border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-400 focus:border-gold-500 outline-none appearance-none bg-cream-50 cursor-pointer text-navy-800"
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
            className="flex items-center gap-2 px-4 py-3 border-2 border-gold-300 rounded-xl hover:bg-gold-50 transition-all bg-cream-50"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-5 h-5 text-navy-700" />
            ) : (
              <SortDesc className="w-5 h-5 text-navy-700" />
            )}
            <span className="text-navy-700">מיון</span>
          </button>
        </div>
      </div>

      {/* Psakim Grid */}
      {filteredPsakim.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPsakim.map(psak => (
            <Link
              key={psak.id}
              to={`/psak/${psak.id}`}
              className="group bg-white rounded-2xl p-6 border-2 border-gold-300 hover:border-gold-500 shadow-elegant hover:shadow-gold transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gold-100 rounded-lg group-hover:bg-gold-200 transition-colors">
                    <FileText className="w-5 h-5 text-gold-600" />
                  </div>
                  <span className="text-sm font-medium text-gold-700">
                    פסק #{psak.number}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(psak.id, e)}
                  className="p-2 text-mouse-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-navy-900 mb-2 line-clamp-2 group-hover:text-gold-700 transition-colors">
                {psak.title}
              </h3>

              <p className="text-mouse-600 text-sm mb-4 line-clamp-3">
                {psak.summary}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {psak.categories.slice(0, 3).map(cat => (
                  <span 
                    key={cat}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gold-100 text-navy-700 rounded-lg text-xs border border-gold-200"
                  >
                    <Tag className="w-3 h-3" />
                    {cat}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gold-200">
                <span className="text-xs text-mouse-500">
                  {formatHebrewDate(psak.dateAdded)}
                </span>
                <div className="flex items-center gap-1 text-gold-600 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  צפייה
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gold-400 shadow-elegant">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gold-300" />
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
