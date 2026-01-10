import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Library, ArrowRight, ChevronLeft, BookMarked, Scroll } from 'lucide-react';

// קטגוריות ספרים מספריא - מבנה היררכי
const SEFARIM_CATEGORIES = {
  'תנ"ך': {
    icon: '📜',
    color: 'from-indigo-500 to-indigo-600',
    books: [
      { name: 'בראשית', ref: 'Genesis', chapters: 50 },
      { name: 'שמות', ref: 'Exodus', chapters: 40 },
      { name: 'ויקרא', ref: 'Leviticus', chapters: 27 },
      { name: 'במדבר', ref: 'Numbers', chapters: 36 },
      { name: 'דברים', ref: 'Deuteronomy', chapters: 34 },
      { name: 'יהושע', ref: 'Joshua', chapters: 24 },
      { name: 'שופטים', ref: 'Judges', chapters: 21 },
      { name: 'שמואל א', ref: 'I_Samuel', chapters: 31 },
      { name: 'שמואל ב', ref: 'II_Samuel', chapters: 24 },
      { name: 'מלכים א', ref: 'I_Kings', chapters: 22 },
      { name: 'מלכים ב', ref: 'II_Kings', chapters: 25 },
      { name: 'ישעיהו', ref: 'Isaiah', chapters: 66 },
      { name: 'ירמיהו', ref: 'Jeremiah', chapters: 52 },
      { name: 'יחזקאל', ref: 'Ezekiel', chapters: 48 },
      { name: 'תהילים', ref: 'Psalms', chapters: 150 },
      { name: 'משלי', ref: 'Proverbs', chapters: 31 },
      { name: 'איוב', ref: 'Job', chapters: 42 },
    ]
  },
  'משנה': {
    icon: '📖',
    color: 'from-teal-500 to-teal-600',
    books: [
      { name: 'ברכות', ref: 'Mishnah_Berakhot', chapters: 9 },
      { name: 'פאה', ref: 'Mishnah_Peah', chapters: 8 },
      { name: 'שבת', ref: 'Mishnah_Shabbat', chapters: 24 },
      { name: 'עירובין', ref: 'Mishnah_Eruvin', chapters: 10 },
      { name: 'פסחים', ref: 'Mishnah_Pesachim', chapters: 10 },
      { name: 'יומא', ref: 'Mishnah_Yoma', chapters: 8 },
      { name: 'סוכה', ref: 'Mishnah_Sukkah', chapters: 5 },
      { name: 'ביצה', ref: 'Mishnah_Beitzah', chapters: 5 },
      { name: 'ראש השנה', ref: 'Mishnah_Rosh_Hashanah', chapters: 4 },
      { name: 'תענית', ref: 'Mishnah_Taanit', chapters: 4 },
      { name: 'מגילה', ref: 'Mishnah_Megillah', chapters: 4 },
      { name: 'מועד קטן', ref: 'Mishnah_Moed_Katan', chapters: 3 },
      { name: 'חגיגה', ref: 'Mishnah_Chagigah', chapters: 3 },
    ]
  },
  'רמב"ם': {
    icon: '👑',
    color: 'from-amber-500 to-amber-600',
    books: [
      { name: 'משנה תורה - הלכות יסודי התורה', ref: 'Mishneh_Torah,_Foundations_of_the_Torah', chapters: 10 },
      { name: 'משנה תורה - הלכות דעות', ref: 'Mishneh_Torah,_Human_Dispositions', chapters: 7 },
      { name: 'משנה תורה - הלכות תלמוד תורה', ref: 'Mishneh_Torah,_Torah_Study', chapters: 7 },
      { name: 'משנה תורה - הלכות תשובה', ref: 'Mishneh_Torah,_Repentance', chapters: 10 },
      { name: 'משנה תורה - הלכות תפילה', ref: 'Mishneh_Torah,_Prayer_and_Priestly_Blessing', chapters: 15 },
      { name: 'משנה תורה - הלכות שבת', ref: 'Mishneh_Torah,_Sabbath', chapters: 30 },
      { name: 'משנה תורה - הלכות ציצית', ref: 'Mishneh_Torah,_Fringes', chapters: 3 },
      { name: 'משנה תורה - הלכות תפילין', ref: 'Mishneh_Torah,_Tefillin_and_Mezuzah', chapters: 10 },
    ]
  },
  'מפרשי רש"י': {
    icon: '✍️',
    color: 'from-rose-500 to-rose-600',
    books: [
      { name: 'רש"י על התורה - בראשית', ref: 'Rashi_on_Genesis', chapters: 50 },
      { name: 'רש"י על התורה - שמות', ref: 'Rashi_on_Exodus', chapters: 40 },
      { name: 'רש"י על התורה - ויקרא', ref: 'Rashi_on_Leviticus', chapters: 27 },
      { name: 'רש"י על התורה - במדבר', ref: 'Rashi_on_Numbers', chapters: 36 },
      { name: 'רש"י על התורה - דברים', ref: 'Rashi_on_Deuteronomy', chapters: 34 },
    ]
  },
  'מוסר': {
    icon: '💎',
    color: 'from-emerald-500 to-emerald-600',
    books: [
      { name: 'מסילת ישרים', ref: 'Mesillat_Yesharim', chapters: 26 },
      { name: 'חובות הלבבות', ref: 'Duties_of_the_Heart', chapters: 10 },
      { name: 'שערי תשובה', ref: 'Shaarei_Teshuva', chapters: 4 },
      { name: 'אורחות צדיקים', ref: 'Orchot_Tzadikim', chapters: 28 },
    ]
  },
  'קבלה וחסידות': {
    icon: '🕯️',
    color: 'from-violet-500 to-violet-600',
    books: [
      { name: 'זוהר - בראשית', ref: 'Zohar', chapters: 1 },
      { name: 'תניא', ref: 'Tanya', chapters: 53 },
      { name: 'ליקוטי מוהר"ן', ref: 'Likutei_Moharan', chapters: 286 },
    ]
  }
};

