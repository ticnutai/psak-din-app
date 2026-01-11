import { createClient } from '@supabase/supabase-js';

// הגדרות Supabase - יש להחליף עם הערכים מהפרויקט שלך
// ניתן למצוא ב: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file'
  );
}

// יצירת הקליינט
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// טיפוסים בסיסיים לפסקי דין (ניתן להרחיב בהתאם לסכמה)
export interface PsakDin {
  id: string;
  title: string;
  content: string;
  date?: string;
  topics?: string[];
  sources?: string[];
  created_at?: string;
  updated_at?: string;
}

// פונקציות עזר לעבודה עם פסקי דין
export const psakimService = {
  // קבלת כל פסקי הדין
  async getAll() {
    const { data, error } = await supabase
      .from('psakim')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as PsakDin[];
  },

  // קבלת פסק דין לפי ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('psakim')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as PsakDin;
  },

  // חיפוש פסקי דין
  async search(query: string) {
    const { data, error } = await supabase
      .from('psakim')
      .select('*')
      .textSearch('content', query, { type: 'websearch' });
    
    if (error) throw error;
    return data as PsakDin[];
  },

  // הוספת פסק דין חדש
  async create(psak: Omit<PsakDin, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('psakim')
      .insert(psak)
      .select()
      .single();
    
    if (error) throw error;
    return data as PsakDin;
  },

  // עדכון פסק דין
  async update(id: string, updates: Partial<PsakDin>) {
    const { data, error } = await supabase
      .from('psakim')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as PsakDin;
  },

  // מחיקת פסק דין
  async delete(id: string) {
    const { error } = await supabase
      .from('psakim')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export default supabase;
