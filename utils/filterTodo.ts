import { Todo } from '../types/Todo';
import { Filter } from '../types/Filter';

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
    return todos.filter(todo => {
        const matchesCompleted = filter.completed === null || todo.completed === filter.completed;
        const matchesPriority = !filter.priority || todo.priority === filter.priority;
        const matchesTags = filter.tags.length === 0 || (todo.tags && todo.tags.some(tag => filter.tags.includes(tag)));
        return matchesCompleted && matchesPriority && matchesTags;
    });
}