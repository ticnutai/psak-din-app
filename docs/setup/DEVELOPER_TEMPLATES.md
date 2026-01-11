# 🧩 תבניות קוד למפתחים

> קוד מוכן להעתקה לכל פרויקט חדש

---

## 📁 מבנה תיקיות מומלץ

```
src/
├── components/          # רכיבי UI
├── pages/              # דפים (routes)
├── lib/                # ספריות (supabase, utils)
│   ├── supabase.ts     # חיבור Supabase
│   └── utils.ts        # פונקציות עזר
├── hooks/              # React hooks מותאמים
├── types/              # TypeScript types
│   └── database.ts     # טיפוסים מ-Supabase
├── services/           # שירותים (API calls)
└── App.tsx
```

---

## 🔌 Supabase Client - תבנית בסיסית

### `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables!')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper להתנתקות
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

---

## 📊 Service Layer - תבנית CRUD

### `src/services/baseService.ts`

```typescript
import { supabase } from '../lib/supabase'

export interface BaseEntity {
  id: string
  created_at: string
  updated_at?: string
}

export function createCrudService<T extends BaseEntity>(tableName: string) {
  return {
    // קבל הכל
    async getAll(): Promise<T[]> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as T[]
    },

    // קבל לפי ID
    async getById(id: string): Promise<T | null> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as T
    },

    // צור חדש
    async create(item: Omit<T, 'id' | 'created_at'>): Promise<T> {
      const { data, error } = await supabase
        .from(tableName)
        .insert(item)
        .select()
        .single()
      
      if (error) throw error
      return data as T
    },

    // עדכן
    async update(id: string, updates: Partial<T>): Promise<T> {
      const { data, error } = await supabase
        .from(tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as T
    },

    // מחק
    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    // חיפוש
    async search(column: keyof T, query: string): Promise<T[]> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .ilike(column as string, `%${query}%`)
      
      if (error) throw error
      return data as T[]
    }
  }
}
```

### שימוש לדוגמה:

```typescript
// src/services/usersService.ts
import { createCrudService, BaseEntity } from './baseService'

interface User extends BaseEntity {
  email: string
  name: string
  role: 'admin' | 'user'
}

export const usersService = createCrudService<User>('users')

// שימוש:
// const users = await usersService.getAll()
// const user = await usersService.getById('123')
// await usersService.create({ email: 'test@test.com', name: 'Test', role: 'user' })
```

---

## 🪝 React Hooks לניהול נתונים

### `src/hooks/useSupabaseQuery.ts`

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

interface UseSupabaseQueryResult<T> {
  data: T[] | null
  loading: boolean
  error: PostgrestError | null
  refetch: () => void
}

export function useSupabaseQuery<T>(
  tableName: string,
  options?: {
    orderBy?: string
    ascending?: boolean
    limit?: number
    filter?: { column: string; value: string | number }
  }
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    let query = supabase.from(tableName).select('*')

    if (options?.filter) {
      query = query.eq(options.filter.column, options.filter.value)
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.ascending ?? false 
      })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data: result, error: queryError } = await query

    if (queryError) {
      setError(queryError)
      setData(null)
    } else {
      setData(result as T[])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [tableName, JSON.stringify(options)])

  return { data, loading, error, refetch: fetchData }
}
```

### שימוש:

```tsx
function UsersList() {
  const { data: users, loading, error, refetch } = useSupabaseQuery<User>(
    'users',
    { orderBy: 'created_at', limit: 10 }
  )

  if (loading) return <div>טוען...</div>
  if (error) return <div>שגיאה: {error.message}</div>

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

---

## 🔐 Authentication Hook

### `src/hooks/useAuth.ts`

```typescript
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // קבל session נוכחי
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // האזן לשינויים
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### שימוש ב-App.tsx:

```tsx
import { AuthProvider } from './hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ... */}
      </Router>
    </AuthProvider>
  )
}
```

---

## 📄 קובץ Types מ-Supabase

### יצירה אוטומטית:

```powershell
supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.ts
```

### `src/types/database.ts` (דוגמה):

```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      // ... more tables
    }
  }
}
```

---

## ⚙️ Vite Environment Types

### `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // הוסף משתנים נוספים כאן
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 🎨 Tailwind Config מותאם

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          50: '#fdf2f8',
          500: '#ec4899',
          600: '#db2777',
        }
      },
      fontFamily: {
        hebrew: ['Frank Ruhl Libre', 'David', 'serif'],
        sans: ['Heebo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

## 📦 package.json - סקריפטים מומלצים

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    
    "deploy": "git add . && git commit -m 'update' && git push",
    "deploy:prod": "npm run build && netlify deploy --prod",
    "deploy:preview": "npm run build && netlify deploy",
    
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > src/types/database.ts",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration new",
    
    "status": "echo '=== Netlify ===' && netlify status && echo '=== Supabase ===' && supabase projects list",
    "open:site": "netlify open:site",
    "open:admin": "netlify open:admin",
    "logs": "netlify logs"
  }
}
```

---

*נוצר על ידי GitHub Copilot | תבניות קוד לשימוש חוזר*
