import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

let ai: GoogleGenAI | null = null;

if (env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

const SYSTEM_PROMPT = `You are a friendly, encouraging, and highly knowledgeable English tutor for the BrainCards educational platform. 
Your goal is to help users improve their English language skills. 
Keep your responses concise, easy to understand, and educational.
If the user makes a grammatical error in their prompt, gently correct them while answering their question.
Use emojis occasionally to keep the tone friendly. 
Do not use complicated Markdown formatting, stick to simple paragraphs, bullet points, and basic bold/italic text.
You are chatting with a student. Always respond in a helpful manner.`;

export async function generateChatResponse(history: { role: 'user' | 'model'; content: string }[], newMessage: string) {
  if (!ai) {
    throw new Error('Gemini API key is not configured on the server.');
  }

  // Format history for Gemini
  // Gemini genai SDK expects contents array: { role: 'user' | 'model', parts: [{ text: '...' }] }
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  // Append the new message
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }],
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    throw new Error('Failed to generate AI response. Please try again later.');
  }
}
