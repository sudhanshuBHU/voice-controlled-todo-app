
export interface Sort {
  intent: 'SortTodos';
  criteria: string;
  asc: boolean; // true for ascending, false for descending
}