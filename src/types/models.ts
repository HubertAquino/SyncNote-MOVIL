export type ID = string;

export interface Note {
  id: ID;
  title: string;
  content: string;
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
  tags?: string[];
}

export type TaskStatus = 'pending' | 'done' | 'archived';

export interface Task {
  id: ID;
  title: string;
  description?: string;
  dueAt?: number; // epoch ms
  remindAt?: number; // epoch ms
  priority?: 0 | 1 | 2; // 0 low, 1 normal, 2 high
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  noteId?: ID; // optional link to a note
}
