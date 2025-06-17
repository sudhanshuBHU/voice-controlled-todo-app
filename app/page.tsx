'use client';

import { useEffect, useRef, useState } from 'react';
import speak from '@/utils/speak';
import callGemini from '@/utils/callGemini';
import animation from '@/public/Animation - 1750157507859.gif';
import Image from 'next/image';

export default function Home() {
  const [log, setLog] = useState<string[]>([]);
  const [todos, setTodos] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('todos');
    if (stored) setTodos(JSON.parse(stored));
    const darkModeStored = localStorage.getItem('darkMode');
    if (darkModeStored) setDarkMode(JSON.parse(darkModeStored));
    addLog('📝 Loaded saved todos and dark mode preference.');
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };


  const updateTodos = (intent: string, task: string) => {
    if (!task) return;
    if (intent === 'AddTodo') {
      setTodos((prev) => [...prev, task]);
    } else if (intent === 'DeleteTodo') {
      setTodos((prev) => prev.filter((t) => t.toLowerCase() !== task.toLowerCase()));
    }
  };


  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      addLog(`🗣 "${transcript}"`);
      const data = await callGemini(transcript);
      // console.log('Parsed Data:', JSON.parse(data.candidates[0].content.parts[0].text));
      console.log('Parsed Data:', JSON.parse(data.candidates[0].content.parts[0].text.replaceAll('`', '').replace('json', '')));

      // if (!data.intent || !data.task) {
      //   speak('I did not understand that. Please try again.');
      //   return;
      // }
      // addLog(`🤖 Intent: ${data.intent} | Task: ${data.task}`);
      // updateTodos(data.intent, data.task);
      // speak(`Okay, I will ${data.intent === 'AddTodo' ? 'add' : data.intent === 'DeleteTodo' ? 'delete' : 'update'} the task: ${data.task}`);
    };

    recognition.onerror = (e: any) => addLog(`❌ STT Error: ${e.error}`);
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
        <button
          className="ml-4 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
          onClick={() => {
            setDarkMode(!darkMode);
            addLog(`🌗 Dark mode ${darkMode ? 'disabled' : 'enabled'}`);
            speak(`Dark mode ${darkMode ? 'disabled' : 'enabled'}`);
            localStorage.setItem('darkMode', JSON.stringify(!darkMode));
          }
          }
          aria-label="Toggle dark mode"
        >
          🌙
        </button>
      </div>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        <button
          onClick={handleClickAndSay}
          disabled={isListening}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Click & Say
          </span>
        </button>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">📝 To-Do List</h2>
          {todos.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500">No tasks added yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {todos.map((todo, i) => <li key={i} className="dark:text-gray-200">{todo}</li>)}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">📜 Logs</h2>
          <div className="h-64 overflow-y-auto space-y-1">
            {log.map((l, i) => (<div key={i} className="text-sm dark:text-gray-300">• {l}</div>))}
          </div>
        </div>
      </div>
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
