import { geminiPrompt } from '@/utils/geminiPrompt';
import { geminiPromptForFilter, geminiPromptForSearch, geminiPromptForSort } from '@/utils/geminiPrompt';

async function callGemini(text: string, type: 'command' | 'filter' | 'search' | 'sort') {
    let prompt = '';
    switch (type) {
        case 'command': prompt = geminiPrompt(text); break;
        case 'filter': prompt = geminiPromptForFilter(text); break;
        case 'search': prompt = geminiPromptForSearch(text); break;
        case 'sort': prompt = geminiPromptForSort(text); break;
    }
    // const prompt = geminiPrompt(text);
    const body = {
        contents: [{
            "parts": [{ "text": prompt }]
        }]
    };

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("API key is not defined");
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    return await response.json()
}

export default callGemini;