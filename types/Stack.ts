import { Todo } from './Todo';
export interface Stack{
    event: 'AddTodo' | 'DeleteTodo' | 'UpdateTodo' | 'MarkComplete';
    todo?: Todo;
    prev?: Todo;
}