const CATEGORY_ORDER = ['תנ"ך', 'משנה', 'רמב"ם', 'מפרשי רש"י', 'מוסר', 'קבלה וחסידות'];

// המרת מספר לעברית
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

type ViewMode = 'categories' | 'books' | 'chapters';

const SefarimExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<{ name: string; ref: string; chapters: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setViewMode('books');
  };

  const handleBookClick = (book: { name: string; ref: string; chapters: number }) => {
    setSelectedBook(book);
    setViewMode('chapters');
  };

  const handleChapterClick = (chapter: number) => {
    if (!selectedBook) return;
    const source = `book:${selectedBook.ref}:${chapter}`;
    navigate(`/source/${encodeURIComponent(source)}`);
  };

  const handleBack = () => {
    if (viewMode === 'chapters') {
      setViewMode('books');
      setSelectedBook(null);
    } else if (viewMode === 'books') {
      setViewMode('categories');
      setSelectedCategory(null);
    }
  };

  // Filter books by search
  const getFilteredBooks = () => {
    if (!selectedCategory) return [];
    const categoryData = SEFARIM_CATEGORIES[selectedCategory as keyof typeof SEFARIM_CATEGORIES];
    if (!searchQuery) return categoryData.books;
    
    return categoryData.books.filter(book => 
      book.name.includes(searchQuery) || book.ref.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-gold">
              <Library className="w-8 h-8 text-navy-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">ספריית הספרים</h1>
              <p className="text-mouse-600">
                {viewMode === 'categories' && 'בחר קטגוריה לצפייה בספרים'}
                {viewMode === 'books' && `${selectedCategory} - בחר ספר`}
                {viewMode === 'chapters' && `${selectedBook?.name} - בחר פרק`}
              </p>
            </div>
          </div>
          {viewMode !== 'categories' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-cream-200 text-navy-900 rounded-xl hover:bg-cream-300 transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              חזור
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {viewMode === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORY_ORDER.map((category) => {
            const categoryData = SEFARIM_CATEGORIES[category as keyof typeof SEFARIM_CATEGORIES];
            return (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="group bg-white rounded-2xl p-8 border-2 border-gold-300 hover:border-gold-500 shadow-elegant hover:shadow-gold transition-all text-center"
              >
                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${categoryData.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-4xl">{categoryData.icon}</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">{category}</h2>
                <p className="text-mouse-600">
                  {categoryData.books.length} ספרים
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-gold-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>לחץ לפתיחה</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Books List */}
      {viewMode === 'books' && selectedCategory && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="חפש ספר..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-cream-50 border-2 border-gold-300 rounded-xl focus:outline-none focus:border-gold-500 text-navy-900 placeholder-mouse-400"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
            </div>
          </div>

          {/* Books grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredBooks().map((book) => (
              <button
                key={book.ref}
                onClick={() => handleBookClick(book)}
                className="group flex items-center justify-between p-4 bg-cream-50 rounded-xl border-2 border-gold-200 hover:border-gold-500 hover:bg-gold-50 transition-all"
              >
                <div className="text-right flex-1">
                  <div className="text-lg font-bold text-navy-900 mb-1">{book.name}</div>
                  <div className="text-sm text-mouse-600">{book.chapters} פרקים</div>
                </div>
                <div className="p-2 bg-gold-100 rounded-lg group-hover:bg-gold-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-gold-600" />
                </div>
              </button>
            ))}
          </div>

          {getFilteredBooks().length === 0 && (
            <div className="text-center py-12 text-mouse-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gold-300" />
              <p>לא נמצאו ספרים</p>
            </div>
          )}
        </div>
      )}

      {/* Chapters Grid */}
      {viewMode === 'chapters' && selectedBook && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          <div className="mb-6 p-4 bg-gold-50 rounded-xl border border-gold-200">
            <h3 className="text-xl font-bold text-navy-900 mb-1">{selectedBook.name}</h3>
            <p className="text-mouse-600">בחר פרק לצפייה</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[600px] overflow-y-auto">
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
              <button
                key={chapter}
                onClick={() => handleChapterClick(chapter)}
                className="group relative bg-cream-50 rounded-xl border-2 border-gold-300 hover:border-gold-500 hover:bg-gold-50 transition-all p-4 text-center"
              >
                <div className="text-lg font-bold text-navy-900 mb-1">
                  פרק {numberToHebrew(chapter)}
                </div>
                <div className="text-xs text-mouse-500">
                  {chapter}
                </div>
                {/* Green indicator dot */}
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {viewMode === 'categories' && (
        <div className="fixed bottom-8 right-8">
          <button className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center text-navy-900 hover:scale-110">
            <Library className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SefarimExplorer;
