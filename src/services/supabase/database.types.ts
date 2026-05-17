export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type GameSessionRow = {
  id: string;
  session_code: string;
  current_question: string | null;
  current_category: string | null;
  current_phase: string | null;
  current_media_url: string | null;
  current_media_type: string | null;
  current_answer: string | null;
  reveal_answer: boolean;
  question_points: number | null;
  timer_duration_ms: number | null;
  timer_started_at: string | null;
  timer_running: boolean;
  media_playing: boolean;
  team1_score: number;
  team2_score: number;
  team1_lifelines: Json | null;
  team2_lifelines: Json | null;
  created_at: string;
  updated_at: string;
};

type TvDeviceRow = {
  id: string;
  pairing_code: string;
  game_session_id: string | null;
  status: 'waiting' | 'connected';
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      categories: Table<{
        created_at: string;
        id: string;
        image_path: string | null;
        list_id: string;
        name: string;
        sort_order: number;
      }>;
      game_sessions: Table<
        GameSessionRow,
        Partial<GameSessionRow> & Pick<GameSessionRow, 'session_code'>,
        Partial<GameSessionRow>
      >;
      game_settings: Table<{
        button_click: string | null;
        class: string | null;
        layout_template: number | null;
        points: number;
        question_id: string;
        sort_order: number;
        status: 'active' | 'inactive';
        team_index: number | null;
      }>;
      lists: Table<{
        created_at: string;
        id: string;
        title: string;
        updated_at: string;
      }>;
      question_media: Table<{
        created_at: string;
        id: string;
        media_type: 'image' | 'video' | 'audio';
        media_url: string;
        question_id: string;
        sort_order: number;
      }>;
      question_metadata: Table<{
        hints: Json;
        notes: Json;
        question_id: string;
      }>;
      questions: Table<{
        category_id: string | null;
        correct_answer: string | null;
        created_at: string;
        deleted_at: string | null;
        id: string;
        list_id: string;
        question: string;
        updated_at: string;
      }>;
      tv_devices: Table<
        TvDeviceRow,
        Partial<TvDeviceRow> & Pick<TvDeviceRow, 'pairing_code'>,
        Partial<TvDeviceRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
