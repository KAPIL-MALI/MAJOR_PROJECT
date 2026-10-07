import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const promptTemplate = (problemTitle, problemDescription) => `
You are an expert algorithms teacher.
Generate a MASSIVE "Pattern" learning takeaway for the following LeetCode problem in Markdown format.
It must be roughly 1 to 2 pages long of deep theoretical explanation, breaking down the brute force bottlenecks, the optimal data structure, the time complexities, and the overarching algorithmic philosophy.
Do not provide just a short summary. Go incredibly deep into the algorithmic pattern, providing a masterclass on how to think about this class of problems.

Structure it loosely with these headers, but expand massively on each:
- **The Core Challenge (Brute Force Analysis)**
- **The Optimal Solution & Why It Works**
- **Execution and Mechanics**
- **Analysis of Optimization (Time/Space)**
- 🔥 **The Reusable Takeaway**

--- PROBLEM DATA ---
Title: ${problemTitle}
Description:
${problemDescription}
--- END PROBLEM DATA ---

Generate the markdown response directly with no additional conversational text.
`;

async function getModel() {
  const models = ['gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("test");
      return model;
    } catch (e) {
      console.log('Model ' + modelName + ' failed, trying next...');
    }
  }
  throw new Error("No available Gemini models");
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');
    const model = await getModel();

    const problems = await Problem.find({ $or: [{ pattern: { $exists: false } }, { pattern: '' }] });
    console.log('Found ' + problems.length + ' problems without a pattern.');

    for (const p of problems) {
      console.log('Generating pattern for: ' + p.title + '...');
      try {
        const result = await model.generateContent(promptTemplate(p.title, p.description));
        const markdown = result.response.text().trim();
        p.pattern = markdown;
        await p.save();
        console.log('Successfully saved pattern for: ' + p.title);
        // Rate limit protection
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error('Failed generating for ' + p.title + ':', e.message);
      }
    }
    console.log("Finished generating all patterns.");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
