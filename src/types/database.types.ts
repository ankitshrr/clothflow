export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string;
          avatar_url?: string;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          avatar_url?: string;
          role?: 'customer' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          image_url?: string;
          parent_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_url?: string;
          parent_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category_id: string | null;
          base_price: number;
          sale_price: number | null;
          sku: string | null;
          moq: number;
          product_type: 'retail' | 'wholesale' | 'both';
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          short_description?: string;
          category_id?: string | null;
          base_price: number;
          sale_price?: number | null;
          sku?: string;
          moq?: number;
          product_type?: 'retail' | 'wholesale' | 'both';
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          short_description?: string;
          category_id?: string | null;
          base_price?: number;
          sale_price?: number | null;
          sku?: string;
          moq?: number;
          product_type?: 'retail' | 'wholesale' | 'both';
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      product_sizes: {
        Row: {
          id: string;
          product_id: string;
          size_label: string;
          size_type: 'clothing' | 'shoes' | 'accessories';
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size_label: string;
          size_type?: 'clothing' | 'shoes' | 'accessories';
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size_label?: string;
          size_type?: 'clothing' | 'shoes' | 'accessories';
          created_at?: string;
        };
      };
      product_colors: {
        Row: {
          id: string;
          product_id: string;
          color_name: string;
          color_hex: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          color_name: string;
          color_hex?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          color_name?: string;
          color_hex?: string;
          created_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          size_id: string | null;
          color_id: string | null;
          quantity: number;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size_id?: string | null;
          color_id?: string | null;
          quantity?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size_id?: string | null;
          color_id?: string | null;
          quantity?: number;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          size_id: string | null;
          color_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          size_id?: string | null;
          color_id?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          size_id?: string | null;
          color_id?: string | null;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          subtotal: number;
          shipping_cost: number;
          tax_amount: number;
          total: number;
          shipping_address: Json;
          billing_address: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          subtotal: number;
          shipping_cost?: number;
          tax_amount?: number;
          total: number;
          shipping_address?: Json;
          billing_address?: Json;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          subtotal?: number;
          shipping_cost?: number;
          tax_amount?: number;
          total?: number;
          shipping_address?: Json;
          billing_address?: Json;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          size_label: string | null;
          color_name: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          size_label?: string;
          color_name?: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          size_label?: string;
          color_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      store_locations: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string | null;
          postal_code: string | null;
          country: string;
          latitude: number;
          longitude: number;
          phone: string | null;
          email: string | null;
          operating_hours: Json;
          is_active: boolean;
          offers_pickup: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          state?: string;
          postal_code?: string;
          country?: string;
          latitude: number;
          longitude: number;
          phone?: string;
          email?: string;
          operating_hours?: Json;
          is_active?: boolean;
          offers_pickup?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          operating_hours?: Json;
          is_active?: boolean;
          offers_pickup?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          comment: string | null;
          is_verified_purchase: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          title?: string;
          comment?: string;
          is_verified_purchase?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
          rating?: number;
          title?: string;
          comment?: string;
          is_verified_purchase?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          user_id: string | null;
          product_id: string;
          name: string;
          email: string;
          phone: string | null;
          company_name: string | null;
          message: string;
          quantity: number;
          size_id: string | null;
          color_id: string | null;
          inquiry_type: 'order' | 'inquiry';
          status: 'new' | 'in_progress' | 'responded' | 'closed';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          product_id: string;
          name: string;
          email: string;
          phone?: string;
          company_name?: string;
          message?: string;
          quantity?: number;
          size_id?: string | null;
          color_id?: string | null;
          inquiry_type?: 'order' | 'inquiry';
          status?: 'new' | 'in_progress' | 'responded' | 'closed';
          admin_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          product_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          company_name?: string;
          message?: string;
          quantity?: number;
          size_id?: string | null;
          color_id?: string | null;
          inquiry_type?: 'order' | 'inquiry';
          status?: 'new' | 'in_progress' | 'responded' | 'closed';
          admin_notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
