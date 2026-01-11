// Favorites management utilities

export interface Favorite {
  id: string;
  type: 'psak' | 'source';
  title: string;
  subtitle?: string;
  url: string;
  dateAdded: Date;
}

const FAVORITES_KEY = 'favorites-storage';

export const getFavorites = (): Favorite[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((f: any) => ({
        ...f,
        dateAdded: new Date(f.dateAdded),
      }));
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
  return [];
};

export const saveFavorites = (favorites: Favorite[]): void => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

export const isFavorite = (id: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(f => f.id === id);
};

export const addFavorite = (favorite: Omit<Favorite, 'dateAdded'>): void => {
  const favorites = getFavorites();
  
  // Check if already exists
  if (favorites.some(f => f.id === favorite.id)) {
    return;
  }
  
  const newFavorite: Favorite = {
    ...favorite,
    dateAdded: new Date(),
  };
  
  favorites.push(newFavorite);
  saveFavorites(favorites);
};

export const removeFavorite = (id: string): void => {
  const favorites = getFavorites();
  const updated = favorites.filter(f => f.id !== id);
  saveFavorites(updated);
};

export const toggleFavorite = (favorite: Omit<Favorite, 'dateAdded'>): boolean => {
  if (isFavorite(favorite.id)) {
    removeFavorite(favorite.id);
    return false;
  } else {
    addFavorite(favorite);
    return true;
  }
};
