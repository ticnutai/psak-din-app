<#
.SYNOPSIS
    סקריפט אוטומטי להקמת פרויקט חדש עם Supabase + GitHub + Netlify

.DESCRIPTION
    מקים פרויקט React+TypeScript חדש עם כל החיבורים האוטומטיים

.PARAMETER ProjectName
    שם הפרויקט (באנגלית, בלי רווחים)

.PARAMETER OrgId
    מזהה הארגון ב-Supabase (קבל עם: supabase orgs list)

.PARAMETER DbPassword
    סיסמה למסד הנתונים

.EXAMPLE
    .\New-FullStackProject.ps1 -ProjectName "my-app" -OrgId "org_xxx" -DbPassword "SecurePass123!"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$true)]
    [string]$OrgId,
    
    [Parameter(Mandatory=$true)]
    [string]$DbPassword,
    
    [string]$Region = "eu-central-1",
    [switch]$SkipSupabase,
    [switch]$SkipNetlify
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n▶ $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

# === בדיקת דרישות ===
Write-Step "בודק דרישות מקדימות..."

$requirements = @{
    "node" = "node --version"
    "npm" = "npm --version"
    "git" = "git --version"
    "gh" = "gh --version"
    "supabase" = "supabase --version"
    "netlify" = "netlify --version"
}

foreach ($tool in $requirements.Keys) {
    try {
        Invoke-Expression $requirements[$tool] | Out-Null
        Write-Success "$tool מותקן"
    } catch {
        Write-Error "$tool לא מותקן!"
        exit 1
    }
}

# === בדיקת התחברות ===
Write-Step "בודק התחברות לשירותים..."

try {
    gh auth status 2>&1 | Out-Null
    Write-Success "GitHub מחובר"
} catch {
    Write-Error "לא מחובר ל-GitHub. הרץ: gh auth login"
    exit 1
}

if (-not $SkipNetlify) {
    try {
        $netlifyStatus = netlify status 2>&1
        if ($netlifyStatus -match "Not logged in") {
            throw "Not logged in"
        }
        Write-Success "Netlify מחובר"
    } catch {
        Write-Error "לא מחובר ל-Netlify. הרץ: netlify login"
        exit 1
    }
}

# === יצירת פרויקט ===
Write-Step "יוצר פרויקט Vite + React + TypeScript..."

npm create vite@latest $ProjectName -- --template react-ts
Set-Location $ProjectName

Write-Success "פרויקט נוצר"

# === התקנת תלויות ===
Write-Step "מתקין תלויות..."

npm install
npm install @supabase/supabase-js

Write-Success "תלויות הותקנו"

# === Git + GitHub ===
Write-Step "מאתחל Git ויוצר repo ב-GitHub..."

git init
git add .
git commit -m "Initial commit: Vite + React + TypeScript"

gh repo create $ProjectName --public --source=. --remote=origin --push

Write-Success "Repo נוצר: https://github.com/$(gh api user --jq .login)/$ProjectName"

# === Supabase ===
if (-not $SkipSupabase) {
    Write-Step "יוצר פרויקט Supabase..."
    
    $dbName = "$ProjectName-db"
    
    try {
        $output = supabase projects create $dbName --org-id $OrgId --db-password $DbPassword --region $Region 2>&1
        
        # מחלץ את ה-project-ref מהפלט
        if ($output -match "Created a new project ([a-z]+)") {
            $ProjectRef = $Matches[1]
        } else {
            # מנסה לקבל מרשימת הפרויקטים
            Start-Sleep -Seconds 5
            $projects = supabase projects list --output json | ConvertFrom-Json
            $ProjectRef = ($projects | Where-Object { $_.name -eq $dbName }).id
        }
        
        if ($ProjectRef) {
            Write-Success "Supabase project נוצר: $ProjectRef"
            
            # מחכה שהפרויקט יהיה מוכן
            Write-Host "  ממתין לאתחול הפרויקט..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            # מקבל API keys
            $apiKeys = supabase projects api-keys --project-id $ProjectRef 2>&1
            
            # מחלץ את ה-anon key
            if ($apiKeys -match "anon\s+\|\s+([^\s]+)") {
                $AnonKey = $Matches[1]
            }
            
            Write-Success "API Keys התקבלו"
        } else {
            Write-Host "  ⚠ לא הצלחתי לקבל project-ref אוטומטית" -ForegroundColor Yellow
            $ProjectRef = Read-Host "הכנס את ה-project-ref ידנית"
            $AnonKey = Read-Host "הכנס את ה-anon key"
        }
    } catch {
        Write-Host "  ⚠ שגיאה ביצירת Supabase: $_" -ForegroundColor Yellow
        $ProjectRef = Read-Host "הכנס את ה-project-ref ידנית (או השאר ריק לדלג)"
        if ($ProjectRef) {
            $AnonKey = Read-Host "הכנס את ה-anon key"
        }
    }
}

