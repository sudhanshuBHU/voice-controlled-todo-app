'use client';

import { useEffect, useRef, useState } from 'react';
import speak from '@/utils/speak';
import callGemini from '@/utils/callGemini';
import animation from '@/public/Animation - 1750157507859.gif';
import Image from 'next/image';
import { TodoItem } from '@/components/TodoItem';
import { Todo } from '@/types/Todo';
import { Stack } from '@/types/Stack';
import { Search } from '@/types/Search';
import { searchTodos } from '@/utils/searchTodo';
import { filterTodos } from '@/utils/filterTodo';
import { sortTodos } from '@/utils/sortTodo';
import { Filter } from '@/types/Filter';
import { Sort } from '@/types/Sort';


export default function Home() {
  const [log, setLog] = useState<string[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [stack, setStack] = useState<Stack[]>([]);
  const [working, setWorking] = useState(false);
  const [backupTodos, setBackupTodos] = useState<Todo[]>([]);

  // Load saved todos and dark mode preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('voiceTodos');
    if (stored) setTodos(JSON.parse(stored));
    const darkModeStored = localStorage.getItem('darkMode');
    if (darkModeStored) setDarkMode(JSON.parse(darkModeStored));
    const stackStored = localStorage.getItem('voiceStack');
    if (stackStored) setStack(JSON.parse(stackStored));
    addLog('📝 Loaded saved todos and dark mode preference.');
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('voiceTodos', JSON.stringify(todos));
  }, [todos]);

  // update stack whenever stack changes
  useEffect(() => {
    localStorage.setItem('voiceStack', JSON.stringify(stack));
  }, [stack]);

  // update dark mode preference in localStorage
  useEffect(() => {
    addLog(`🌗 Dark mode ${!darkMode ? 'disabled' : 'enabled'}`);
    speak(`Dark mode ${!darkMode ? 'disabled' : 'enabled'}`);
    // localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  //backup todos for search and filter
  useEffect(() => {
    localStorage.setItem('voiceBackupTodos', JSON.stringify(backupTodos));
  }, [backupTodos]);

  // handle space button for activating voice recognition
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !isListening) {
        event.preventDefault(); // Prevent scrolling when space is pressed
        setIsListening(true);
        addLog('🎤 Starting voice recognition...');
        speak('I\'m Listening.');
        startRecognition();
        setIsListening(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const handleActions = async (intendedTodo: Todo) => {

    // add todo
    if (intendedTodo.intent === 'AddTodo') {

      setTodos([...todos, intendedTodo]);
      addLog(`✅ Added task: "${intendedTodo.task}"`);
      speak(`Added task: ${intendedTodo.task}`);
      setStack([...stack, { event: 'AddTodo', todo: intendedTodo }]);
      setBackupTodos([...todos, intendedTodo]);
      return;
    } else if (intendedTodo.intent === 'DeleteTodo') {  // delete todo
      // console.log("deleting todo", intendedTodo);

      // if no index is provided, then delete the task with the same name
      if (intendedTodo.deleteIndex === null) {
        const tempTodo = todos.find(todo => todo.task.toLocaleLowerCase() === intendedTodo.task.toLocaleLowerCase());
        if (!tempTodo) {
          speak(`Task "${intendedTodo.task}" not found.`);
          addLog(`❌ Task "${intendedTodo.task}" not found.`);
          return;
        }

        const temp = todos.filter((todo) => todo.task.toLocaleLowerCase() !== intendedTodo.task.toLocaleLowerCase());
        setTodos(temp);
        setBackupTodos(temp);
        addLog(`🗑️ Deleted task: "${intendedTodo.task}"`);
        speak(`Deleted task: ${intendedTodo.task}`);

        setStack([...stack, { event: 'DeleteTodo', todo: intendedTodo }]);

        return;
      }
      // if index is provided, then delete the task at that index
      if (todos.length === 0) return speak('No tasks to delete.');
      if (intendedTodo.deleteIndex < 0 || intendedTodo.deleteIndex >= todos.length) {
        speak('Invalid task number to delete.');
        return;
      }

      if (intendedTodo.deleteIndex >= todos.length) return speak('Try again');

      // if index is proper then delete the task at that index
      if (intendedTodo.deleteIndex < 0) {
        intendedTodo.deleteIndex = todos.length + intendedTodo.deleteIndex;
      }

      setTodos(todos.filter((_, index) => index !== intendedTodo.deleteIndex));
      setBackupTodos(todos.filter((_, index) => index !== intendedTodo.deleteIndex));
      addLog(`🗑️ Deleted task: "${todos[intendedTodo.deleteIndex].task}"`);
      speak(`Deleted task: ${todos[intendedTodo.deleteIndex].task}`);

      setStack([...stack, { event: 'DeleteTodo', todo: intendedTodo }]);

      return;
    } else if (intendedTodo.intent === 'UpdateTodo') { // update todo

      // console.log("updating todo", intendedTodo);

      if (todos.length === 0) return speak('No tasks to update.');

      // if no idex is provided, then update the task with the same name
      if (intendedTodo.updateIndex === null) {
        const tempTodo = todos.find(todo => todo.task.toLocaleLowerCase() === intendedTodo.previousTask?.toLocaleLowerCase());
        if (!tempTodo) {
          speak(`Task "${intendedTodo.task}" not found.`);
          addLog(`❌ Task "${intendedTodo.task}" not found.`);
          return;
        }

        const temp = todos.filter((todo) => todo.task.toLocaleLowerCase() !== intendedTodo.previousTask?.toLocaleLowerCase());
        setTodos([...temp, intendedTodo]);
        setBackupTodos([...temp, intendedTodo]);
        addLog(`✅ Updated task: "${intendedTodo.task}"`);
        speak(`Updated task: ${intendedTodo.task}`);
        setStack([...stack, { event: 'UpdateTodo', todo: intendedTodo, prev: tempTodo }]);

        return;
      }

      if (intendedTodo.updateIndex >= todos.length) {
        speak('Invalid task number to update.');
        return;
      }

      if (intendedTodo.updateIndex >= todos.length) return speak('Try again');

      // if index is proper then update the task at that index
      if (intendedTodo.updateIndex < 0) {
        intendedTodo.updateIndex = todos.length + intendedTodo.updateIndex;
      }
      setStack([...stack, { event: 'UpdateTodo', todo: intendedTodo, prev: todos[intendedTodo.updateIndex] }]);
      const temp = todos.filter((_, index) => index !== intendedTodo.updateIndex);
      setTodos([...temp, intendedTodo]);
      setBackupTodos([...temp, intendedTodo]);
      addLog(`✏️ Updated task: "${intendedTodo.task}"`);
      speak(`Updated task: ${intendedTodo.task}`);

      return;
    }
  }

  const handleUndo = () => {
    if (stack.length === 0) {
      speak('No actions to undo.');
      return;
    }

    const lastAction = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    addLog(`🔄 Undoing last action: ${lastAction.event}`);
    speak(`Undoing last action: ${lastAction.event}`);

    if (lastAction.event === 'AddTodo') { // remove last added todo
      const lastTodo = lastAction.todo;
      if (!lastTodo) {
        speak('No todo to undo.');
        return;
      }
      setTodos(todos.filter(todo => todo.id !== lastTodo.id));
      addLog(`🗑️ Removed last added task: "${lastTodo.task}"`);
      speak(`Removed last added task: ${lastTodo.task}`);

      return;
    } else if (lastAction.event === 'DeleteTodo') { // restore last deleted todo
      const lastTodo = lastAction.todo;
      if (!lastTodo) {
        speak('No todo to undo.');
        return;
      }
      setTodos([...todos, lastTodo]);
      addLog(`✅ Restored deleted task: "${lastTodo.task}"`);
      speak(`Restored deleted task: ${lastTodo.task}`);

      return;
    } else if (lastAction.event === 'UpdateTodo') { // restore last updated todo
      const lastTodo = lastAction.todo;
      if (!lastTodo) {
        speak('No todo to undo.');
        return;
      }
      const prevTodo = lastAction.prev;
      if (!prevTodo) {
        speak('No previous state to restore.');
        return;
      }

      setTodos(todos.map(todo => todo.id === lastTodo.id ? prevTodo : todo));
      addLog(`✅ Restored previous state of task: "${prevTodo.task}"`);
      speak(`Restored previous state of task: ${prevTodo.task}`);
      return;

    } else if (lastAction.event === 'ClearLogs') { // restore last cleared logs
      const deletedLogs = lastAction.deletedAllLogs;
      if (!deletedLogs) {
        speak('No logs to restore.');
        return;
      }

      setLog(deletedLogs);
      addLog('✅ Restored cleared logs.');
      speak('Restored cleared logs.');

      return;
    } else if (lastAction.event === 'DeleteAllTodos') { // restore last cleared todos
      const deletedTodos = lastAction.deletedAllTodos;
      if (!deletedTodos) {
        speak('No todos to restore.');
        return;
      }
      setTodos(deletedTodos);
      addLog('✅ Restored cleared todos.');
      speak('Restored cleared todos.');
      return;
    }
  }

  const handleSearchTodos = (query: string) => {
    if (!query) {
      addLog('❌ No search query provided.');
      speak('No search query provided.');
      return;
    }
    const results = searchTodos(todos, query);
    if (results.length === 0) {
      addLog(`🔍 No tasks found for query: "${query}"`);
      speak(`No tasks found for query: ${query}`);
    } else {
      setBackupTodos(todos); // backup current todos before search
      addLog(`🔍 Found ${results.length} task(s) for query: "${query}"`);
      speak(`Found ${results.length} task(s) for query: ${query}`);
      setTodos(results);
    }

  }

  const handleViewAllTodos = () => {
    const temp = backupTodos || (localStorage.getItem('voiceBackupTodos') ? JSON.parse(localStorage.getItem('voiceBackupTodos') || '[]') : []);
    if (temp.length === 0) {
      addLog('❌ No todos to restore.');
      speak('No todos to restore.');
      return;
    }
    setTodos(temp);
    addLog('✅ Restored all todos from backup.');
    speak('Restored all todos from backup.');
  }

  const handleFilterTodos = (filter: Filter) => {
    const results = filterTodos(todos, filter);
    if (results.length === 0) {
      addLog(`🔍 No tasks found for this criteria.`);
      speak(`No tasks found for this criteria.`);
    } else {
      setBackupTodos(todos); // backup current todos before filter
      addLog(`🔍 Found ${results.length} task(s) for criteria.`);
      speak(`Found ${results.length} task(s) for criteria.`);
      setTodos(results);
    }
  }

  const handleSortTodos = (criteria: string, asc: boolean) => {
    const results = sortTodos(todos, criteria, asc);
    if (results.length === 0) {
      addLog(`🔍 No tasks found for this criteria.`);
      speak(`No tasks found for this criteria.`);
    } else {
      setBackupTodos(todos); // backup current todos before sort
      addLog(`🔍 Sorted tasks by ${criteria} in ${asc ? 'ascending' : 'descending'} order.`);
      speak(`Sorted tasks by ${criteria} in ${asc ? 'ascending' : 'descending'} order.`);
      setTodos(results);
    }
  }

  // Function to start speech recognition and handle voice commands
  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      setWorking(true);
      const transcript = event.results[0][0].transcript;
      addLog(`🗣 "${transcript}"`);

      // check if undo is requested
      if (transcript.toLowerCase().includes('undo')) {
        handleUndo();
        setWorking(false);
        return;
      }
      // dark mode toggle
      if (transcript.toLocaleLowerCase().includes('dark mode')) {
        setDarkMode(!darkMode);
        setWorking(false);
        return;
      }
      // clear logs
      if (transcript.toLocaleLowerCase().includes('clear logs') || transcript.toLocaleLowerCase().includes('delete logs') || transcript.toLocaleLowerCase().includes('clear all logs')) {
        setLog([]);
        addLog('🗑️ Cleared logs.');
        speak('Cleared logs.');
        setStack([...stack, { event: 'ClearLogs', deletedAllLogs: log }]);
        setWorking(false);
        return;
      }
      // clear all todos
      if (transcript.toLocaleLowerCase().includes('clear todos') || transcript.toLocaleLowerCase().includes('clear all todos')
        || transcript.toLocaleLowerCase().includes('delete all todos')
        || transcript.toLocaleLowerCase().includes('delete todos') || transcript.toLocaleLowerCase().includes('delete all tasks')
        || transcript.toLocaleLowerCase().includes('clear all tasks') || transcript.toLocaleLowerCase().includes('clear tasks')
        || transcript.toLocaleLowerCase().includes('delete all to do') || transcript.toLocaleLowerCase().includes('clear all to do') || transcript.toLocaleLowerCase().includes('clear to do')) {
        setTodos([]);
        addLog('🗑️ Cleared todos.');
        speak('Cleared todos.');
        setStack([...stack, { event: 'DeleteAllTodos', deletedAllTodos: todos }]);
        setWorking(false);
        return;
      }
      //  handle search request
      if (transcript.toLocaleLowerCase().includes('search') || transcript.toLocaleLowerCase().includes('find')) {
        const searchData = await callGemini(transcript, 'search');
        const searchQuery: Search = searchData.candidates[0].content.parts[0].text.replaceAll('`', '').replace('json', '');
        handleSearchTodos(searchQuery.query);
        setWorking(false);
        return;
      }

      //  handle filter request
      if (transcript.toLocaleLowerCase().includes('filter') || transcript.toLocaleLowerCase().includes('sort')) {
        const filterData = await callGemini(transcript, 'filter');
        const filterCriteria: Filter = JSON.parse(filterData.candidates[0].content.parts[0].text.replaceAll('`', '').replace('json', ''));
        handleFilterTodos(filterCriteria);
        setWorking(false);
        return;
      }

      //  handle sort request
      if (transcript.toLocaleLowerCase().includes('sort') || transcript.toLocaleLowerCase().includes('order')) {
        const sortData = await callGemini(transcript, 'sort');
        const sortCriteria: Sort = JSON.parse(sortData.candidates[0].content.parts[0].text.replaceAll('`', '').replace('json', ''));
        handleSortTodos(sortCriteria.criteria, sortCriteria.asc);
        setWorking(false);
        return;
      }

      //  handle view all todos request
      if (transcript.toLocaleLowerCase().includes('view all') || transcript.toLocaleLowerCase().includes('show all') || transcript.toLocaleLowerCase().includes('restore all')) {
        handleViewAllTodos();
        setWorking(false);
        return;
      }

      //  call Gemini API to parse the intent
      const data = await callGemini(transcript, 'command');
      const intendedTodo: Todo = JSON.parse(data.candidates[0].content.parts[0].text.replaceAll('`', '').replace('json', ''));
      // console.log('Parsed Data:', intendedTodo);
      setWorking(false);

      if (!intendedTodo.intent) {
        speak('Sorry, I did not understand that. Please try again.');
        return;
      }

      handleActions(intendedTodo);
    };

    recognition.onerror = (e) => addLog(`❌ STT Error: ${e.error}`);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleClickAndSay = () => {
    setIsListening(true);
    addLog('🎤 Starting voice recognition...');
    speak('I\'m Listening.');
    startRecognition();
    setIsListening(false);
  };

  return (
    <main className={`${darkMode ? 'dark' : ''} p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-1 dark:text-gray-200">🎙️ Voice Controlled To-Do List</h1>

        {/* dark mode button */}
        <button
          className="ml-4 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
          onClick={() => {
            setDarkMode(!darkMode);
          }
          }
          aria-label="Toggle dark mode"
        >
          🌙
        </button>
      </div>

      {/*  */}
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        <button
          onClick={handleClickAndSay}
          disabled={isListening}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
          <span className="text-xs relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            {working ? 'working...' : 'Click or Press Space to Speak'}
          </span>
        </button>
      </p>

      <div>
        <button
          onClick={handleViewAllTodos}
          disabled={isListening}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            All Todos
          </span>
        </button>
      </div>

      {/* Todo card container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">📝 To-Do List</h2>
          {todos.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">No tasks added yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {todos.map((todo, i) => <li key={i} className="dark:text-gray-200">
                <TodoItem todo={todo} />
              </li>)}
            </ul>
          )}
        </div>

        {/* logs to display */}
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">📜 Logs</h2>
          <ul className='list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300 text-sm'>
            {log.map((l, i) => (<li key={i}>{l}</li>))}

          </ul>
        </div>
      </div>

      {/* hints for using the app smoothly */}
      <div className=' bg-white dark:bg-gray-900 shadow-lg rounded-xl p-4 mt-8'>
        <div className=' mb-4'>
          <h4 className=" font-semibold mb-2 dark:text-gray-100">💡 Hints</h4>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300 text-sm">
            <li>Say <b>&quot;Add buy groceries&quot;</b> to add a new task.</li>
            <li>Say <b>&quot;Delete buy groceries&quot;</b> or <b>&quot;Delete task 1&quot;</b> to remove a task.</li>
            <li>Say <b>&quot;Update buy groceries to buy milk&quot;</b> or <b>&quot;Update task 1 to buy milk&quot;</b> to edit a task.</li>
            <li>Say <b>&quot;Undo&quot;</b> to revert your last action.</li>
            <li>Say <b>&quot;Search or find for milk&quot;</b> to search for todos containing milk.</li>
            <li>Say <b>&quot;Filter based on low, medium or high priority, etc.&quot;</b> to filter todos as required.</li>
            <li>Say <b>&quot;Sort in ascending order based on task, priority or date creation&quot;</b> to sort accordingly.</li>
            <li>Say <b>&quot;Clear todos&quot;</b> to remove all tasks.</li>
            <li>Say <b>&quot;Clear logs&quot;</b> to clear the log history.</li>
            <li>Say <b>&quot;Dark mode&quot;</b> to toggle dark/light theme.</li>
          </ul>
        </div>
      </div>

      {/* ai animation starts when listening starts*/}
      {
        isListening &&
        <div>
          <Image
            src={animation}
            alt="Loading animation"
            className="fixed bottom-0 left-0 right-0 flex justify-center items-center mx-auto"
            width={150}
            height={150}
          />
        </div>
      }
    </main>
  );
}
