import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const problems = await Problem.find({ 
    pattern: { $regex: /Pattern: Core Algorithmic Concept|Pattern: Array Manipulation|Pattern: Dynamic Programming|Pattern: Tree Traversal|Pattern: String Manipulation|Pattern: Graph Traversal/ } 
  });
  console.log(problems.map(p => p.slug).join('\n'));
  process.exit(0);
}
run();
