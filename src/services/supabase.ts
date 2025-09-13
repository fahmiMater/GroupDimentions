import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function for error handling
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  if (error?.message) {
    throw new Error(error.message);
  }
  throw new Error('حدث خطأ غير متوقع في قاعدة البيانات');
};

// Generic CRUD operations
export class SupabaseService<T extends Record<string, any>> {
  constructor(private tableName: string) {}

  async getAll(options?: {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
    offset?: number;
    filters?: Record<string, any>;
  }): Promise<T[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select(options?.select || '*');

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options?.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }

  async getById(id: number, options?: { select?: string }): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(options?.select || '*')
        .eq(`${this.tableName.replace('gc_', '').replace(/s$/, '')}_id`, id)
        .single();

      if (error && error.code !== 'PGRST116') {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...data,
          created_at: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return result;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({
          ...data,
          updated_by: 1 // This should come from auth context
        })
        .eq(`${this.tableName.replace('gc_', '').replace(/s$/, '')}_id`, id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return result;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq(`${this.tableName.replace('gc_', '').replace(/s$/, '')}_id`, id);

      if (error) {
        handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }

  async count(filters?: Record<string, any>): Promise<number> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      return count || 0;
    } catch (error) {
      handleSupabaseError(error);
      return 0;
    }
  }
}