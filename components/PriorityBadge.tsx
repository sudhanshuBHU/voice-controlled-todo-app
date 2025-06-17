import { Todo } from "@/types/Todo";

// priority badge component

export const PriorityBadge = ({ priority }: { priority: Todo['priority'] }) => {
  const priorityStyles = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityStyles[priority]}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};