# ⚡ התחלה מהירה - פרויקט חדש תוך 5 דקות

> העתק והדבק את הפקודות האלה ב-PowerShell

---

## 🚀 פקודות מלאות להקמת פרויקט חדש

### החלף את המשתנים הבאים:
- `PROJECT_NAME` - שם הפרויקט (באנגלית, בלי רווחים)
- `DB_PASSWORD` - סיסמה חזקה למסד הנתונים
- `ORG_ID` - מזהה הארגון ב-Supabase (קבל עם `supabase orgs list`)

```powershell
# === הגדרות ===
$PROJECT_NAME = "my-awesome-app"
$DB_PASSWORD = "SuperSecure123!"
$ORG_ID = "org_xxxxxxxx"  # קבל עם: supabase orgs list

# === 1. צור פרויקט React+TypeScript ===
npm create vite@latest $PROJECT_NAME -- --template react-ts
cd $PROJECT_NAME
npm install

# === 2. הוסף Supabase SDK ===
npm install @supabase/supabase-js

# === 3. אתחל Git ודחוף ל-GitHub ===
git init
git add .
git commit -m "Initial commit"
gh repo create $PROJECT_NAME --public --source=. --remote=origin --push

# === 4. צור פרויקט Supabase ===
$SUPABASE_OUTPUT = supabase projects create "$PROJECT_NAME-db" --org-id $ORG_ID --db-password $DB_PASSWORD --region eu-central-1
Write-Host $SUPABASE_OUTPUT

# קבל את ה-project-ref (המזהה של הפרויקט)
Write-Host "רשום את ה-project-ref מהפלט למעלה!"
$PROJECT_REF = Read-Host "הכנס project-ref"

# קבל API keys
supabase projects api-keys --project-id $PROJECT_REF

# === 5. צור קבצי הגדרה ===

# .env
@"
VITE_SUPABASE_URL=https://$PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE
"@ | Out-File -Encoding utf8 .env

# .env.example
@"
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
"@ | Out-File -Encoding utf8 .env.example

# .gitignore - הוסף .env
Add-Content .gitignore "`n.env`n.netlify"

# netlify.toml
@"
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
"@ | Out-File -Encoding utf8 netlify.toml

# === 6. צור קובץ Supabase Client ===
New-Item -ItemType Directory -Force -Path src/lib

@"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
"@ | Out-File -Encoding utf8 src/lib/supabase.ts

# === 7. חבר ל-Netlify ===
netlify init
# בחר: Create & configure a new site

# קשר לפרויקט
netlify link

# הגדר משתני סביבה (החלף את הערכים!)
$ANON_KEY = Read-Host "הכנס את ה-Anon Key מ-Supabase"
netlify env:set VITE_SUPABASE_URL "https://$PROJECT_REF.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY $ANON_KEY

# === 8. Commit ופריסה ===
git add .
git commit -m "Setup: Supabase + Netlify integration"
git push

# פרוס!
netlify deploy --prod

# === 9. פתח את האתר ===
netlify open:site

Write-Host "🎉 הפרויקט מוכן!" -ForegroundColor Green
Write-Host "האתר: $(netlify status | Select-String 'Project URL')" -ForegroundColor Cyan
```

---

## 📋 צ'קליסט

- [ ] Node.js מותקן
- [ ] Git מותקן
- [ ] CLIs מותקנים (`supabase`, `netlify`, `gh`)
- [ ] מחובר לכל השירותים (`gh auth status`, `supabase login`, `netlify status`)
- [ ] יש org-id ב-Supabase
- [ ] הפרויקט נוצר בהצלחה!

---

## 🔗 אחרי ההקמה

כל פעם שתרצה לעדכן את האתר:

```powershell
git add .
git commit -m "תיאור השינוי"
git push
# זהו! Netlify יפרוס אוטומטית תוך ~30 שניות
```

---

*נוצר על ידי GitHub Copilot*
