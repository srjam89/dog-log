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
          full_name: string;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      dogs: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          breed: string | null;
          birth_date: string | null;
          weight_kg: number | null;
          weight_unit: 'kg' | 'lb';
          gender: 'female' | 'male' | 'unknown';
          photo_path: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          breed?: string | null;
          birth_date?: string | null;
          weight_kg?: number | null;
          weight_unit?: 'kg' | 'lb';
          gender?: 'female' | 'male' | 'unknown';
          photo_path?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          breed?: string | null;
          birth_date?: string | null;
          weight_kg?: number | null;
          weight_unit?: 'kg' | 'lb';
          gender?: 'female' | 'male' | 'unknown';
          photo_path?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dogs_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      walks: {
        Row: {
          id: string;
          owner_id: string;
          dog_id: string;
          started_at: string;
          duration_minutes: number;
          distance_km: number | null;
          location: string | null;
          weather: string | null;
          behaviour_notes: string | null;
          rating: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          dog_id: string;
          started_at?: string;
          duration_minutes: number;
          distance_km?: number | null;
          location?: string | null;
          weather?: string | null;
          behaviour_notes?: string | null;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          dog_id?: string;
          started_at?: string;
          duration_minutes?: number;
          distance_km?: number | null;
          location?: string | null;
          weather?: string | null;
          behaviour_notes?: string | null;
          rating?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'walks_dog_owner_fk';
            columns: ['dog_id', 'owner_id'];
            isOneToOne: false;
            referencedRelation: 'dogs';
            referencedColumns: ['id', 'owner_id'];
          },
        ];
      };
      training_sessions: {
        Row: {
          id: string;
          owner_id: string;
          dog_id: string;
          occurred_at: string;
          duration_minutes: number;
          location: string | null;
          training_type: string;
          skills: string[];
          exercises: string | null;
          went_well: string | null;
          issues: string | null;
          improvements: string | null;
          success_rating: number | null;
          focus_rating: number | null;
          rating: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          dog_id: string;
          occurred_at?: string;
          duration_minutes: number;
          location?: string | null;
          training_type?: string;
          skills?: string[];
          exercises?: string | null;
          went_well?: string | null;
          issues?: string | null;
          improvements?: string | null;
          success_rating?: number | null;
          focus_rating?: number | null;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          dog_id?: string;
          occurred_at?: string;
          duration_minutes?: number;
          location?: string | null;
          training_type?: string;
          skills?: string[];
          exercises?: string | null;
          went_well?: string | null;
          issues?: string | null;
          improvements?: string | null;
          success_rating?: number | null;
          focus_rating?: number | null;
          rating?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'training_dog_owner_fk';
            columns: ['dog_id', 'owner_id'];
            isOneToOne: false;
            referencedRelation: 'dogs';
            referencedColumns: ['id', 'owner_id'];
          },
        ];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          reminders_enabled: boolean;
          walk_reminders_enabled: boolean;
          walk_reminder_time: string;
          training_reminders_enabled: boolean;
          training_reminder_time: string;
          daily_check_in_enabled: boolean;
          daily_check_in_time: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          reminders_enabled?: boolean;
          walk_reminders_enabled?: boolean;
          walk_reminder_time?: string;
          training_reminders_enabled?: boolean;
          training_reminder_time?: string;
          daily_check_in_enabled?: boolean;
          daily_check_in_time?: string;
          updated_at?: string;
        };
        Update: {
          reminders_enabled?: boolean;
          walk_reminders_enabled?: boolean;
          walk_reminder_time?: string;
          training_reminders_enabled?: boolean;
          training_reminder_time?: string;
          daily_check_in_enabled?: boolean;
          daily_check_in_time?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database['public']['Tables'];
export type Row<T extends TableName> =
  Database['public']['Tables'][T]['Row'];
export type Insert<T extends TableName> =
  Database['public']['Tables'][T]['Insert'];
export type Update<T extends TableName> =
  Database['public']['Tables'][T]['Update'];

export type Profile = Row<'profiles'>;
export type Dog = Row<'dogs'>;
export type Walk = Row<'walks'>;
export type TrainingSession = Row<'training_sessions'>;
export type NotificationPreferences = Row<'notification_preferences'>;

export type DogSummary = Pick<Dog, 'id' | 'name' | 'photo_path'>;
export type WalkWithDog = Walk & { dog: DogSummary | null };
export type TrainingSessionWithDog = TrainingSession & {
  dog: DogSummary | null;
};
export type Activity =
  | (WalkWithDog & { activityType: 'walk'; activityDate: string })
  | (TrainingSessionWithDog & {
      activityType: 'training';
      activityDate: string;
    });
