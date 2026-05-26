import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Item, Category } from '../types';

interface InventoryContextType {
  items: Item[];
  categories: Category[];
  loading: boolean;
  refreshItems: () => Promise<void>;
  addItem: (item: Partial<Item>) => Promise<boolean>;
  updateItemQuantity: (id: string, newQuantity: number) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  addCategory: (name: string) => Promise<boolean>;
}

const InventoryContext = createContext<InventoryContextType>({
  items: [],
  categories: [],
  loading: true,
  refreshItems: async () => {},
  addItem: async () => false,
  updateItemQuantity: async () => false,
  deleteItem: async () => false,
  addCategory: async () => false,
});

export const InventoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        supabase.from('items').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name')
      ]);

      if (itemsResponse.data) setItems(itemsResponse.data as Item[]);
      if (categoriesResponse.data) setCategories(categoriesResponse.data as Category[]);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const addItem = async (item: Partial<Item>) => {
    const { error } = await supabase.from('items').insert([item]);
    if (error) {
      console.error('Error adding item:', error);
      return false;
    }
    return true;
  };

  const updateItemQuantity = async (id: string, newQuantity: number) => {
    const { error } = await supabase.from('items').update({ quantity: newQuantity }).eq('id', id);
    if (error) {
      console.error('Error updating item quantity:', error);
      return false;
    }
    return true;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      console.error('Error deleting item:', error);
      return false;
    }
    return true;
  };

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();
        
      if (error) {
        console.error('Error adding category:', error);
        return false;
      }
      
      setCategories(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error('Error adding category:', err);
      return false;
    }
  };

  return (
    <InventoryContext.Provider value={{
      items,
      categories,
      loading,
      refreshItems: fetchData,
      addItem,
      updateItemQuantity,
      deleteItem,
      addCategory
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
