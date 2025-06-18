
export interface Filter{
    intent: 'FilterTodos';
    completed: boolean;
    priority: 'low' | 'medium' | 'high' | null; 
    tags: string[];
}