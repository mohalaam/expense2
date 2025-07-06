import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Expense, Partner, Category } from '../types';

// Define a type for your database schema.
// This is optional but provides type safety and auto-completion.
export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: Expense; // The type of a row in your table.
        Insert: Omit<Expense, 'entryTimestamp'> & { entryTimestamp?: string }; // The type to insert a new row.
        Update: Partial<Expense>; // The type to update a row.
      };
      partners: {
        Row: Partner;
        Insert: Partner;
        Update: Partial<Partner>;
      };
      categories: {
        Row: Category;
        Insert: Category;
        Update: Partial<Category>;
      };
    };
  };
};


// --- IMPORTANT ---
// 1. Create a project on https://supabase.com/
// 2. Go to Project Settings > API
// 3. Find your Project URL and anon public key.
// 4. Replace the placeholder values below.
// For production, use environment variables to store these secrets.
const supabaseUrl = 'https://yszpulimduvstxpwrand.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaGFudnp2cWZkaGFoZHJ6YnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzA3OTQsImV4cCI6MjA2NzQwNjc5NH0.evtzisJ4FJzXUIHu3pVT9asD5MEmpk1wiWyQagDQSj0';

let supabaseInstance: SupabaseClient<Database> | null = null;

if (supabaseUrl === 'https://mhhanvzvqfdhahdrzbpz.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaGFudnp2cWZkaGFoZHJ6YnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzA3OTQsImV4cCI6MjA2NzQwNjc5NH0.evtzisJ4FJzXUIHu3pVT9asD5MEmpk1wiWyQagDQSj0') {
    const warning = `
    ****************************************************************************************
    *                                                                                      *
    *                          !!! SUPABASE IS NOT CONFIGURED !!!                            *
    *                                                                                      *
    *  Please open 'lib/supabaseClient.ts' and replace the placeholder values for          *
    *  'supabaseUrl' and 'supabaseAnonKey' with your actual Supabase project credentials.  *
    *  The application will run in a local mode until this is done.                        *
    *  Changes will NOT be saved.                                                          *
    *                                                                                      *
    ****************************************************************************************
    `;
    console.warn(warning);
} else {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Create and export the Supabase client.
// The `Database` generic provides type safety for your queries.
export const supabase = supabaseInstance;
