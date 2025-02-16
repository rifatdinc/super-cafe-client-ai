export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          name: string;
          category_id?: string;
          price: number;
          stock_quantity?: number;
          description?: string;
          image_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string;
          price?: number;
          stock_quantity?: number;
          description?: string;
          image_url?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          customer_id: string;
          total_amount: number;
          status?: order_status_type;
          payment_status?: payment_status_type;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          total_amount?: number;
          status?: order_status_type;
          payment_status?: payment_status_type;
          notes?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: OrderItem;
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
    };
  };
}

export type order_status_type = 'preparing' | 'completed' | 'cancelled';
export type payment_status_type = 'paid' | 'unpaid';

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id?: string;
  price: number;
  stock_quantity?: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: order_status_type;
  payment_status: payment_status_type;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  products?: Product;
}