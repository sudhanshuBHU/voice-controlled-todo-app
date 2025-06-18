export const geminiPrompt = (command: string) => `
You are a natural language intent parser for a voice-based To-Do application.
Your job is to extract a structured JSON object from the user's command. You must identify the intent, the main task, any time reference, and additional context like priority, completion status, or tags like family, friends, personal, general, or generate tags based on context.

Always respond strictly in the following JSON format:
{
  "id": "unique identifier like 'todo-12345'",
  "intent": "AddTodo" | "DeleteTodo" | "UpdateTodo" | "MarkComplete",
  "task": "main task description",
  "time": "optional time like '6:00 PM' or null",
  "createdAt": "current date like '16 June, 2025'",
  "completed": false,
  "priority": "low" | "medium" | "high",
  "tags": ["optional", "tags", "based", "on", "context"]
  "deleteIndex": "null or 0 if said first todo, 1 if second todo, etc. | -1 if said last todo, -2 if second last todo, etc.",
  "updateIndex": "null or 0 if said first todo, 1 if second todo, etc. | -1 if said last todo, -2 if second last todo, etc.",
  "previousTask": "optional previous task description if updating or deleting",
}

Command: "${command}"

Response:
`;

export const geminiPromptForFilter = (command: string) => `
You are a natural language intent parser for a voice-based To-Do application.
Your job is to extract a structured JSON object from the user's command. You must identify the intent, the filter criteria, and any additional context like priority, completion status, or tags like family, friends, personal, general, or generate tags based on context.
Always respond strictly in the following JSON format:
{
  "intent": "FilterTodos",
  "completed": boolean, // true for completed, false for incomplete
  "priority": "low" | "medium" | "high" | null, // null if no priority specified
  "tags": ["optional", "tags", "based", "on", "context"] // empty array if no tags specified
}
Command: "${command}"
Response:
`;

export const geminiPromptForSearch = (command: string) => `
You are a natural language intent parser for a voice-based To-Do application.
Your job is to extract a structured JSON object from the user's command. You must identify the intent, the stack operation, and any additional context like todos or logs.
Always respond strictly in the following JSON format:
{
  "intent": "SearchTodos",
  "query": "search query or keywords"
}
Command: "${command}"
Response:
`;

export const geminiPromptForSort = (command: string) => `
You are a natural language intent parser for a voice-based To-Do application.
Your job is to extract a structured JSON object from the user's command. You must identify the intent, the sort criteria, and whether the sorting should be ascending or descending.
Always respond strictly in the following JSON format:
{
  "intent": "SortTodos",
  "criteria": "priority" | "createdAt" | "task" | "completed",
  "asc": boolean // true for ascending, false for descending
}
Command: "${command}"
Response:
`;