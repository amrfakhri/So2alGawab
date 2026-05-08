export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          id: string;
          list_id: string;
          name: string;
          sort_order: number;
        };
      };
      game_settings: {
        Row: {
          button_click: string | null;
          class: string | null;
          layout_template: number | null;
          points: number;
          question_id: string;
          sort_order: number;
          status: 'active' | 'inactive';
          team_index: number | null;
        };
      };
      lists: {
        Row: {
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
        };
      };
      question_media: {
        Row: {
          created_at: string;
          id: string;
          media_type: 'image' | 'video' | 'audio';
          media_url: string;
          question_id: string;
          sort_order: number;
        };
      };
      question_metadata: {
        Row: {
          hints: Json;
          notes: Json;
          question_id: string;
        };
      };
      questions: {
        Row: {
          category_id: string | null;
          correct_answer: string | null;
          created_at: string;
          deleted_at: string | null;
          id: string;
          list_id: string;
          question: string;
          updated_at: string;
        };
      };
    };
  };
};