# === יצירת קבצי הגדרה ===
Write-Step "יוצר קבצי הגדרה..."

# .env
if ($ProjectRef -and $AnonKey) {
    @"
VITE_SUPABASE_URL=https://$ProjectRef.supabase.co
VITE_SUPABASE_ANON_KEY=$AnonKey
"@ | Out-File -Encoding utf8 .env
    Write-Success ".env נוצר"
}

# .env.example
@"
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
"@ | Out-File -Encoding utf8 .env.example
Write-Success ".env.example נוצר"

# .gitignore - עדכון
Add-Content .gitignore "`n# Environment`n.env`n.env.local`n`n# Netlify`n.netlify"
Write-Success ".gitignore עודכן"

# netlify.toml
@"
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
"@ | Out-File -Encoding utf8 netlify.toml
Write-Success "netlify.toml נוצר"

# src/lib/supabase.ts
New-Item -ItemType Directory -Force -Path src/lib | Out-Null
@"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => !!supabase
"@ | Out-File -Encoding utf8 src/lib/supabase.ts
Write-Success "src/lib/supabase.ts נוצר"

# === Netlify ===
if (-not $SkipNetlify) {
    Write-Step "מחבר ל-Netlify..."
    
    # יוצר אתר חדש
    netlify sites:create --name $ProjectName 2>&1 | Out-Null
    netlify link 2>&1 | Out-Null
    
    # מגדיר משתני סביבה
    if ($ProjectRef -and $AnonKey) {
        netlify env:set VITE_SUPABASE_URL "https://$ProjectRef.supabase.co" 2>&1 | Out-Null
        netlify env:set VITE_SUPABASE_ANON_KEY $AnonKey 2>&1 | Out-Null
        Write-Success "משתני סביבה הוגדרו ב-Netlify"
    }
    
    Write-Success "Netlify מחובר"
}

# === Commit והעלאה ===
Write-Step "מעלה שינויים ל-GitHub..."

git add .
git commit -m "Setup: Supabase + Netlify integration"
git push

Write-Success "הקוד הועלה ל-GitHub"

# === פריסה ===
if (-not $SkipNetlify) {
    Write-Step "פורס ל-Netlify..."
    
    netlify deploy --prod 2>&1 | Out-Null
    
    $siteUrl = (netlify status 2>&1 | Select-String "Project URL").ToString().Split(":")[1].Trim()
    Write-Success "האתר נפרס!"
}

# === סיכום ===
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "                    🎉 הפרויקט מוכן!                        " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  📁 תיקייה:     $(Get-Location)" -ForegroundColor White
Write-Host "  🐙 GitHub:     https://github.com/$(gh api user --jq .login)/$ProjectName" -ForegroundColor White

if ($ProjectRef) {
    Write-Host "  🗄️  Supabase:   https://supabase.com/dashboard/project/$ProjectRef" -ForegroundColor White
}

if (-not $SkipNetlify -and $siteUrl) {
    Write-Host "  🌐 אתר:        $siteUrl" -ForegroundColor White
}

Write-Host ""
Write-Host "  📝 פקודות שימושיות:" -ForegroundColor Yellow
Write-Host "     npm run dev          - הרץ מקומית" -ForegroundColor Gray
Write-Host "     git push             - פרוס (אוטומטי!)" -ForegroundColor Gray
Write-Host "     netlify open:site    - פתח את האתר" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
