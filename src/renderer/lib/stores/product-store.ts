import { create } from 'zustand'
import { supabase } from '../supabase'
import type { Category, Product } from '../../../types/database.types'
import { useCustomerAuthStore } from './customer-auth-store'

interface ProductState {
  categories: Category[]
  products: Product[]
  selectedCategory: string | null
  isLoading: boolean
  error: string | null

  fetchCategories: () => Promise<void>
  fetchProducts: (categoryId?: string) => Promise<void>
  setSelectedCategory: (categoryId: string | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProductStore = create<ProductState>((set, get) => ({
  categories: [],
  products: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('Authentication required');
      }

      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ categories: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching categories:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProducts: async (categoryId?: string) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('Authentication required');
      }

      set({ isLoading: true, error: null });
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .order('name');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ products: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching products:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId })
    if (categoryId) {
      get().fetchProducts(categoryId)
    } else {
      get().fetchProducts()
    }
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error })
}))