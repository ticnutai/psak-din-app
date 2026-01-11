# מדריך מפורט - התחברות ל-Supabase דרך CLI ו-API

## תוכן עניינים
1. [סקירה כללית](#סקירה-כללית)
2. [טכנולוגיות ששימשו](#טכנולוגיות-ששימשו)
3. [שלב 1: בדיקת CLI](#שלב-1-בדיקת-cli)
4. [שלב 2: התקנת SDK](#שלב-2-התקנת-sdk)
5. [שלב 3: התחברות ל-Supabase](#שלב-3-התחברות-ל-supabase)
6. [שלב 4: יצירת ארגון](#שלב-4-יצירת-ארגון)
7. [שלב 5: יצירת פרויקט](#שלב-5-יצירת-פרויקט)
8. [שלב 6: יצירת טבלאות](#שלב-6-יצירת-טבלאות)
9. [בעיות ופתרונות](#בעיות-ופתרונות)
10. [קודים לדוגמה](#קודים-לדוגמה)

---

## סקירה כללית

מסמך זה מתאר את התהליך המלא של הגדרת Supabase לפרויקט **Psak Din App** באופן אוטומטי לחלוטין, ללא שימוש בממשק הוויזואלי (Dashboard).

### מה הושג:
- ✅ יצירת פרויקט Supabase חדש
- ✅ הגדרת טבלת `psakim` לאחסון פסקי דין
- ✅ הגדרת Row Level Security (RLS)
- ✅ קישור הפרויקט המקומי
- ✅ הגדרת Environment Variables

---

## טכנולוגיות ששימשו

| טכנולוגיה | שימוש | הערות |
|-----------|-------|-------|
| **Supabase CLI** | ניהול פרויקטים, קישור, migrations | גרסה 2.67.1 |
| **Supabase Management API** | יצירת פרויקטים, הרצת SQL | REST API עם Bearer Token |
| **PowerShell** | הרצת פקודות, קריאות HTTP | Invoke-RestMethod |
| **@supabase/supabase-js** | SDK לצד הלקוח | גרסה אחרונה |

### שתי דרכים עיקריות לתקשורת עם Supabase:

#### 1. Supabase CLI
```bash
# התחברות
supabase login

# רשימת פרויקטים
supabase projects list

# יצירת פרויקט (אינטראקטיבי)
supabase projects create <name> --org-id <org-id>

# קישור פרויקט מקומי
supabase link --project-ref <ref>

# העלאת migrations
supabase db push
```

#### 2. Supabase Management API
```
Base URL: https://api.supabase.com/v1
Authentication: Bearer <access_token>
```

**Endpoints עיקריים:**
| Endpoint | Method | תיאור |
|----------|--------|-------|
| `/organizations` | GET | רשימת ארגונים |
| `/organizations` | POST | יצירת ארגון |
| `/projects` | GET | רשימת פרויקטים |
| `/projects` | POST | יצירת פרויקט |
| `/projects/{ref}/api-keys` | GET | קבלת API Keys |
| `/projects/{ref}/database/query` | POST | הרצת SQL |

---

## שלב 1: בדיקת CLI

### בדיקה שה-CLI מותקן:
```powershell
supabase --version
# Output: 2.67.1
```

### אם לא מותקן:
```powershell
# Windows (Scoop)
scoop install supabase

# או npm
npm install -g supabase
```

---

## שלב 2: התקנת SDK

### התקנה באמצעות npm:
```bash
cd psak-din-app
npm install @supabase/supabase-js
```

### יצירת קובץ Client:
**קובץ: `src/lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## שלב 3: התחברות ל-Supabase

### קבלת Access Token:
1. היכנס ל: https://supabase.com/dashboard/account/tokens
2. צור token חדש
3. העתק את ה-token (מתחיל ב-`sbp_`)

### התחברות דרך CLI:
```powershell
# הגדרת משתנה סביבה
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxxx"

# או התחברות ישירה
supabase login
# (יפתח דפדפן לאימות)
```

### בדיקת התחברות:
```powershell
supabase projects list
```

---

## שלב 4: יצירת ארגון

### דרך CLI:
```powershell
supabase orgs create "PsakDinApp"
```

### דרך API:
```powershell
$token = "sbp_xxxxx"
$headers = @{ 
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{ name = "PsakDinApp" } | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.supabase.com/v1/organizations" `
    -Method Post -Headers $headers -Body $body
```

### תוצאה:
```json
{
  "id": "brpyrawxeflfganesgzb",
  "name": "PsakDinApp"
}
```

---

## שלב 5: יצירת פרויקט

### ⚠️ בעיה שנתקלנו בה:
ה-CLI דורש בחירת region אינטראקטיבית שלא עובדת טוב בטרמינל אוטומטי.

### ✅ פתרון - שימוש ב-Management API:

#### שלב 5.1: קבלת רשימת Regions
```powershell
$response = Invoke-RestMethod `
    -Uri "https://api.supabase.com/v1/projects/available-regions?organization_slug=<org_slug>" `
    -Headers @{ Authorization = "Bearer $token" }

# Regions זמינים:
# us-west-1, us-west-2, us-east-1, eu-central-1, ap-south-1, etc.
```

#### שלב 5.2: יצירת הפרויקט
```powershell
$jsonBody = @{
    name = "psak-din-db"
    organization_id = "bjmofcyyzaqspcrsuifo"  # ID של ארגון עם תוכנית Pro
    db_pass = "YourSecurePassword123!"
    region = "eu-central-1"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "https://api.supabase.com/v1/projects" `
    -Method Post `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $jsonBody

# תוצאה:
# {
#   "id": "whnghrnzspnqkwrpdaee",
#   "ref": "whnghrnzspnqkwrpdaee",
#   "name": "psak-din-db",
#   "region": "eu-central-1",
#   "status": "COMING_UP"
# }
```

#### שלב 5.3: המתנה להפעלת הפרויקט
```powershell
# בדיקת סטטוס כל 30 שניות
do {
    Start-Sleep -Seconds 30
    $status = Invoke-RestMethod `
        -Uri "https://api.supabase.com/v1/projects/whnghrnzspnqkwrpdaee" `
        -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Status: $($status.status)"
} while ($status.status -ne "ACTIVE_HEALTHY")
```

#### שלב 5.4: קבלת API Keys
```powershell
$apiKeys = Invoke-RestMethod `
    -Uri "https://api.supabase.com/v1/projects/whnghrnzspnqkwrpdaee/api-keys" `
    -Headers @{ Authorization = "Bearer $token" }

# מחזיר:
# - anon key (לצד לקוח)
# - service_role key (לצד שרת)
```

---

## שלב 6: יצירת טבלאות

### ⚠️ בעיה שנתקלנו בה:
`supabase db push` נכשל עם שגיאת TLS כי הדאטאבייס עדיין מתעורר.

### ✅ פתרון - הרצת SQL דרך API:

```powershell
$token = "sbp_xxxxx"
$projectRef = "whnghrnzspnqkwrpdaee"

$sql = @"
CREATE TABLE IF NOT EXISTS public.psakim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date DATE,
    topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    sources TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
"@

$body = @{ query = $sql } | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" `
    -Method Post `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

### הוספת Row Level Security:
```powershell
$sql = "ALTER TABLE public.psakim ENABLE ROW LEVEL SECURITY; CREATE POLICY allow_public_read ON public.psakim FOR SELECT USING (true);"

$body = @{ query = $sql } | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" `
    -Method Post `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

---

## בעיות ופתרונות

### בעיה 1: CLI דורש בחירת Region אינטראקטיבית
**תיאור:** הפקודה `supabase projects create` פותחת תפריט אינטראקטיבי לבחירת region שלא עובד בטרמינלים אוטומטיים.

**פתרון:** שימוש ב-Management API במקום CLI:
```powershell
# במקום:
supabase projects create my-project --org-id xxx

# להשתמש ב-API:
Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects" ...
```

---

### בעיה 2: הגבלת פרויקטים חינמיים
**שגיאה:**
```
"The following organization members have reached their maximum limits 
for the number of active free projects within organizations where they 
are an administrator or owner: ticnutai (2 project limit)"
```

**פתרון:** יצירת הפרויקט תחת ארגון עם תוכנית Pro:
```powershell
# לבדוק איזה ארגון יש לו Pro
$orgs = Invoke-RestMethod -Uri "https://api.supabase.com/v1/organizations" ...

# ליצור פרויקט תחת הארגון הנכון
$body = @{ organization_id = "bjmofcyyzaqspcrsuifo" ... }
```

---

### בעיה 3: שגיאת TLS בחיבור לדאטאבייס
**שגיאה:**
```
failed to connect to postgres: tls error (EOF)
```

**סיבה:** הדאטאבייס עדיין בתהליך הפעלה (COMING_UP).

**פתרון:** 
1. להמתין עד שהסטטוס יהיה ACTIVE_HEALTHY
2. להשתמש ב-API להרצת SQL במקום `supabase db push`

---

### בעיה 4: Invalid Access Token
**שגיאה:**
```
Invalid access token format. Must be like `sbp_0102...1920`
```

**פתרון:** להגדיר משתנה סביבה:
```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxxx"
```

---

### בעיה 5: Organization Not Found
**שגיאה:**
```json
{ "message": "Organization not found" }
```

**סיבה:** השתמשנו בשם הארגון במקום ב-ID/Slug.

**פתרון:** להשתמש ב-`organization_id` (ה-ID הארוך):
```powershell
# לא נכון:
organization_slug = "PsakDinApp"

# נכון:
organization_id = "brpyrawxeflfganesgzb"
```

---

## קודים לדוגמה

### בדיקת חיבור לטבלה:
```powershell
$anonKey = "eyJhbGciOiJIUzI1NiIs..."
$projectUrl = "https://whnghrnzspnqkwrpdaee.supabase.co"

$result = Invoke-RestMethod `
    -Uri "$projectUrl/rest/v1/psakim?select=*" `
    -Headers @{
        apikey = $anonKey
        Authorization = "Bearer $anonKey"
    }

Write-Host "Records: $($result.Count)"
```

### הכנסת רשומה:
```powershell
$serviceKey = "eyJhbGciOiJIUzI1NiIs..."

$data = @{
    title = "תיווך ללא הסכם"
    content = "פסק דין בנושא..."
    date = "2026-01-11"
    topics = @("תיווך", "חוזים")
    sources = @("שולחן ערוך")
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "$projectUrl/rest/v1/psakim" `
    -Method Post `
    -Headers @{
        apikey = $serviceKey
        Authorization = "Bearer $serviceKey"
        "Content-Type" = "application/json; charset=utf-8"
        Prefer = "return=representation"
    } `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($data))
```

---

## פרטי הפרויקט הסופיים

| פרמטר | ערך |
|-------|-----|
| **Project Name** | psak-din-db |
| **Project Ref** | whnghrnzspnqkwrpdaee |
| **Region** | eu-central-1 (Frankfurt) |
| **URL** | https://whnghrnzspnqkwrpdaee.supabase.co |
| **Database Host** | db.whnghrnzspnqkwrpdaee.supabase.co |
| **Organization** | ticnutai's Org |

---

## קישורים שימושיים

- [Supabase Management API Docs](https://supabase.com/docs/reference/api)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

*מסמך זה נוצר ב-11 בינואר 2026*
