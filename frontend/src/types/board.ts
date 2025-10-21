export type ViewMode = 'card' | 'list';

export interface BoardSummary {
  id: number;
  name: string;
  description?: string;
  visibility: 'basic' | 'premium' | 'admin';
}

export interface PostSummary {
  id: number;
  board: number;
  board_name?: string | null;
  title: string;
  content: string;
  view_type: ViewMode;
  author_name?: string | null;
  author_email?: string | null;
  created_at: string;
  updated_at?: string;
}

