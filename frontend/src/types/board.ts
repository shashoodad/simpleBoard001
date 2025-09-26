export type ViewMode = 'card' | 'list';

export interface BoardSummary {
  id: number;
  name: string;
  description?: string;
  visibility: 'basic' | 'premium' | 'admin';
}

export interface PostSummary {
  id: number;
  title: string;
  content: string;
  view_type: ViewMode;
  author_name?: string | null;
  created_at: string;
}
