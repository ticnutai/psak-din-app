import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Favorite {
  id: string;
  type: 'psak' | 'source';
  title: string;
  subtitle?: string;
  url: string;
  dateAdded: Date;
}

const FAVORITES_KEY = 'favorites-storage';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filter, setFilter] = useState<'all' | 'psak' | 'source'>('all');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed.map((f: any) => ({
          ...f,
          dateAdded: new Date(f.dateAdded),
        })));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const removeFavorite = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך להסיר מהמועדפים?')) {
      const updated = favorites.filter(f => f.id !== id);
      setFavorites(updated);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    }
  };

  const filteredFavorites = favorites.filter(f => 
    filter === 'all' || f.type === filter
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold flex items-center justify-center">
              <span className="text-3xl">⭐</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">
                מועדפים
              </h1>
              <p className="text-mouse-600">
                {favorites.length} פריטים במועדפים
              </p>
            </div>
          </div>
          
          {/* Filter */}
          <div className="flex items-center gap-2 bg-mouse-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === 'all'
                  ? 'bg-gold-500 text-navy-900 shadow-md'
                  : 'text-navy-700 hover:bg-white'
              }`}
            >
              הכל ({favorites.length})
            </button>
            <button
              onClick={() => setFilter('psak')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === 'psak'
                  ? 'bg-gold-500 text-navy-900 shadow-md'
                  : 'text-navy-700 hover:bg-white'
              }`}
            >
              פסקי דין ({favorites.filter(f => f.type === 'psak').length})
            </button>
            <button
              onClick={() => setFilter('source')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === 'source'
                  ? 'bg-gold-500 text-navy-900 shadow-md'
                  : 'text-navy-700 hover:bg-white'
              }`}
            >
              מקורות ({favorites.filter(f => f.type === 'source').length})
            </button>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      {filteredFavorites.length > 0 ? (
        <div className="space-y-4">
          {filteredFavorites.map(fav => (
            <div
              key={fav.id}
              className="bg-white rounded-2xl p-6 border-2 border-gold-300 hover:border-gold-500 shadow-elegant hover:shadow-gold transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  fav.type === 'psak' 
                    ? 'bg-gold-100 text-gold-600' 
                    : 'bg-navy-100 text-navy-600'
                }`}>
                  <span className="text-2xl">{fav.type === 'psak' ? '⚖️' : '📖'}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <Link
                        to={fav.url}
                        className="font-bold text-navy-900 hover:text-gold-600 transition-colors text-lg block mb-1"
                      >
                        {fav.title}
                      </Link>
                      {fav.subtitle && (
                        <p className="text-mouse-600 text-sm">{fav.subtitle}</p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={fav.url}
                        className="px-4 py-2 bg-gold-100 text-gold-700 rounded-lg text-sm font-medium hover:bg-gold-200 transition-colors"
                      >
                        צפייה ►
                      </Link>
                      <button
                        onClick={() => removeFavorite(fav.id)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        title="הסר מהמועדפים"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-mouse-500">
                    <span className="px-2 py-1 bg-mouse-100 rounded">
                      {fav.type === 'psak' ? 'פסק דין' : 'מקור'}
                    </span>
                    <span>
                      נוסף ב-{new Date(fav.dateAdded).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gold-400 shadow-elegant">
          <div className="w-20 h-20 mx-auto mb-4 bg-gold-100 rounded-2xl flex items-center justify-center">
            <span className="text-5xl">⭐</span>
          </div>
          <h3 className="text-xl font-medium text-navy-800 mb-2">
            {filter === 'all' 
              ? 'אין מועדפים עדיין' 
              : filter === 'psak'
              ? 'אין פסקי דין במועדפים'
              : 'אין מקורות במועדפים'}
          </h3>
          <p className="text-mouse-500 mb-4">
            הוסף פסקי דין או מקורות למועדפים כדי לגשת אליהם במהירות
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/psakim"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-900 rounded-xl hover:bg-gold-600 transition-colors font-bold"
            >
              עבור לפסקים
            </Link>
            <Link 
              to="/smart-index"
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy-500 text-white rounded-xl hover:bg-navy-600 transition-colors font-bold"
            >
              עבור למקורות
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
