import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set in environment variables');
}

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default gemini;
