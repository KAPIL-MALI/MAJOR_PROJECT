import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, reply with 'Success' if you read this.");
      console.log(`Model ${modelName} response:`, result.response.text().trim());
      break; // Stop if success
    } catch (e) {
      console.error(`Model ${modelName} failed:`, e.message);
    }
  }
}

test();
