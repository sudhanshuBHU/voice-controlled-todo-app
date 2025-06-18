import { Todo } from '../types/Todo';

export function searchTodos(todos: Todo[], query: string): Todo[] {
    if (!query) return todos;
    const lowerQuery = query.toLowerCase();
    return todos.filter(todo => {
        return todo.task.toLowerCase().includes(lowerQuery) ||
            (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
            (todo.createdAt && todo.createdAt.toLowerCase().includes(lowerQuery)) ||
            (todo.priority && todo.priority.toLowerCase().includes(lowerQuery));
    });
}