import { Todo } from '../types/Todo';

export function sortTodos(todos: Todo[], criteria: string, asc: boolean = true): Todo[] {
    return todos.sort((a, b) => {
        let result = 0;
        if (criteria === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            result = priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (criteria === 'createdAt') {
            result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (criteria === 'task') {
            result = a.task.localeCompare(b.task);
        } else {
            result = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
        }
        return asc ? result : -result;
    });
}
