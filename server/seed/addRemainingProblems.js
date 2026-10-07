import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.js';

dotenv.config({ path: '../.env' });

const genericStarterCode = {
  javascript: `function solve(arr) {\n  // Write your solution here\n}\n\nconst input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();\nconst arr = JSON.parse(input);\nconsole.log(JSON.stringify(solve(arr)));`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}`
};

// 25 UNIQUE problems that are less common to avoid any duplicates
const newUniqueProblems = [
  {
    title: "Print 1 to N Space Separated",
    description: "Given an integer N, print all numbers from 1 to N space-separated.",
    difficulty: "Basic", category: "Basics", tags: ["Loops"],
    examples: [{ input: "N = 5", output: "1 2 3 4 5", explanation: "" }],
    constraints: ["1 <= N <= 1000"],
    starterCode: genericStarterCode,
    testCases: [{ input: "5", expectedOutput: "1 2 3 4 5" }],
    order: 201, acceptance: 95
  },
  {
    title: "Matrix Diagonal Sum",
    description: "Given a square matrix mat, return the sum of the matrix diagonals.",
    difficulty: "Easy", category: "Arrays", tags: ["Matrix", "Math"],
    examples: [{ input: "mat = [[1,2,3],[4,5,6],[7,8,9]]", output: "25", explanation: "" }],
    constraints: ["n == mat.length == mat[i].length"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "25" }],
    order: 202, acceptance: 80
  },
  {
    title: "Find Center of Star Graph",
    description: "There is an undirected star graph consisting of n nodes. Return the center of the given star graph.",
    difficulty: "Easy", category: "Graphs", tags: ["Graphs"],
    examples: [{ input: "edges = [[1,2],[2,3],[4,2]]", output: "2", explanation: "Node 2 is connected to every other node." }],
    constraints: ["3 <= n <= 10^5"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[[1,2],[2,3],[4,2]]", expectedOutput: "2" }],
    order: 203, acceptance: 84
  },
  {
    title: "Count Asterisks",
    description: "You are given a string s, where every two consecutive vertical bars '|' are grouped into a pair. In other words, the 1st and 2nd '|' make a pair, the 3rd and 4th '|' make a pair, and so forth. Return the number of '*' in s, excluding the '*' between each pair of '|'.",
    difficulty: "Easy", category: "Strings", tags: ["Strings"],
    examples: [{ input: "s = 'l|*e*et|c**o|*de|'", output: "2", explanation: "" }],
    constraints: ["1 <= s.length <= 1000"],
    starterCode: genericStarterCode,
    testCases: [{ input: "'l|*e*et|c**o|*de|'", expectedOutput: "2" }],
    order: 204, acceptance: 82
  },
  {
    title: "Minimum Operations to Make Array Equal",
    description: "You have an array arr of length n where arr[i] = (2 * i) + 1 for all valid values of i. Return the minimum number of operations needed to make all the elements of arr equal.",
    difficulty: "Medium", category: "Math", tags: ["Math"],
    examples: [{ input: "n = 3", output: "2", explanation: "arr = [1, 3, 5]" }],
    constraints: ["1 <= n <= 10^4"],
    starterCode: genericStarterCode,
    testCases: [{ input: "3", expectedOutput: "2" }],
    order: 205, acceptance: 81
  },
  {
    title: "Max Consecutive Ones III",
    description: "Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.",
    difficulty: "Medium", category: "Arrays", tags: ["Sliding Window"],
    examples: [{ input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", output: "6", explanation: "" }],
    constraints: ["1 <= nums.length <= 10^5"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[1,1,1,0,0,0,1,1,1,1,0]\n2", expectedOutput: "6" }],
    order: 206, acceptance: 62
  },
  {
    title: "Number of Provinces",
    description: "There are n cities. A province is a group of directly or indirectly connected cities. Return the total number of provinces.",
    difficulty: "Medium", category: "Graphs", tags: ["DFS", "Union Find"],
    examples: [{ input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2", explanation: "" }],
    constraints: ["1 <= n <= 200"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[[1,1,0],[1,1,0],[0,0,1]]", expectedOutput: "2" }],
    order: 207, acceptance: 63
  },
  {
    title: "Sort Characters By Frequency",
    description: "Given a string s, sort it in decreasing order based on the frequency of the characters.",
    difficulty: "Medium", category: "Strings", tags: ["Hash Map", "Sorting", "Heap"],
    examples: [{ input: "s = 'tree'", output: "'eert'", explanation: "" }],
    constraints: ["1 <= s.length <= 5 * 10^5"],
    starterCode: genericStarterCode,
    testCases: [{ input: "'tree'", expectedOutput: "'eert'" }],
    order: 208, acceptance: 71
  },
  {
    title: "Count Good Nodes in Binary Tree",
    description: "Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X. Return the number of good nodes.",
    difficulty: "Medium", category: "Trees", tags: ["DFS", "Trees"],
    examples: [{ input: "root = [3,1,4,3,null,1,5]", output: "4", explanation: "" }],
    constraints: ["1 <= nodes <= 10^5"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[3,1,4,3,null,1,5]", expectedOutput: "4" }],
    order: 209, acceptance: 73
  },
  {
    title: "Koko Eating Bananas",
    description: "Koko loves to eat bananas. Return the minimum integer k such that she can eat all the bananas within h hours.",
    difficulty: "Medium", category: "Binary Search", tags: ["Binary Search"],
    examples: [{ input: "piles = [3,6,7,11], h = 8", output: "4", explanation: "" }],
    constraints: ["1 <= piles.length <= 10^4"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[3,6,7,11]\n8", expectedOutput: "4" }],
    order: 210, acceptance: 52
  },
  {
    title: "Daily Temperatures",
    description: "Given an array of integers temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.",
    difficulty: "Medium", category: "Stacks & Queues", tags: ["Stack"],
    examples: [{ input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]", explanation: "" }],
    constraints: ["1 <= temperatures.length <= 10^5"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[73,74,75,71,69,72,76,73]", expectedOutput: "[1,1,4,2,1,1,0,0]" }],
    order: 211, acceptance: 66
  },
  {
    title: "Car Fleet",
    description: "There are n cars going to the same destination along a one-lane road. Return the number of car fleets that will arrive at the destination.",
    difficulty: "Medium", category: "Stacks & Queues", tags: ["Stack", "Sorting"],
    examples: [{ input: "target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]", output: "3", explanation: "" }],
    constraints: ["n == position.length == speed.length"],
    starterCode: genericStarterCode,
    testCases: [{ input: "12\n[10,8,0,5,3]\n[2,4,1,1,3]", expectedOutput: "3" }],
    order: 212, acceptance: 50
  },
  {
    title: "Design Twitter",
    description: "Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and is able to see the 10 most recent tweets in the user's news feed.",
    difficulty: "Medium", category: "System Design", tags: ["Hash Map", "Heap"],
    examples: [{ input: "Twitter t = new Twitter(); t.postTweet(1, 5);", output: "null", explanation: "" }],
    constraints: ["1 <= userId <= 500"],
    starterCode: genericStarterCode,
    testCases: [{ input: "Twitter t = new Twitter();", expectedOutput: "null" }],
    order: 213, acceptance: 38
  },
  {
    title: "Sliding Window Maximum",
    description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window.",
    difficulty: "Hard", category: "Stacks & Queues", tags: ["Sliding Window", "Queue"],
    examples: [{ input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]", explanation: "" }],
    constraints: ["1 <= nums.length <= 10^5"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[1,3,-1,-3,5,3,6,7]\n3", expectedOutput: "[3,3,5,5,6,7]" }],
    order: 214, acceptance: 46
  },
  {
    title: "Minimum Window Substring",
    description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    difficulty: "Hard", category: "Strings", tags: ["Sliding Window", "Hash Map"],
    examples: [{ input: "s = 'ADOBECODEBANC', t = 'ABC'", output: "'BANC'", explanation: "" }],
    constraints: ["m == s.length", "n == t.length"],
    starterCode: genericStarterCode,
    testCases: [{ input: "'ADOBECODEBANC'\n'ABC'", expectedOutput: "'BANC'" }],
    order: 215, acceptance: 41
  },
  {
    title: "Basic Calculator",
    description: "Given a string s representing a valid expression, implement a basic calculator to evaluate it, and return the result of the evaluation.",
    difficulty: "Hard", category: "Stacks & Queues", tags: ["Stack", "Math"],
    examples: [{ input: "s = '(1+(4+5+2)-3)+(6+8)'", output: "23", explanation: "" }],
    constraints: ["1 <= s.length <= 3 * 10^5"],
    starterCode: genericStarterCode,
    testCases: [{ input: "'(1+(4+5+2)-3)+(6+8)'", expectedOutput: "23" }],
    order: 216, acceptance: 42
  },
  {
    title: "Word Search II",
    description: "Given an m x n board of characters and a list of strings words, return all words on the board.",
    difficulty: "Hard", category: "Backtracking", tags: ["Trie", "Backtracking"],
    examples: [{ input: "board = [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']], words = ['oath','pea','eat','rain']", output: "['eat','oath']", explanation: "" }],
    constraints: ["m == board.length"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']]\n['oath','pea','eat','rain']", expectedOutput: "['eat','oath']" }],
    order: 217, acceptance: 38
  },
  {
    title: "Alien Dictionary",
    description: "There is a new alien language that uses the English alphabet. Given a list of words from the alien language's dictionary, return a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules.",
    difficulty: "Hard", category: "Graphs", tags: ["Graphs", "Topological Sort"],
    examples: [{ input: "words = ['wrt','wrf','er','ett','rftt']", output: "'wertf'", explanation: "" }],
    constraints: ["1 <= words.length <= 100"],
    starterCode: genericStarterCode,
    testCases: [{ input: "['wrt','wrf','er','ett','rftt']", expectedOutput: "'wertf'" }],
    order: 218, acceptance: 35
  },
  {
    title: "Cheapest Flights Within K Stops",
    description: "There are n cities connected by some number of flights. Return the cheapest price from src to dst with at most k stops.",
    difficulty: "Medium", category: "Graphs", tags: ["Graphs", "Shortest Path"],
    examples: [{ input: "n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1", output: "700", explanation: "" }],
    constraints: ["1 <= n <= 100"],
    starterCode: genericStarterCode,
    testCases: [{ input: "4\n[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]\n0\n3\n1", expectedOutput: "700" }],
    order: 219, acceptance: 37
  },
  {
    title: "Network Delay Time",
    description: "You are given a network of n nodes, labeled from 1 to n. Return the minimum time it takes for all the n nodes to receive the signal.",
    difficulty: "Medium", category: "Graphs", tags: ["Graphs", "Shortest Path"],
    examples: [{ input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2", explanation: "" }],
    constraints: ["1 <= n <= 100"],
    starterCode: genericStarterCode,
    testCases: [{ input: "[[2,1,1],[2,3,1],[3,4,1]]\n4\n2", expectedOutput: "2" }],
    order: 220, acceptance: 53
  }
];

async function addRemainingProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://manalidighe6_db_user:K9RJTdgqSiTFjQXC@primecode.6inriw9.mongodb.net/primecode');
    console.log('Connected to DB');
    
    // Auto-generate slugs
    newUniqueProblems.forEach(p => {
      p.slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    });

    // Seed all problems in the array
    let addedCount = 0;
    const currentCount = await Problem.countDocuments();
    console.log(`Current DB count: ${currentCount}. Seeding any remaining problems...`);

    for (let p of newUniqueProblems) {
      const exists = await Problem.findOne({ slug: p.slug });
      if (!exists) {
        await Problem.create(p);
        console.log(`Added: ${p.title}`);
        addedCount++;
      } else {
        console.log(`Skipped existing: ${p.title}`);
      }
    }
    
    const newCount = await Problem.countDocuments();
    console.log(`Successfully added ${addedCount} new problems. Total problems is now ${newCount}!`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to insert problems:', error);
    process.exit(1);
  }
}

addRemainingProblems();
