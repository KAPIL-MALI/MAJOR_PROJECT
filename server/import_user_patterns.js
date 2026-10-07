import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

function parsePatterns(text) {
  const chunks = text.split('🟦');
  const results = [];
  
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i].trim();
    if (!chunk) continue;
    
    // The first line contains the number and title, e.g., "1. Best Time to Buy and Sell Stock"
    const lines = chunk.split('\n');
    let titleLine = lines[0].trim();
    
    // Remove the number part "1. ", "49. "
    const titleMatch = titleLine.match(/^\d+\.\s+(.*)$/);
    let title = titleLine;
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    // The rest of the chunk is the pattern
    const pattern = lines.slice(1).join('\n').trim();
    
    results.push({ title, pattern });
  }
  
  return results;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');
    
    const text = fs.readFileSync('user_patterns.txt', 'utf8');
    const parsedData = parsePatterns(text);
    console.log(`Parsed ${parsedData.length} patterns from text file.`);
    
    let count = 0;
    for (const data of parsedData) {
      // Find the problem by matching the exact title (case-insensitive for safety, or regex)
      // Since Leetcode titles might have slight differences, try an exact match first.
      let p = await Problem.findOne({ title: data.title });
      
      if (!p) {
        // Fallback: try substring match if exact fails
        p = await Problem.findOne({ title: { $regex: data.title.split(' ')[0], $options: 'i' } });
      }
      
      if (p) {
        // Only update if we matched it
        p.pattern = data.pattern;
        await p.save();
        console.log(`Updated pattern for: ${p.title}`);
        count++;
      } else {
        console.log(`Could not find DB match for title: "${data.title}"`);
      }
    }
    
    console.log(`Successfully updated ${count} problems with the user's provided patterns!`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
