import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Expense, Partner, Category } from '../types';
import { INITIAL_EXPENSES, INITIAL_PARTNERS, INITIAL_CATEGORIES, getMonthAndYearFromDate } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

type Theme = 'light' | 'dark';

interface AppContextType {
  expenses: Expense[];
  partners: Partner[];
  categories: Category[];
  addExpense: (expenseData: Omit<Expense, 'id' | 'month' | 'year' | 'entryTimestamp'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addPartner: (partnerData: Omit<Partner, 'id'>) => Promise<void>;
  updatePartner: (partner: Partner) => Promise<void>;
  deletePartner: (partnerId: string) => Promise<void>;
  addCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getCategoryNameById: (id: string) => string;
  getPartnerNameById: (id?: string) => string;
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Effect for saving theme to localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
    // Effect for fetching data from Supabase on initial load
    useEffect(() => {
        const fetchAndSeedData = async () => {
            setIsLoading(true);

            if (!supabase) {
                console.warn("Supabase not configured. Loading initial data locally. Changes will not be saved.");
                setPartners(INITIAL_PARTNERS);
                setCategories(INITIAL_CATEGORIES);
                setExpenses(INITIAL_EXPENSES);
                setIsLoading(false);
                return;
            }

            try {
                // Check if partners table is empty. If so, we assume DB is empty and seed it.
                const { data: partnersCheck, error: checkError } = await supabase.from('partners').select('id').limit(1);
                if (checkError) throw checkError;

                if (partnersCheck.length === 0) {
                    console.log("Database empty, seeding initial data...");
                    // Seed partners, categories, and expenses
                    const { error: pError } = await supabase.from('partners').insert(INITIAL_PARTNERS);
                    if (pError) throw pError;

                    const { error: cError } = await supabase.from('categories').insert(INITIAL_CATEGORIES);
                    if (cError) throw cError;
                    
                    const { error: eError } = await supabase.from('expenses').insert(INITIAL_EXPENSES);
                    if (eError) throw eError;
                }

                // Fetch all data
                const [partnersRes, categoriesRes, expensesRes] = await Promise.all([
                    supabase.from('partners').select('*'),
                    supabase.from('categories').select('*'),
                    supabase.from('expenses').select('*').order('date', { ascending: false })
                ]);

                if (partnersRes.error) throw partnersRes.error;
                if (categoriesRes.error) throw categoriesRes.error;
                if (expensesRes.error) throw expensesRes.error;

                setPartners(partnersRes.data || []);
                setCategories(categoriesRes.data || []);
                setExpenses(expensesRes.data || []);

            } catch (error) {
                console.error("Error during data initialization:", error);
                alert("Could not connect to the database. Please check your Supabase credentials in `lib/supabaseClient.ts`.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndSeedData();
    }, []);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'month' | 'year' | 'entryTimestamp'>) => {
    const { month, year } = getMonthAndYearFromDate(expenseData.date);
    const newExpense = {
      ...expenseData,
      id: uuidv4(),
      month,
      year,
      entryTimestamp: new Date().toISOString(),
    };
    
    if (supabase) {
      const { data, error } = await supabase.from('expenses').insert(newExpense).select().single();
      if (error) {
        console.error("Error adding expense:", error);
        return;
      }
      setExpenses(prev => [data, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const updateExpense = useCallback(async (updatedExpenseData: Expense) => {
    const { month, year } = getMonthAndYearFromDate(updatedExpenseData.date);
    const fullUpdatedExpense = { ...updatedExpenseData, month, year, entryTimestamp: new Date().toISOString() };
    
    if (supabase) {
      const { data, error } = await supabase.from('expenses').update(fullUpdatedExpense).eq('id', fullUpdatedExpense.id).select().single();
      if (error) {
         console.error("Error updating expense:", error);
         return;
      }
      setExpenses(prev => prev.map(exp => exp.id === data.id ? data : exp).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } else {
      setExpenses(prev => prev.map(exp => exp.id === fullUpdatedExpense.id ? fullUpdatedExpense : exp).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, []);

  const deleteExpense = useCallback(async (expenseId: string) => {
    if (supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
       if (error) {
         console.error("Error deleting expense:", error);
         return;
      }
    }
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  }, []);

  const addPartner = useCallback(async (partnerData: Omit<Partner, 'id'>) => {
    const newPartner = { ...partnerData, id: uuidv4() };
    if (supabase) {
      const { data, error } = await supabase.from('partners').insert(newPartner).select().single();
      if (error) { console.error("Error adding partner:", error); return; }
      setPartners(prev => [...prev, data]);
    } else {
      setPartners(prev => [...prev, newPartner]);
    }
  }, []);

  const updatePartner = useCallback(async (updatedPartner: Partner) => {
    if (supabase) {
      const { data, error } = await supabase.from('partners').update(updatedPartner).eq('id', updatedPartner.id).select().single();
      if (error) { console.error("Error updating partner:", error); return; }
      setPartners(prev => prev.map(p => p.id === data.id ? data : p));
    } else {
      setPartners(prev => prev.map(p => p.id === updatedPartner.id ? updatedPartner : p));
    }
  }, []);

  const deletePartner = useCallback(async (partnerId: string) => {
    const unassignedCompanyPartner = partners.find(p => p.name === "Unassigned / Company");

    if (supabase) {
      // Reassign expenses first
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ paidByPartnerId: unassignedCompanyPartner?.id })
        .eq('paidByPartnerId', partnerId);
      
      if (updateError) { console.error("Error reassigning expenses:", updateError); return; }
      
      // Then delete partner
      const { error: deleteError } = await supabase.from('partners').delete().eq('id', partnerId);
      if (deleteError) { console.error("Error deleting partner:", deleteError); return; }
    }

    setPartners(prev => prev.filter(p => p.id !== partnerId));
    setExpenses(prevExpenses => prevExpenses.map(exp => 
        exp.paidByPartnerId === partnerId ? { ...exp, paidByPartnerId: unassignedCompanyPartner?.id } : exp
    ));
  }, [partners]);

  const addCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => {
    const newCategory = { ...categoryData, id: uuidv4() };
    if (supabase) {
      const { data, error } = await supabase.from('categories').insert(newCategory).select().single();
      if (error) { console.error("Error adding category:", error); return; }
      setCategories(prev => [...prev, data]);
    } else {
      setCategories(prev => [...prev, newCategory]);
    }
  }, []);

  const updateCategory = useCallback(async (updatedCategory: Category) => {
    if (supabase) {
      const { data, error } = await supabase.from('categories').update(updatedCategory).eq('id', updatedCategory.id).select().single();
      if (error) { console.error("Error updating category:", error); return; }
      setCategories(prev => prev.map(c => c.id === data.id ? data : c));
    } else {
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    const miscCategory = categories.find(c => c.name.toLowerCase() === "miscellaneous");
    
    if (supabase) {
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ categoryId: miscCategory ? miscCategory.id : '' })
        .eq('categoryId', categoryId);

      if (updateError) { console.error("Error reassigning expenses for category:", updateError); return; }

      const { error: deleteError } = await supabase.from('categories').delete().eq('id', categoryId);
      if (deleteError) { console.error("Error deleting category:", deleteError); return; }
    }

    setCategories(prev => prev.filter(c => c.id !== categoryId));
    setExpenses(prevExpenses => prevExpenses.map(exp =>
        exp.categoryId === categoryId ? { ...exp, categoryId: miscCategory ? miscCategory.id : '' } : exp
    ));
  }, [categories]);

  const getCategoryNameById = useCallback((id: string): string => {
    return categories.find(c => c.id === id)?.name || "N/A";
  }, [categories]);

  const getPartnerNameById = useCallback((id?: string): string => {
    if (!id) return "N/A";
    return partners.find(p => p.id === id)?.name || "Unknown Partner";
  }, [partners]);

  return (
    <AppContext.Provider value={{
      expenses, partners, categories,
      addExpense, updateExpense, deleteExpense,
      addPartner, updatePartner, deletePartner,
      addCategory, updateCategory, deleteCategory,
      getCategoryNameById, getPartnerNameById,
      theme, toggleTheme, isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
