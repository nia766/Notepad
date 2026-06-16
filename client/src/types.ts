export interface Notebook {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  note_count: number;
}

export interface Note {
  id: string;
  notebook_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags: string | null;
}

export interface Tag {
  id: string;
  name: string;
  note_count: number;
}
