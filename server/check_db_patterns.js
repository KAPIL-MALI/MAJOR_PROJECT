import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const defaults = [
  'Array Manipulation / Two Pointers / Sliding Window',
  'Dynamic Programming / Memoization',
  'Tree Traversal (DFS / BFS)',
  'String Manipulation / Sliding Window',
  'Graph Traversal (BFS/DFS)',
  'Core Algorithmic Concept'
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const problems = await Problem.find({});
    
    let defaultCount = 0;
    let customCount = 0;
    const defaultProblemsList = [];
    const customProblemsList = [];

    for (const p of problems) {
      const pattern = p.pattern || '';
      let isDefault = false;
      for (const d of defaults) {
        if (pattern.includes(d)) {
          isDefault = true;
          break;
        }
      }
      if (isDefault || !pattern) {
        defaultCount++;
        defaultProblemsList.push({ title: p.title, slug: p.slug });
      } else {
        customCount++;
        customProblemsList.push({ title: p.title, slug: p.slug });
      }
    }

    console.log(`Total problems in DB: ${problems.length}`);
    console.log(`Custom specific patterns: ${customCount}`);
    console.log(`Default generic patterns: ${defaultCount}`);
    
    console.log('\n=== LIST OF PROBLEMS WITH DEFAULT GENERIC PATTERNS ===');
    defaultProblemsList.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.title} (${p.slug})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
