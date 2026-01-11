# מאגר פסקי דין - מדריך למפתחים

## תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [טכנולוגיות](#טכנולוגיות)
3. [ארכיטקטורה](#ארכיטקטורה)
4. [פונקציונליות מרכזית](#פונקציונליות-מרכזית)
5. [מבנה הקבצים](#מבנה-הקבצים)
6. [קומפוננטות עיקריות](#קומפוננטות-עיקריות)
7. [התקנה והרצה](#התקנה-והרצה)
8. [פיצ'רים מתקדמים](#פיצרים-מתקדמים)

---

## סקירה כללית

**מאגר פסקי דין** הוא אפליקציית ווב מתקדמת לניהול, עיון וניתוח פסקי דין של בית דין רבני. 
המערכת מאפשרת העלאה, חיפוש, עיון וקישור של פסקי דין עם מקורות תורניים מספריא.

### מטרות הפרויקט
- **ניהול מרכזי** של פסקי דין עם אחסון מקומי (localStorage)
- **חיפוש מתקדם** עם סינון לפי קטגוריות
- **קישור אוטומטי** למקורות תורניים (גמרא, שולחן ערוך, ספרים)
- **עריכת טקסט** עם הדגשות וצביעה
- **ניווט אינטואיטיבי** עם סיידברים חכמים
- **תצוגות מרובות** (רשת, טבלה, קומפקט, רשימה)

---

## טכנולוגיות

### Frontend Framework
- **React 18.3.1** - ספריית UI מודרנית עם Hooks
- **TypeScript 5.6.2** - שפה מוקלדת לבטיחות קוד
- **React Router v6.28.0** - ניהול ניווט וראוטינג

### Build & Dev Tools
- **Vite 6.0.1** - כלי בנייה מהיר עם HMR
- **ESLint 9.13.0** - בדיקת איכות קוד
- **PostCSS 8.4.47** - עיבוד CSS מתקדם

### Styling
- **Tailwind CSS 3.4.14** - framework CSS utility-first
- **Custom Theme** - צבעים מותאמים (navy-900, gold-400, cream, mouse)
- **RTL Support** - תמיכה מלאה בעברית

### Libraries
- **DOMPurify 3.2.0** - ניקוי HTML מסוכן
- **lucide-react 0.460.0** - אייקונים מינימליים
- **Sefaria API** - גישה למקורות תורניים

### Storage & State
- **localStorage** - אחסון מקומי של פסקי דין והעדפות
- **React State** - ניהול state מקומי עם useState/useEffect
- **useRef** - גישה ישירה לאלמנטים

---

## ארכיטקטורה

### מבנה כללי
```
src/
├── components/        # קומפוננטות שימושיות
├── pages/            # עמודים ראשיים
├── types/            # הגדרות TypeScript
└── utils/            # פונקציות עזר
```

### זרימת נתונים
1. **טעינה**: `App.tsx` טוען פסקי דין מ-localStorage
2. **פרסינג**: `parsePsakFile` מנתח קבצי HTML ומחלץ מטא-דאטה
3. **אינדקס**: `buildSourceIndex` יוצר אינדקס של כל המקורות
4. **תצוגה**: קומפוננטות מקבלות את הפסקים דרך props
5. **שמירה**: כל שינוי נשמר אוטומטית ב-localStorage

### Design Patterns
- **Component Composition** - בניית UI ממרכיבים קטנים
- **Custom Hooks** - לוגיקה משותפת (useEffect, useMemo)
- **Controlled Components** - טפסים עם state
- **Higher Order Components** - Sidebar עם auto-hide

---

## פונקציונליות מרכזית

### 1. העלאת פסקי דין
**קובץ**: `src/pages/Upload.tsx` + `src/utils/psakUtils.ts`

**איך זה עובד**:
- משתמש מעלה קבצי HTML
- `parsePsakFile` מנתח את ה-HTML:
  - מחלץ מספר פסק מהכותרת/קובץ
  - מזהה כותרת ראשית
  - מנקה HTML עם DOMPurify
  - מחלץ קטגוריות מטגים או תוכן
  - מזהה ומקשר מקורות (גמרא, שו"ע, רמב"ם)
- בודק כפילויות לפי מספר+כותרת
- שומר ב-localStorage

**פורמט מקור**:
```typescript
{
  id: string,          // UUID ייחודי
  number: number,      // מספר פסק
  title: string,       // כותרת
  content: string,     // HTML מנוקה
  rawText: string,     // טקסט גולמי
  categories: string[],
  references: Reference[],
  dateAdded: Date,
  summary: string
}
```

### 2. זיהוי מקורות אוטומטי
**קובץ**: `src/utils/smartReferences.ts`

**טכנולוגיה**: Regex patterns + NLP בסיסי

**מקורות נתמכים**:
- **גמרא**: `בבא קמא דף ב עמוד א`
- **שולחן ערוך**: `חושן משפט סימן ג`
- **רמב"ם**: `הלכות גניבה פרק א הלכה ב`
- **משנה**: `בבא מציעא פרק ב משנה ג`
- **ספרים**: `בראשית פרק א פסוק א`

**תהליך**:
```javascript
extractAllSources(text) → [
  { type: 'gemara', source: 'בבא קמא:2:א', text: '...', position: {start, end} },
  { type: 'shulchan_aruch', source: 'חו״מ:3', ... }
]
```

### 3. אינדקס חכם (Smart Index)
**קובץ**: `src/pages/SmartIndex.tsx`

**מבנה היררכי**:
```
גמרא
  ├─ בבא קמא
  │   ├─ דף ב (3 פסקים)
  │   └─ דף ג (2 פסקים)
  └─ שבת
שולחן ערוך
  └─ חושן משפט
      └─ סימן ג
```

**פונקציות**:
- `buildSourceIndex()` - בונה מבנה היררכי
- Group by type → book → chapter → verse
- מונה כמה פסקים מצטטים כל מקור
- לחיצה על מקור → קפיצה לפסק עם highlight

### 4. עמוד פסק דין עם סיידברים
**קובץ**: `src/pages/PsakView.tsx`

**ארכיטקטורה - 3 אזורים**:

**סיידבר שמאלי - עריכה** (`EditingSidebar.tsx`):
- עיצוב טקסט: B/I/U/S/X²/X₂
- 5 צבעי הדגשה (רקע)
- בחירת גודל גופן (14-24px)
- ריווח שורות (1.0-2.5)
- כפתור איפוס
- Auto-hide + Pin

**אזור מרכזי - תוכן**:
- תוכן הפסק ב-HTML
- `contentEditable={true}` - ניתן לעריכה
- שמירת העדפות עיצוב ב-localStorage
- Highlight של מקורות בלחיצה מהאינדקס

**סיידבר ימני - ניווט** (`NavigationSidebar.tsx`):
- 3 טאבים:
  - **סיכום**: תקציר הפסק
  - **תוכן עניינים**: כותרות מה-HTML
  - **מקורות**: רשימת מקורות עם קבוצות
- חיפוש במקורות
- לחיצה → ניווט/קפיצה למקור

**Auto-Hide Logic**:
```javascript
useEffect(() => {
  const handleMouseMove = (e) => {
    if (!leftSidebarPinned && e.clientX <= 50) 
      setLeftSidebarVisible(true);
    if (!rightSidebarPinned && e.clientX >= window.innerWidth - 50)
      setRightSidebarVisible(true);
  };
  window.addEventListener('mousemove', handleMouseMove);
}, []);
```

### 5. פופאפ עריכה בבחירת טקסט
**קובץ**: `src/components/SelectionPopup.tsx`

**טריגר**: `document.addEventListener('selectionchange')`

**תכונות**:
- מופיע **מעל** הטקסט הנבחר (לא על גביו)
- עיצוב טקסט: 6 כפתורים
- 8 צבעי רקע
- 6 צבעי טקסט
- פעולות: העתק, נקה עיצוב

**חישוב מיקום**:
```javascript
const rect = selection.getRangeAt(0).getBoundingClientRect();
const popupHeight = 280;
let top = rect.top - containerRect.top + scrollTop - popupHeight - 15;
if (top < 0) top = rect.bottom + 15; // Flip below if no space
```

**עיצוב**:
- רקע לבן, מסגרת mouse-400
- טקסט זהב
- חץ למטה מצביע על הטקסט

### 6. עמוד מקורות + Sefaria API
**קובץ**: `src/pages/SourceView.tsx`

**זרימה**:
1. URL: `/source/:source` (encoded)
2. פענוח: `gemara:בבא קמא:2:א`
3. המרה ל-Sefaria format: `Bava_Kamma.2a`
4. Fetch: `https://www.sefaria.org/api/texts/Bava_Kamma.2a`
5. קאש: שמירה ב-localStorage
6. Render: טקסט עברי + מידע גרסה

**סיידברים**:
- שמאל: עריכה (כמו בפסק)
- **ימין**: פסקים קשורים (יוצא מקצה הסיידבר השמאלי!)

**חדשנות**: הסיידבר הימני ממוקם `left: 64` (אחרי הסיידבר השמאלי) במקום `right: 0`

### 7. סיידבר ראשי עם Auto-Hide
**קובץ**: `src/components/Sidebar.tsx`

**פיצ'רים**:
- **Auto-hide**: מוסתר כברירת מחדל
- **Trigger**: עכבר בקצה ימין (50px) → פתיחה
- **Pin button**: 📍 מצמיד, 📌 מבטל
- **Dynamic margin**: `App.tsx` מתאים את `<main>` בהתאם

**מצב מוצמד**:
- Sidebar: `translate-x-0`
- Main: `mr-72` (288px)

**מצב מוסתר**:
- Sidebar: `translate-x-full`
- Main: `mr-0`

### 8. תצוגות מרובות + בחירה מרובה
**קובץ**: `src/pages/PsakimList.tsx`

**4 מצבי תצוגה**:

**Grid (▦)**: כרטיסים 3 עמודות
- מתאים לעיון מהיר
- תמונת מצב של כל פסק

**Table (▤)**: טבלה מסודרת
- עמודות: מספר, כותרת, קטגוריות, תאריך, פעולות
- שורות מודגשות לסירוגין
- כפתורי פעולה בשורה

**Compact (▥)**: 5 כרטיסים בשורה
- חוסך מקום
- רק מידע בסיסי

**List (☰)**: שורה אחת לפסק
- תצוגה צפופה
- מידע מלא בשורה אחת

**בחירה מרובה**:
- כפתור "☑ בחירה מרובה"
- Checkboxes על כל פסק
- "בחר הכל" / "בטל הכל"
- "מחק נבחרים (X)" עם מונה
- עובד בכל מצבי התצוגה!

**State Management**:
```typescript
const [viewMode, setViewMode] = useState<ViewMode>('grid');
const [selectionMode, setSelectionMode] = useState(false);
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
```

### 9. מניעת כפילויות
**קובץ**: `src/App.tsx`

**בהעלאה**:
```javascript
const isDuplicate = psakim.some(
  p => p.number === psak.number && p.title === psak.title
);
if (!isDuplicate) newPsakim.push(psak);
```

**הסרה ידנית**:
```javascript
handleRemoveDuplicates() {
  const seen = new Map();
  const unique = psakim.filter(p => {
    const key = `${p.number}-${p.title}`;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
  setPsakim(unique);
}
```

---

## מבנה הקבצים

### src/components/
- **Sidebar.tsx** - סיידבר ראשי עם auto-hide
- **EditingSidebar.tsx** - כלי עריכה (שמאל)
- **NavigationSidebar.tsx** - ניווט ומקורות (ימין)
- **SelectionPopup.tsx** - פופאפ עריכה בבחירת טקסט

### src/pages/
- **App.tsx** - רוט קומפוננט, ניהול state ראשי
- **Dashboard.tsx** - עמוד בית עם סטטיסטיקות
- **PsakimList.tsx** - רשימת פסקים עם 4 תצוגות
- **PsakView.tsx** - עמוד פסק בודד עם סיידברים
- **Upload.tsx** - העלאת קבצים
- **SourceView.tsx** - תצוגת מקור מספריא
- **SmartIndex.tsx** - אינדקס היררכי של מקורות
- **Connections.tsx** - גרף קשרים בין פסקים
- **GemaraExplorer.tsx** - סיור במסכתות
- **ShulchanAruchExplorer.tsx** - סיור בשו"ע
- **SefarimExplorer.tsx** - סיור בספרים

### src/types/
- **index.ts** - כל ההגדרות:
```typescript
interface PsakDin {
  id: string;
  number: number;
  title: string;
  content: string;
  rawText: string;
  categories: string[];
  references: Reference[];
  dateAdded: Date;
  summary: string;
}

interface Reference {
  id: string;
  type: 'gemara' | 'shulchan_aruch' | 'rambam' | 'mishna' | 'book';
  source: string;
  text: string;
  psakId: string;
  position: { start: number; end: number };
}
```

### src/utils/
- **psakUtils.ts** - פרסינג, חיפוש, פורמט תאריכים
- **smartReferences.ts** - זיהוי מקורות, בניית אינדקס
- **sefaria.ts** - (אופציונלי) אינטגרציה עם Sefaria

---

## קומפוננטות עיקריות

### Sidebar (Main Navigation)
**Props**: 
```typescript
{ psakCount: number, onPinnedChange?: (isPinned: boolean) => void }
```

**State**:
- `isPinned` - מוצמד או לא
- `isVisible` - נראה או מוסתר (auto)
- `isHovering` - עכבר מעל הסיידבר

**Logic**:
- Mouse near right edge (50px) → show
- Mouse far from sidebar (>320px) AND not hovering → hide
- Pin button toggles isPinned
- Callback to App.tsx to adjust main margin

### EditingSidebar
**Props**:
```typescript
{
  fontSize: number,
  onFontSizeChange: (size: number) => void,
  lineHeight: number,
  onLineHeightChange: (height: number) => void,
  onTextStyle: (style) => void,
  onHighlight: (color: string) => void,
  onReset: () => void,
  isPinned?: boolean,
  onTogglePin?: () => void
}
```

**Functions**:
- Text styles: `document.execCommand('bold'/'italic'/...)`
- Highlight: wrap selection in `<span style="background: color">`
- Reset: restore original HTML from props

### NavigationSidebar
**Props**:
```typescript
{
  psak: PsakDin,
  onNavigate: (position: number) => void,
  onSourceClick: (source: string) => void,
  isPinned?: boolean,
  onTogglePin?: () => void
}
```

**Tabs**:
1. **Summary**: `psak.summary`
2. **TOC**: parsed from HTML headings
3. **Sources**: `psak.references` grouped by type

**Search**:
- Filter sources by query
- Case-insensitive Hebrew/English

### SelectionPopup
**Props**:
```typescript
{ containerRef: React.RefObject<HTMLDivElement> }
```

**Lifecycle**:
1. Listen to `selectionchange` event
2. Check if selection inside container
3. Calculate position (above or below)
4. Show popup
5. Apply styles with `document.execCommand`
6. Hide on click outside or selection collapsed

**Styles Applied**:
- Text: bold, italic, underline, strikethrough, superscript, subscript
- Background: 8 colors
- Text color: 6 colors
- Copy, Clear formatting

---

## התקנה והרצה

### דרישות מקדימות
- Node.js 18+
- npm או yarn

### התקנה
```bash
cd psak-din-app
npm install
```

### הרצה בפיתוח
```bash
npm run dev
```
→ פתח דפדפן ב-`http://localhost:3000`

### בנייה לייצור
```bash
npm run build
```
→ קבצים ב-`dist/`

### Preview של build
```bash
npm run preview
```

---

## פיצ'רים מתקדמים

### 1. localStorage Persistence
כל פסק נשמר עם:
- התוכן המלא
- העדפות עיצוב לפי פסק
- קאש של מקורות מספריא
- מצב סיידבר (pinned/hidden)

### 2. Smart Caching
- פסקי דין: שמירה אחת בעת העלאה
- מקורות Sefaria: קאש לכל בקשה
- פורמט: `source-cache-${encodedSource}`

### 3. Hebrew Date Formatting
```javascript
formatHebrewDate(date) → "ח׳ בשבט תשפ״ו"
```
- המרה לועזי ← עברי
- פורמט יפה לתצוגה

### 4. Responsive Design
- Mobile: 1 עמודה
- Tablet: 2 עמודות
- Desktop: 3 עמודות
- גריד דינמי עם Tailwind

### 5. Color Scheme
```javascript
colors: {
  navy: { 900: '#1e293b', 800: '#334155', 950: '#0f172a' },
  gold: { 400: '#eab308', 500: '#d97706', 600: '#c2410c' },
  cream: { 100: '#fef9e7', 200: '#fcf4dd' },
  mouse: { 100: '#f5f5f5', 400: '#9ca3af', 600: '#4b5563' }
}
```

### 6. Animations
- `animate-fade-in` - הופעה עדינה
- `transition-all duration-300` - מעברים חלקים
- `hover:scale-110` - זום בהובר
- `animate-pulse` - פעימה להדגשה

### 7. Security
- DOMPurify לניקוי HTML
- `suppressContentEditableWarning` ל-React
- Sanitize user input בחיפוש

### 8. Performance
- `useMemo` לחישובים כבדים
- `useCallback` למניעת re-renders
- Lazy loading של מקורות
- Virtual scrolling (יכול להוסיף)

---

## טיפים למפתחים

### הוספת מקור חדש
1. הוסף regex ב-`smartReferences.ts`:
```javascript
const pattern = /your-pattern/g;
```
2. הוסף parser ב-`parseSourceToSefaria`
3. הוסף type ב-`Reference` interface

### הוספת תצוגה חדשה
1. הוסף ב-`PsakimList.tsx`:
```typescript
type ViewMode = 'grid' | 'table' | 'compact' | 'list' | 'YOUR_NEW_VIEW';
```
2. צור JSX למצב החדש
3. הוסף כפתור ב-`viewModes` array

### שינוי עיצוב
1. ערוך `tailwind.config.js`
2. הוסף צבעים/פונטים
3. npm run dev יעדכן אוטומטית

### Debug
- React DevTools להסתכלות על state
- Console logs בכל שלב
- localStorage פתוח ב-DevTools → Application

---

## רישיון
MIT License - שימוש חופשי

## תמיכה
לשאלות ותמיכה, פנה למפתח.

---

**גרסה**: 1.0.0  
**תאריך**: 2026-01-10  
**מפתח**: GitHub Copilot + AI Assistant  
**שפות**: TypeScript, Hebrew (RTL)  

🎉 **Happy Coding!** 🎉
