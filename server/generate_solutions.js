import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const promptTemplate = (problemTitle, problemDescription, starterCode) => `
You are an expert algorithms teacher.
Given the LeetCode-style problem below, generate:
1. A concise, one-sentence summary of the optimal approach.
2. A detailed explanation in Markdown format, which MUST include:
   - Clear analysis of the optimal approach.
   - Time Complexity and Space Complexity.
   - Well-commented, complete solution code in C++, Java, and JavaScript that matches the starter code structure.

--- PROBLEM DATA ---
Title: ${problemTitle}
Description:
${problemDescription}

Starter Code:
${JSON.stringify(starterCode, null, 2)}
--- END PROBLEM DATA ---

You MUST respond with a valid JSON object matching this structure:
{
  "solution": "Concise one-sentence summary of the optimal approach.",
  "solutionExplanation": "Detailed markdown explanation containing C++, Java, and JavaScript code blocks and complexity analysis."
}
Return ONLY the raw JSON object. Do not wrap it in markdown code blocks like \`\`\`json or \`\`\`.
`;

async function getModel() {
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Perform a light-weight test call to ensure availability
      await model.generateContent("test");
      console.log(`Using model: ${modelName}`);
      return model;
    } catch (e) {
      console.log(`Model ${modelName} failed or unavailable, trying next...`);
    }
  }
  throw new Error("No available Gemini models");
}

async function generateWithRetry(model, prompt, retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (e) {
      const isRateLimit = e.message.includes('429') || e.message.includes('Quota exceeded') || e.message.includes('Too Many Requests');
      if (isRateLimit && attempt < retries) {
        console.warn(`[429 Rate Limit] Attempt ${attempt}/${retries} failed. Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      } else {
        throw e;
      }
    }
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');
    const model = await getModel();

    // Find problems where solutionExplanation is empty or missing
    const problems = await Problem.find({
      $or: [
        { solutionExplanation: { $exists: false } },
        { solutionExplanation: '' }
      ]
    });

    console.log(`Found ${problems.length} problems without a detailed solution explanation.`);

    for (let i = 0; i < problems.length; i++) {
      const p = problems[i];
      console.log(`[${i + 1}/${problems.length}] Generating solution for: ${p.title}...`);
      try {
        const result = await generateWithRetry(model, promptTemplate(p.title, p.description, p.starterCode));
        let text = result.response.text().trim();
        
        // Strip markdown code block wrappers if present
        if (text.startsWith('```json')) {
          text = text.substring(7);
        } else if (text.startsWith('```')) {
          text = text.substring(3);
        }
        if (text.endsWith('```')) {
          text = text.substring(0, text.length - 3);
        }
        text = text.trim();

        const data = JSON.parse(text);
        p.solution = data.solution || p.solution;
        p.solutionExplanation = data.solutionExplanation;
        await p.save();
        console.log(`Successfully saved solution for: ${p.title}`);
        
        // Respect API rate limits
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Failed generating solution for ${p.title}:`, e.message);
      }
    }
    console.log("Finished generating all solutions.");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
