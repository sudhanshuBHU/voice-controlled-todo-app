import { Todo } from './Todo';

export interface Stack{
    event: 'AddTodo' | 'DeleteTodo' | 'UpdateTodo' | 'MarkComplete' | 'ClearLogs' | 'DeleteAllTodos';
    todo?: Todo;
    prev?: Todo;
    deletedAllLogs?: string[];
    deletedAllTodos?: Todo[];
}