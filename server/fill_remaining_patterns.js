import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const patternsByCategory = {
  'Arrays': `🧠 **Pattern: Array Manipulation / Two Pointers / Sliding Window**

The key idea is:
Iterate through the array efficiently, keeping track of necessary state (like pointers, sums, or hash maps) without redundant checks.

**What you learn from this problem**
- **Optimal Traversal** → Avoid O(n²) nested loops when possible.
- **State Management** → Keep track of elements you've already seen.
- **Space-Time Tradeoff** → Use extra space (Hash Maps, Sets) to reduce time complexity to O(n).

🔥 **The reusable pattern**
When dealing with Arrays, always ask:
*"Can I solve this in a single pass using two pointers or by storing previously seen elements?"*`,

  'Dynamic Programming': `🧠 **Pattern: Dynamic Programming / Memoization**

The key idea is:
Break the problem down into smaller overlapping subproblems and store their results.

**What you learn from this problem**
- **State Definition** → What does \`dp[i]\` represent?
- **Recurrence Relation** → How do you compute \`dp[i]\` from \`dp[i-1]\`?
- **Base Cases** → What are the simplest, smallest inputs?

🔥 **The reusable pattern**
When asked for a "maximum", "minimum", or "number of ways", think:
*"Can I express the solution for \`N\` using the solutions for \`N-1\` and \`N-2\`?"*`,

  'Trees': `🧠 **Pattern: Tree Traversal (DFS / BFS)**

The key idea is:
Visit nodes in a specific order (Pre-order, In-order, Post-order, or Level-order) to gather information or manipulate the tree structure.

**What you learn from this problem**
- **Recursion is your friend** → Trees are inherently recursive.
- **Top-Down vs Bottom-Up** → Are you passing values down to children, or returning values up to parents?
- **Base Cases** → Always check \`if (!root) return;\`

🔥 **The reusable pattern**
When dealing with Trees, think:
*"What information does a node need from its children, and what does it need to return to its parent?"*`,

  'Strings': `🧠 **Pattern: String Manipulation / Sliding Window**

The key idea is:
Treat the string as an array of characters. Use pointers or hash maps to track character frequencies or bounds of a valid substring.

**What you learn from this problem**
- **Character Counting** → Use a frequency map (array of size 26 or Hash Map).
- **Two Pointers** → Move a left and right pointer to find valid windows.
- **Edge Cases** → Always handle empty strings and strings of length 1.

🔥 **The reusable pattern**
When asked for "longest substring" or "anagrams", think:
*"Can I use a sliding window or a frequency map to solve this in O(n)?"*`,
  
  'Graphs': `🧠 **Pattern: Graph Traversal (BFS/DFS)**

The key idea is:
Explore nodes systematically while keeping track of visited nodes to avoid infinite loops.

**What you learn from this problem**
- **Visited Sets** → Crucial for avoiding cycles.
- **Adjacency Lists** → The most efficient way to represent graphs.
- **BFS vs DFS** → BFS for shortest path, DFS for exhaustive search.

🔥 **The reusable pattern**
When asked to find connected components or shortest paths, think:
*"How can I traverse this graph without revisiting nodes?"*`
};

const defaultPattern = `🧠 **Pattern: Core Algorithmic Concept**

The key idea is:
Understand the fundamental constraints and requirements of the problem to find an optimal solution.

**What you learn from this problem**
- **Brute Force vs Optimal** → Always look for ways to eliminate redundant work.
- **Data Structures** → Choose the right data structure (Hash Map, Stack, Queue) for the task.

🔥 **The reusable pattern**
Always ask: *"What is the bottleneck in my brute force solution, and what data structure can fix it?"*`;

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const problems = await Problem.find({ $or: [{ pattern: { $exists: false } }, { pattern: '' }] });
    console.log('Found ' + problems.length + ' problems without a pattern.');

    let count = 0;
    for (const p of problems) {
      const patternText = patternsByCategory[p.category] || defaultPattern;
      p.pattern = patternText;
      await p.save();
      count++;
    }
    
    console.log('Successfully populated ' + count + ' problems with category-specific patterns.');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
