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
  /** Set by staff/payments only (not client-writable): live until, or null = no limit yet. */
  active_until: string | null;
  deactivated_at: string | null;
  deactivated_reason: string | null;
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
  style: Json;
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

export type GuestRow = {
  id: string;
  wedding_id: string;
  name: string;
  greeting: string | null;
  message: string | null;
  groups: string[];
  max_party: number | null;
  token: string;
  open_count: number;
  last_opened_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReplyRow = {
  id: string;
  wedding_id: string;
  guest_id: string | null;
  name: string;
  attending: boolean;
  party_size: number;
  note: string | null;
  answers: Json;
  created_at: string;
  updated_at: string;
};

export type WishRow = {
  id: string;
  wedding_id: string;
  name: string;
  message: string;
  hidden: boolean;
  created_at: string;
};

/** The columns couples may read of their own orders (staff use admin_* functions). */
export type OrderRow = {
  id: string;
  number: number;
  confirmation: string;
  wedding_id: string | null;
  amount: number;
  currency: string;
  method: string;
  months: number;
  status: "pending" | "paid" | "refunded" | "cancelled";
  kind: "new" | "renewal";
  created_at: string;
  paid_at: string | null;
  refunded_at: string | null;
  cancelled_at: string | null;
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
        { wedding_id: string; type: string; enabled?: boolean; sort_order?: number | null; content?: Json; style?: Json }
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
      guests: Table<
        GuestRow,
        { wedding_id: string; name: string; greeting?: string | null; message?: string | null; groups?: string[]; max_party?: number | null },
        { name?: string; greeting?: string | null; message?: string | null; groups?: string[]; max_party?: number | null }
      >;
      replies: Table<
        ReplyRow,
        { wedding_id: string; guest_id?: string | null; name: string; attending: boolean; party_size?: number; note?: string | null; answers?: Json },
        { attending?: boolean; party_size?: number; note?: string | null; answers?: Json }
      >;
      wishes: Table<WishRow, never, { hidden?: boolean }>;
      orders: Table<OrderRow, never, never>;
    };
    Views: { [_ in never]: never };
    Functions: {
      get_public_invitation: { Args: { p_slug: string }; Returns: Json };
      create_wedding_from_draft: { Args: { p_draft: Json }; Returns: string };
      can_edit_wedding: { Args: { p_wedding_id: string }; Returns: boolean };
      can_view_wedding: { Args: { p_wedding_id: string }; Returns: boolean };
      get_guest: { Args: { p_slug: string; p_token: string }; Returns: Json };
      submit_reply: {
        Args: { p_slug: string; p_token: string | null; p_name: string; p_attending: boolean; p_party: number; p_note: string | null; p_answers: Json };
        Returns: Json;
      };
      submit_wish: { Args: { p_slug: string; p_name: string; p_message: string }; Returns: Json };
      get_public_wishes: { Args: { p_slug: string }; Returns: Json };
      admin_me: { Args: Record<string, never>; Returns: Json };
      admin_overview: { Args: { p_days: number }; Returns: Json };
      admin_list_weddings: { Args: { p_filter: string; p_search: string | null; p_limit: number; p_offset: number }; Returns: Json };
      admin_list_sales: { Args: { p_search: string | null; p_limit: number; p_offset: number }; Returns: Json };
      admin_record_sale: {
        Args: { p_wedding: string; p_amount: number; p_method: string; p_reference: string | null; p_note: string | null; p_months: number; p_publish: boolean };
        Returns: Json;
      };
      admin_refund: { Args: { p_order: string; p_deactivate: boolean }; Returns: Json };
      admin_set_deactivated: { Args: { p_wedding: string; p_off: boolean; p_reason: string | null }; Returns: Json };
      admin_extend: { Args: { p_wedding: string; p_days: number }; Returns: Json };
      admin_list_staff: { Args: Record<string, never>; Returns: Json };
      admin_set_staff: { Args: { p_email: string; p_role: string | null }; Returns: Json };
      admin_activity: { Args: { p_limit: number }; Returns: Json };
      request_publish: { Args: { p_wedding: string; p_phone: string; p_method: string }; Returns: Json };
      my_publish_state: { Args: { p_wedding: string }; Returns: Json };
      cancel_my_order: { Args: { p_order: string }; Returns: Json };
      admin_list_orders: { Args: { p_tab: string; p_search: string | null; p_limit: number; p_offset: number }; Returns: Json };
      admin_get_order: { Args: { p_order: string }; Returns: Json };
      admin_mark_paid: { Args: { p_order: string; p_amount: number | null; p_method: string | null; p_reference: string | null }; Returns: Json };
      admin_cancel_order: { Args: { p_order: string; p_reason: string | null }; Returns: Json };
      admin_order_note: { Args: { p_order: string; p_text: string }; Returns: Json };
      admin_set_order_tags: { Args: { p_order: string; p_tags: string[] }; Returns: Json };
      admin_archive_order: { Args: { p_order: string; p_archived: boolean }; Returns: Json };
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
