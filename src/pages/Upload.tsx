import { useCallback, useState } from 'react';

interface UploadProps {
  onUpload: (files: FileList) => Promise<void>;
  isLoading: boolean;
}

const Upload = ({ onUpload, isLoading }: UploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const files = e.dataTransfer.files;
    const htmlFiles = Array.from(files).filter(f => f.name.endsWith('.html'));
    
    if (htmlFiles.length === 0) {
      setError('אנא העלה קבצי HTML בלבד');
      return;
    }

    const dt = new DataTransfer();
    htmlFiles.forEach(f => dt.items.add(f));
    
    await onUpload(dt.files);
    setUploadedCount(prev => prev + htmlFiles.length);
  }, [onUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      await onUpload(files);
      setUploadedCount(prev => prev + files.length);
    }
    e.target.value = '';
  }, [onUpload]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl mb-4 shadow-gold">
          <span className="text-xl font-bold text-navy-900">הע</span>
        </div>
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          העלאת פסקי דין
        </h1>
        <p className="text-mouse-600">
          העלה קבצי HTML של פסקי דין רבניים למאגר
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
          ${isDragging 
            ? 'border-gold-500 bg-gold-50 scale-[1.02]' 
            : 'border-gold-300 bg-white hover:border-gold-500 hover:bg-gold-50/50'
          }
          ${isLoading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-medium text-navy-900">מעבד קבצים...</p>
            <p className="text-mouse-500 mt-2">מחלץ מידע ויוצר אינדקס</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-200 to-gold-400 rounded-2xl mb-4 shadow-lg">
                <span className="text-3xl font-bold text-navy-900">קב</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-navy-900 mb-2">
              גרור ושחרר קבצי HTML כאן
            </h3>
            <p className="text-mouse-500 mb-6">
              או לחץ לבחירת קבצים מהמחשב
            </p>
            
            <label className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 rounded-xl cursor-pointer hover:from-gold-600 hover:to-gold-700 transition-all shadow-lg hover:shadow-xl border border-gold-400 font-bold">
              <span className="font-medium">בחר קבצים</span>
              <input
                type="file"
                accept=".html"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <p className="text-sm text-mouse-400 mt-6">
              נתמכים קבצי HTML בלבד • ניתן להעלות מספר קבצים בו זמנית
            </p>
          </>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-6 p-4 bg-navy-100 border-2 border-navy-300 rounded-xl flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-navy-900 text-white flex items-center justify-center text-sm font-bold">!</span>
          <p className="text-navy-700">{error}</p>
        </div>
      )}

      {uploadedCount > 0 && !error && (
        <div className="mt-6 p-4 bg-gold-50 border-2 border-gold-300 rounded-xl flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center text-sm font-bold">✓</span>
          <p className="text-navy-700 font-medium">
            הועלו בהצלחה {uploadedCount} פסקי דין!
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
        <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center text-gold-600 font-bold">?</span>
          איך זה עובד?
        </h3>
        <ul className="space-y-3 text-navy-700">
          <li className="flex items-start gap-3">
            <span className="font-bold text-gold-600 bg-gold-100 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
            <span>המערכת מנתחת את תוכן ה-HTML ומחלצת את המידע החשוב</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-gold-600 bg-gold-100 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            <span>זיהוי אוטומטי של הפניות לגמרא, שולחן ערוך, רמב"ם ועוד</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-gold-600 bg-gold-100 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
            <span>קטלוג לפי נושאים וקטגוריות הלכתיות</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-gold-600 bg-gold-100 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
            <span>יצירת אינדקס חכם המאפשר חיפוש וקישור לספרי קודש</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Upload;
