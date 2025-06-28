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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'owner' | 'admin'
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'owner' | 'admin'
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'owner' | 'admin'
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hotels: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          address: string | null
          contact_number: string | null
          images: string[] | null
          amenities: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          address?: string | null
          contact_number?: string | null
          images?: string[] | null
          amenities?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          address?: string | null
          contact_number?: string | null
          images?: string[] | null
          amenities?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          hotel_id: string
          room_number: string
          type: string
          price: number
          status: 'available' | 'booked' | 'maintenance'
          description: string | null
          images: string[] | null
          amenities: string[] | null
          floor_number: number | null
          room_category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_number: string
          type: string
          price: number
          status?: 'available' | 'booked' | 'maintenance'
          description?: string | null
          images?: string[] | null
          amenities?: string[] | null
          floor_number?: number | null
          room_category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_number?: string
          type?: string
          price?: number
          status?: 'available' | 'booked' | 'maintenance'
          description?: string | null
          images?: string[] | null
          amenities?: string[] | null
          floor_number?: number | null
          room_category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          user_id: string
          status: 'pending' | 'confirmed' | 'cancelled'
          check_in_date: string
          check_out_date: string
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          check_in_date: string
          check_out_date: string
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          check_in_date?: string
          check_out_date?: string
          total_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          rating: number
          comment: string | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          rating: number
          comment?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          booking_id: string | null
          content: string
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          booking_id?: string | null
          content: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          booking_id?: string | null
          content?: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      booking_notifications: {
        Row: {
          id: string
          booking_id: string
          broker_id: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          broker_id: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          broker_id?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'owner' | 'admin'
      booking_status: 'pending' | 'confirmed' | 'cancelled'
      room_status: 'available' | 'booked' | 'maintenance'
    }
  }
}