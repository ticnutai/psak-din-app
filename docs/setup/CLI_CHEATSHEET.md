# 🔧 פקודות CLI - כרטיסיית עזר מהירה

> כל הפקודות שתצטרך ביום יום - העתק והדבק!

---

## 📊 סטטוס ובדיקות

```powershell
# בדוק שהכל מחובר
gh auth status           # GitHub
supabase projects list   # Supabase
netlify status          # Netlify

# בדוק גרסאות
gh --version
supabase --version
netlify --version
```

---

## 🔐 התחברות

```powershell
# התחבר לשירותים (פעם אחת)
gh auth login           # GitHub
supabase login          # Supabase
netlify login           # Netlify

# התנתק
gh auth logout
supabase logout
netlify logout
```

---

## 📦 GitHub (gh)

```powershell
# === Repos ===
gh repo create NAME --public --source=. --push   # צור repo חדש מהתיקייה הנוכחית
gh repo clone OWNER/REPO                         # שכפל repo
gh repo view --web                               # פתח repo בדפדפן
gh repo list                                     # רשום את כל ה-repos שלי

# === Pull Requests ===
gh pr create --title "TITLE" --body "DESC"      # צור PR
gh pr list                                       # רשום PRs פתוחים
gh pr view NUMBER                                # צפה ב-PR
gh pr merge NUMBER                               # מזג PR
gh pr checkout NUMBER                            # עבור ל-branch של PR

# === Issues ===
gh issue create --title "TITLE" --body "DESC"   # צור issue
gh issue list                                    # רשום issues
gh issue close NUMBER                            # סגור issue

# === Actions (CI/CD) ===
gh run list                                      # רשום workflow runs
gh run view RUN_ID                               # צפה ב-run
gh run watch                                     # צפה ב-run בזמן אמת
```

---

## 🗄️ Supabase

```powershell
# === פרויקטים ===
supabase projects list                           # רשום פרויקטים
supabase projects create NAME --org-id ORG --db-password PASS --region eu-central-1
supabase link --project-ref REF                  # קשר לפרויקט מקומי

# === ארגונים ===
supabase orgs list                               # רשום ארגונים (לקבל org-id)

# === API Keys ===
supabase projects api-keys --project-id REF      # קבל API keys

# === Database ===
supabase db push                                 # דחוף migrations ל-production
supabase db reset                                # אפס DB מקומי
supabase db diff                                 # הצג הבדלים
supabase db dump -f backup.sql                   # גיבוי

# === Migrations ===
supabase migration new NAME                      # צור migration חדש
supabase migration list                          # רשום migrations

# === Types ===
supabase gen types typescript --project-id REF > src/types/database.ts

# === פיתוח מקומי ===
supabase start                                   # הפעל Supabase מקומי
supabase stop                                    # עצור
supabase status                                  # סטטוס מקומי
```

---

## 🌐 Netlify

```powershell
# === חיבור ===
netlify init                                     # אתחל פרויקט חדש
netlify link                                     # קשר לאתר קיים
netlify unlink                                   # נתק

# === פריסה ===
netlify deploy                                   # פריסת Preview
netlify deploy --prod                            # פריסה ל-Production
netlify deploy --dir=dist                        # פרוס תיקייה ספציפית

# === סטטוס ===
netlify status                                   # סטטוס האתר
netlify open:site                                # פתח את האתר
netlify open:admin                               # פתח את ה-Dashboard

# === Logs ===
netlify logs                                     # צפה ב-logs
netlify logs:function FUNCTION_NAME              # logs של פונקציה

# === משתני סביבה ===
netlify env:list                                 # רשום משתנים
netlify env:set KEY VALUE                        # הגדר משתנה
netlify env:unset KEY                            # מחק משתנה
netlify env:get KEY                              # קבל ערך

# === פונקציות ===
netlify functions:list                           # רשום פונקציות
netlify functions:create NAME                    # צור פונקציה
netlify functions:invoke NAME                    # הפעל פונקציה מקומית

# === Build ===
netlify build                                    # בנה מקומית
netlify build --dry                              # בנה ללא שמירה
```

---

## 🔄 Git - תזכורת מהירה

```powershell
# === בסיסי ===
git status                                       # סטטוס
git add .                                        # הוסף הכל
git commit -m "message"                          # commit
git push                                         # דחוף (מפעיל Netlify!)
git pull                                         # משוך עדכונים

# === Branches ===
git branch                                       # רשום branches
git checkout -b NAME                             # צור branch חדש
git checkout main                                # עבור ל-main
git merge BRANCH                                 # מזג branch

# === שחזור ===
git stash                                        # שמור שינויים זמנית
git stash pop                                    # שחזר שינויים
git reset --hard HEAD                            # בטל שינויים
```

---

## ⚡ פקודות משולבות (One-liners)

```powershell
# === פריסה מהירה ===
git add . && git commit -m "update" && git push

# === בדיקת סטטוס מלאה ===
Write-Host "=== GitHub ===" -ForegroundColor Cyan; gh auth status; Write-Host "`n=== Supabase ===" -ForegroundColor Green; supabase projects list; Write-Host "`n=== Netlify ===" -ForegroundColor Yellow; netlify status

# === עדכון DB Types ===
supabase gen types typescript --project-id $env:SUPABASE_PROJECT_REF | Out-File -Encoding utf8 src/types/database.ts

# === פריסה ישירה ===
npm run build && netlify deploy --prod

# === צור פרויקט חדש מלא ===
npm create vite@latest $PROJECT -- --template react-ts && cd $PROJECT && npm i && git init && gh repo create $PROJECT --public --source=. --push && netlify init
```

---

## 🎯 טיפים

### 1. השתמש ב-Aliases
הוסף ל-`$PROFILE` שלך:
```powershell
# פתח את הפרופיל
notepad $PROFILE

# הוסף:
function deploy { git add .; git commit -m $args[0]; git push }
function status { netlify status; supabase projects list }
Set-Alias -Name n -Value netlify
Set-Alias -Name s -Value supabase
Set-Alias -Name g -Value gh
```

### 2. משתני סביבה גלובליים
```powershell
# הוסף ל-$PROFILE:
$env:SUPABASE_PROJECT_REF = "your-project-ref"
```

### 3. Tab Completion
```powershell
# GitHub CLI
gh completion -s powershell | Out-String | Invoke-Expression

# Netlify (לא תומך רשמית)
```

---

*שמור קובץ זה בהישג יד! 📌*
