
import { Clock, CalendarDays, Tag } from 'lucide-react';
import { Todo } from '@/types/Todo';
import { PriorityBadge } from './PriorityBadge';


export const TodoItem = ({ todo }: { todo: Todo }) => {
  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-lg shadow-sm transition-all
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        ${todo.completed ? 'opacity-60' : 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'}
      `}
    >
      {/* Checkbox */}
      {/* <input
        type="checkbox"
        checked={todo.completed}
        // onchange handler will be added later : later task
        className="form-checkbox mt-1 h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500/50"
      /> */}

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Task and Priority */}
        <div className="flex justify-between items-start">
          <p
            className={`
              font-semibold text-lg text-gray-800 dark:text-gray-100
              ${todo.completed ? 'line-through' : ''}
            `}
          >
            {todo.task}
          </p>
          <PriorityBadge priority={todo.priority} />
        </div>

        {/* Metadata: Time and Creation Date */}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={14} />
            <span>{todo.createdAt}</span>
          </div>
          {todo.time && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{todo.time}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {todo.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {todo.tags.map((tag) => (
              <div key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                <Tag size={12} />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};