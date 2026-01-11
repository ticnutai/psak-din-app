# 📚 תיעוד הפרויקט - אינדקס

## 📂 מבנה התיקייה

```
docs/
├── setup/
│   ├── FULL_AUTOMATION_GUIDE.md    # מדריך מלא לאוטומציה
│   ├── QUICK_START_NEW_PROJECT.md  # התחלה מהירה - פרויקט חדש
│   ├── DEVELOPER_TEMPLATES.md      # תבניות קוד למפתחים
│   ├── CLI_CHEATSHEET.md           # כרטיסיית פקודות CLI
│   └── scripts/
│       └── New-FullStackProject.ps1  # סקריפט אוטומטי
└── README.md                       # הקובץ הזה
```

---

## 🚀 התחלה מהירה

### רוצה להקים פרויקט חדש?

**אופציה 1: סקריפט אוטומטי**
```powershell
.\docs\setup\scripts\New-FullStackProject.ps1 -ProjectName "my-app" -OrgId "org_xxx" -DbPassword "Pass123!"
```

**אופציה 2: צעד אחר צעד**
ראה: [QUICK_START_NEW_PROJECT.md](setup/QUICK_START_NEW_PROJECT.md)

---

## 📖 מדריכים

| קובץ | תיאור | מתי להשתמש |
|------|-------|------------|
| [FULL_AUTOMATION_GUIDE.md](setup/FULL_AUTOMATION_GUIDE.md) | מדריך מלא ומפורט | להבנה עמוקה של המערכת |
| [QUICK_START_NEW_PROJECT.md](setup/QUICK_START_NEW_PROJECT.md) | התחלה מהירה | כשרוצים להקים פרויקט מהר |
| [DEVELOPER_TEMPLATES.md](setup/DEVELOPER_TEMPLATES.md) | תבניות קוד | להעתקה לפרויקטים חדשים |
| [CLI_CHEATSHEET.md](setup/CLI_CHEATSHEET.md) | פקודות CLI | עזר מהיר יומיומי |

---

## 🔗 קישורים לפרויקט הנוכחי

| שירות | קישור | סטטוס |
|--------|--------|--------|
| **האתר** | https://psak.netlify.app | ✅ פעיל |
| **GitHub** | https://github.com/ticnutai/psak-din-app | ✅ מסונכרן |
| **Supabase** | https://supabase.com/dashboard/project/whnghrnzspnqkwrpdaee | ✅ מחובר |
| **Netlify** | https://app.netlify.com/projects/psak | ✅ פורס אוטומטית |

---

## 📋 צ'קליסט הקמת פרויקט חדש

- [ ] Node.js 20+ מותקן
- [ ] Git מותקן
- [ ] CLIs מותקנים:
  - [ ] `npm install -g supabase`
  - [ ] `npm install -g netlify-cli`
  - [ ] `winget install GitHub.cli`
- [ ] מחובר לשירותים:
  - [ ] `gh auth login`
  - [ ] `supabase login`
  - [ ] `netlify login`
- [ ] יש org-id ב-Supabase (`supabase orgs list`)

---

## ⚡ פקודות שימושיות

```powershell
# סטטוס מלא
netlify status; supabase projects list; gh auth status

# פריסה מהירה
git add .; git commit -m "update"; git push

# עדכון types מ-Supabase
supabase gen types typescript --project-id whnghrnzspnqkwrpdaee > src/types/database.ts
```

---

*עודכן: ינואר 2026*
