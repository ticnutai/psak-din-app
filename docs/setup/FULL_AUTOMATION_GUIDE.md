# 🚀 מדריך אוטומציה מלאה - Supabase + GitHub + Netlify

> **מטרה:** להקים פרויקט חדש עם סנכרון מלא בין מסד נתונים, קוד ופריסה - **הכל דרך VS Code ו-Copilot בלי להיכנס לאף אתר!**

---

## 📋 תוכן עניינים

1. [דרישות מקדימות](#דרישות-מקדימות)
2. [התקנת CLIs](#התקנת-clis)
3. [התחברות חד-פעמית](#התחברות-חד-פעמית)
4. [הקמת פרויקט חדש - שלב אחר שלב](#הקמת-פרויקט-חדש)
5. [פקודות יומיומיות](#פקודות-יומיומיות)
6. [סקריפטים אוטומטיים](#סקריפטים-אוטומטיים)
7. [פתרון בעיות](#פתרון-בעיות)

---

## 🔧 דרישות מקדימות

### תוכנות נדרשות
```powershell
# Node.js (גרסה 18+)
node --version

# Git
git --version

# npm
npm --version
```

### חשבונות נדרשים
- [x] חשבון GitHub (עם Personal Access Token)
- [x] חשבון Supabase
- [x] חשבון Netlify (מחובר ל-GitHub)

---

## 📦 התקנת CLIs

### התקנה חד-פעמית של כל הכלים:

```powershell
# Supabase CLI
npm install -g supabase

# Netlify CLI
npm install -g netlify-cli

# GitHub CLI
winget install GitHub.cli
# או
choco install gh
```

### בדיקה שהכל מותקן:
```powershell
supabase --version   # צריך להיות 2.x+
netlify --version    # צריך להיות 23.x+
gh --version         # צריך להיות 2.x+
```

---

## 🔐 התחברות חד-פעמית

> **הערה:** זה נדרש פעם אחת בלבד! אחרי זה הכל אוטומטי.

### 1. GitHub CLI
```powershell
gh auth login
# בחר: GitHub.com → HTTPS → Login with browser
# זה יפתח דפדפן - התחבר ותאשר
```

### 2. Supabase CLI
```powershell
supabase login
# יפתח דפדפן - התחבר ותאשר
```

### 3. Netlify CLI
```powershell
netlify login
# יפתח דפדפן - התחבר ותאשר
```

### בדיקת התחברות:
```powershell
gh auth status       # צריך להראות "Logged in to github.com"
supabase projects list   # צריך להראות רשימת פרויקטים
netlify status       # צריך להראות את המשתמש
```

---

## 🏗️ הקמת פרויקט חדש

### שלב 1: יצירת פרויקט Vite/React
```powershell
# צור פרויקט חדש
npm create vite@latest my-new-app -- --template react-ts
cd my-new-app
npm install
```

### שלב 2: יצירת Repo ב-GitHub
```powershell
# אתחל Git
git init
git add .
git commit -m "Initial commit"

# צור repo ב-GitHub ודחוף
gh repo create my-new-app --public --source=. --remote=origin --push
```

### שלב 3: יצירת פרויקט Supabase
```powershell
# רשימת ארגונים (כדי לקבל org-id)
supabase orgs list

# צור פרויקט חדש
supabase projects create my-new-db \
  --org-id YOUR_ORG_ID \
  --db-password YOUR_SECURE_PASSWORD \
  --region eu-central-1

# קבל את ה-API keys
supabase projects api-keys --project-ref PROJECT_REF
```

### שלב 4: הגדרת משתני סביבה
```powershell
# צור קובץ .env
@"
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
"@ | Out-File -Encoding utf8 .env

# הוסף ל-.gitignore
echo ".env" >> .gitignore
```

### שלב 5: חיבור ל-Netlify
```powershell
# צור netlify.toml
@"
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"@ | Out-File -Encoding utf8 netlify.toml

# צור אתר ב-Netlify וקשר אותו ל-GitHub
netlify init
# בחר: Create & configure a new site
# בחר: Link to GitHub repo

# הגדר משתני סביבה ב-Netlify
netlify env:set VITE_SUPABASE_URL "https://YOUR_PROJECT_REF.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "YOUR_ANON_KEY"

# פרוס!
netlify deploy --prod
```

---

## 📝 פקודות יומיומיות

### Git + GitHub
```powershell
# דחוף שינויים (מפעיל Netlify אוטומטית!)
git add .
git commit -m "תיאור השינוי"
git push

# צור PR
gh pr create --title "תיאור" --body "פרטים"

# צפה ב-PRs
gh pr list
```

### Supabase
```powershell
# צור migration חדש
supabase migration new create_users_table

# הרץ migrations
supabase db push

# צור טיפוסי TypeScript מה-DB
supabase gen types typescript --project-id PROJECT_REF > src/types/database.ts

# פתח את ה-Dashboard (בדפדפן)
supabase projects list  # קבל project-ref
# לך ל: https://supabase.com/dashboard/project/PROJECT_REF
```

### Netlify
```powershell
# פרוס עכשיו
netlify deploy --prod

# צפה ב-logs
netlify logs

# פתח את האתר
netlify open:site

# פתח את ה-Dashboard
netlify open:admin

# הגדר משתנה סביבה
netlify env:set KEY VALUE

# בדוק סטטוס
netlify status
```

---

## ⚡ סקריפטים אוטומטיים

### הוסף לקובץ package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    
    "deploy": "git add . && git commit -m 'deploy' && git push",
    "deploy:prod": "netlify deploy --prod",
    "deploy:preview": "netlify deploy",
    
    "db:push": "supabase db push",
    "db:types": "supabase gen types typescript --project-id $env:SUPABASE_PROJECT_ID > src/types/database.ts",
    "db:migrate": "supabase migration new",
    
    "status": "netlify status && supabase projects list",
    "logs": "netlify logs"
  }
}
```

### שימוש:
```powershell
npm run deploy      # דחוף ל-GitHub (Netlify יפרוס אוטומטית)
npm run deploy:prod # פריסה ישירה ל-Netlify
npm run db:push     # עדכן את ה-DB
npm run status      # בדוק סטטוס הכל
```

---

## 🔄 תהליך העבודה המומלץ

```
┌─────────────────────────────────────────────────────────────┐
│                    תהליך פיתוח אוטומטי                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. כתיבת קוד ב-VS Code                                    │
│          ↓                                                  │
│   2. npm run deploy (או git push)                          │
│          ↓                                                  │
│   3. GitHub מקבל את הקוד                                    │
│          ↓                                                  │
│   4. Netlify מזהה שינוי ובונה אוטומטית                       │
│          ↓                                                  │
│   5. האתר מתעדכן תוך ~30 שניות!                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 פתרון בעיות

### בעיה: "not logged in"
```powershell
# התחבר מחדש
gh auth login
supabase login
netlify login
```

### בעיה: "project not linked"
```powershell
# קשר את הפרויקט
supabase link --project-ref YOUR_PROJECT_REF
netlify link
```

### בעיה: Build נכשל ב-Netlify
```powershell
# בדוק logs
netlify logs

# בנה מקומית לבדיקה
npm run build
```

### בעיה: משתני סביבה לא עובדים
```powershell
# רשום את כל המשתנים
netlify env:list

# הוסף מחדש
netlify env:set VITE_SUPABASE_URL "..."
netlify env:set VITE_SUPABASE_ANON_KEY "..."

# פרוס מחדש
netlify deploy --prod
```

---

## 📚 קישורים שימושיים

| שירות | Dashboard | תיעוד |
|--------|-----------|-------|
| Supabase | https://supabase.com/dashboard | https://supabase.com/docs |
| Netlify | https://app.netlify.com | https://docs.netlify.com |
| GitHub | https://github.com | https://cli.github.com/manual |

---

## 🎯 סיכום

עם ההתקנה החד-פעמית והסקריפטים האלה, כל פרויקט עתידי יהיה:

1. **מהיר** - הקמה תוך דקות
2. **אוטומטי** - push = deploy
3. **מסונכרן** - DB + Code + Hosting
4. **ללא דפדפן** - הכל מ-VS Code!

---

*נוצר על ידי GitHub Copilot | עודכן: ינואר 2026*
