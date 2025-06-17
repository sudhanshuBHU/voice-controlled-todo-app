export interface Todo {
  id: string;
  intent: 'AddTodo' | 'DeleteTodo' | 'UpdateTodo' | 'MarkComplete';
  task: string;
  time: string | null;
  createdAt: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  deleteIndex: number | null;
  updateIndex: number | null;
  previousTask?: string | null;
}