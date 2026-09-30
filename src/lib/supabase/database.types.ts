/**
 * Mirrors supabase/migrations. Regenerate after schema changes with:
 *   npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
 * (hand-written to match the generator's format for Phase 1).
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

export type WeddingStatus = "draft" | "published" | "archived";
export type WeddingVisibility = "public" | "unlisted";
export type MemberRole = "owner" | "editor" | "viewer";
export type EventKind = "ceremony" | "reception" | "other";
export type MediaKind = "image" | "audio";
export type MediaPurpose = "hero" | "gallery" | "music" | "og";

type ProfileRow = { id: string; full_name: string | null; avatar_url: string | null } & Timestamps;

type WeddingRow = {
  id: string;
  owner_id: string;
  slug: string;
  partner_one_name: string;
  partner_two_name: string;
  wedding_date: string | null;
  template_id: string;
  status: WeddingStatus;
  published_at: string | null;
} & Timestamps;

type MemberRow = { wedding_id: string; user_id: string; role: MemberRole; created_at: string };

type SettingsRow = {
  wedding_id: string;
  locale: string;
  timezone: string;
  visibility: WeddingVisibility;
  music_enabled: boolean;
} & Timestamps;

type ThemeRow = { wedding_id: string; tokens: Json } & Timestamps;

type SectionRow = {
  id: string;
  wedding_id: string;
  type: string;
  enabled: boolean;
  sort_order: number | null;
  content: Json;
} & Timestamps;

type EventRow = {
  id: string;
  wedding_id: string;
  kind: EventKind;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  venue_name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  description: string | null;
  sort_order: number;
} & Timestamps;

type MediaRow = {
  id: string;
  wedding_id: string;
  kind: MediaKind;
  purpose: MediaPurpose;
  storage_path: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
};

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, { id: string; full_name?: string | null; avatar_url?: string | null }>;
      weddings: Table<
        WeddingRow,
        {
          owner_id: string;
          slug: string;
          partner_one_name: string;
          partner_two_name: string;
          wedding_date?: string | null;
          template_id?: string;
        },
        {
          slug?: string;
          partner_one_name?: string;
          partner_two_name?: string;
          wedding_date?: string | null;
          template_id?: string;
          status?: WeddingStatus;
        }
      >;
      wedding_members: Table<MemberRow, { wedding_id: string; user_id: string; role: MemberRole }>;
      wedding_settings: Table<
        SettingsRow,
        { wedding_id: string },
        { locale?: string; timezone?: string; visibility?: WeddingVisibility; music_enabled?: boolean }
      >;
      wedding_themes: Table<ThemeRow, { wedding_id: string }, { tokens?: Json }>;
      wedding_sections: Table<
        SectionRow,
        { wedding_id: string; type: string; enabled?: boolean; sort_order?: number | null; content?: Json }
      >;
      events: Table<
        EventRow,
        Partial<Omit<EventRow, "id" | "wedding_id" | "created_at" | "updated_at">> & { wedding_id: string }
      >;
      media: Table<
        MediaRow,
        {
          wedding_id: string;
          kind: MediaKind;
          purpose: MediaPurpose;
          storage_path: string;
          alt_text?: string;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
        }
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      get_public_invitation: { Args: { p_slug: string }; Returns: Json };
      can_edit_wedding: { Args: { p_wedding_id: string }; Returns: boolean };
      can_view_wedding: { Args: { p_wedding_id: string }; Returns: boolean };
    };
    Enums: {
      wedding_status: WeddingStatus;
      wedding_visibility: WeddingVisibility;
      member_role: MemberRole;
      event_kind: EventKind;
      media_kind: MediaKind;
      media_purpose: MediaPurpose;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
