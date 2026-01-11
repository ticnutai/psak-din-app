# Supabase Developer Quick Reference

## 🚀 Quick Start

### Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://whnghrnzspnqkwrpdaee.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Import the Client
```typescript
import { supabase, psakimService } from './lib/supabase';
```

---

## 📦 psakimService API

### Get All Records
```typescript
const { data, error } = await psakimService.getAll();
// data: PsakDin[]
```

### Get Single Record
```typescript
const { data, error } = await psakimService.getById('uuid-here');
// data: PsakDin | null
```

### Search Records
```typescript
const { data, error } = await psakimService.search('תיווך');
// Searches in title and content
```

### Create Record
```typescript
const { data, error } = await psakimService.create({
  title: 'כותרת הפסק',
  content: 'תוכן הפסק המלא...',
  date: '2026-01-11',
  topics: ['תיווך', 'חוזים'],
  sources: ['שולחן ערוך חושן משפט']
});
```

### Update Record
```typescript
const { data, error } = await psakimService.update('uuid-here', {
  title: 'כותרת מעודכנת'
});
```

### Delete Record
```typescript
const { error } = await psakimService.delete('uuid-here');
```

---

## 📊 Database Schema

### Table: `psakim`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `title` | TEXT | כותרת הפסק (required) |
| `content` | TEXT | תוכן הפסק המלא (required) |
| `date` | DATE | תאריך הפסק |
| `topics` | TEXT[] | מערך נושאים |
| `sources` | TEXT[] | מערך מקורות |
| `created_at` | TIMESTAMPTZ | תאריך יצירה (auto) |
| `updated_at` | TIMESTAMPTZ | תאריך עדכון (auto) |

### TypeScript Interface
```typescript
interface PsakDin {
  id: string;
  title: string;
  content: string;
  date?: string;
  topics?: string[];
  sources?: string[];
  created_at?: string;
  updated_at?: string;
}
```

---

## 🔐 Row Level Security (RLS)

Current policies:
- ✅ **Public Read**: Anyone can SELECT
- 🔒 **Authenticated Write**: Only authenticated users can INSERT/UPDATE/DELETE

### Checking Authentication
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  // User is authenticated
}
```

---

## 🛠️ Direct Supabase Client Usage

### Custom Queries
```typescript
// With filters
const { data } = await supabase
  .from('psakim')
  .select('*')
  .contains('topics', ['תיווך'])
  .order('created_at', { ascending: false })
  .limit(10);

// With text search
const { data } = await supabase
  .from('psakim')
  .select('*')
  .textSearch('title', 'תיווך');
```

### Realtime Subscriptions
```typescript
const subscription = supabase
  .channel('psakim-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'psakim' },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## 🔧 CLI Commands

```bash
# Login to Supabase
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"

# Link local project
supabase link --project-ref whnghrnzspnqkwrpdaee

# Push migrations
supabase db push

# Generate types
supabase gen types typescript --project-id whnghrnzspnqkwrpdaee > src/types/supabase.ts

# View project status
supabase status
```

---

## 🌐 API Endpoints

### REST API (PostgREST)
```
Base: https://whnghrnzspnqkwrpdaee.supabase.co/rest/v1/
```

### Example cURL
```bash
curl "https://whnghrnzspnqkwrpdaee.supabase.co/rest/v1/psakim?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## ⚠️ Common Errors

### "JWT expired"
```typescript
// Refresh the session
await supabase.auth.refreshSession();
```

### "Row level security violation"
```typescript
// Make sure user is authenticated for write operations
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### "relation does not exist"
Check that migrations have been applied:
```bash
supabase db push
```

---

## 📁 Project Structure

```
psak-din-app/
├── .env                 # Environment variables
├── .env.example         # Template for env vars
├── src/
│   └── lib/
│       └── supabase.ts  # Supabase client & services
└── supabase/
    └── migrations/
        └── 20260111_create_psakim_table.sql
```

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Project Dashboard | https://supabase.com/dashboard/project/whnghrnzspnqkwrpdaee |
| API Docs | https://supabase.com/docs/reference/javascript |
| SQL Editor | https://supabase.com/dashboard/project/whnghrnzspnqkwrpdaee/sql |
| Table Editor | https://supabase.com/dashboard/project/whnghrnzspnqkwrpdaee/editor |

---

*Last updated: January 11, 2026*
