export interface Post {
  id: string;
  network_key: string;
  type: 'text' | 'file';
  content: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}