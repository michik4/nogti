export interface Upload {
  id: string;
  title: string;
  image: string;
  type: 'photo' | 'video';
  likes: number;
  date: string;
} 