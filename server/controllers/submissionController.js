import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { submitToJudge0, runTestCases } from '../utils/judge0.js';

// Helper to combine user code with driver code
const buildFinalCode = (code, language, driverCode) => {
  if (!driverCode) return code;
  
  if (language === 'javascript') {
    return `// Helper definitions for ListNode and TreeNode
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

${code}

${driverCode}`;
  } else if (language === 'cpp') {
    return `#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

${code}

${driverCode}`;
  } else if (language === 'java') {
    return `import java.util.*;

class ListNode {
    public int val;
    public ListNode next;
    public ListNode() {}
    public ListNode(int val) { this.val = val; }
    public ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode() {}
    public TreeNode(int val) { this.val = val; }
    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

${code}

${driverCode}`;
  }
  return code;
};

// Run code (without saving)
export const runCode = async (req, res) => {
  try {
    const { code, language, input, problemId } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Code and language are required' });
    }

    let finalCode = code;
    if (problemId) {
      const problem = await Problem.findById(problemId);
      if (problem && problem.driverCode && problem.driverCode[language]) {
        finalCode = buildFinalCode(code, language, problem.driverCode[language]);
      }
    }

    const cleanInput = (input || '').replace(/\r/g, '');
    const result = await submitToJudge0(finalCode, language, cleanInput);
    
    const stdout = result.stdout 
      ? Buffer.from(result.stdout, 'base64').toString().trim() 
      : '';
    const stderr = result.stderr 
      ? Buffer.from(result.stderr, 'base64').toString().trim() 
      : '';
    const compileOutput = result.compile_output 
      ? Buffer.from(result.compile_output, 'base64').toString().trim() 
      : '';

    res.json({
      success: true,
      output: stdout,
      error: stderr || compileOutput,
      time: result.time,
      memory: result.memory,
      status: result.status?.description || 'Unknown'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Code execution failed: ' + error.message });
  }
};

// Submit code (run against test cases and save)
export const submitCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    
    if (!code || !language || !problemId) {
      return res.status(400).json({ success: false, message: 'Code, language, and problemId are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    let finalCode = code;
    if (problem.driverCode && problem.driverCode[language]) {
      finalCode = buildFinalCode(code, language, problem.driverCode[language]);
    }

    // Run against all test cases
    const { results, passed, total } = await runTestCases(finalCode, language, problem.testCases);

    const allPassed = passed === total;
    const status = allPassed ? 'Accepted' : 
      results.some(r => r.status === 'Compilation Error') ? 'Compilation Error' :
      results.some(r => r.status === 'Time Limit Exceeded') ? 'Time Limit Exceeded' :
      results.some(r => r.status?.includes('Runtime Error')) ? 'Runtime Error' :
      'Wrong Answer';

    // Calculate average runtime and memory
    const avgTime = results.reduce((acc, r) => acc + (parseFloat(r.time) || 0), 0) / results.length;
    const avgMemory = results.reduce((acc, r) => acc + (parseFloat(r.memory) || 0), 0) / results.length;

    // Save submission
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      status,
      runtime: `${(avgTime * 1000).toFixed(0)} ms`,
      memory: `${(avgMemory / 1024).toFixed(1)} MB`,
      testCasesPassed: passed,
      totalTestCases: total,
      output: JSON.stringify(results.slice(0, 3))
    });

    // Update problem stats
    problem.totalSubmissions += 1;
    if (allPassed) problem.acceptedSubmissions += 1;
    await problem.save();

    // If accepted, add to user's solved problems
    if (allPassed) {
      const alreadySolved = req.user.solvedProblems.some(
        sp => sp.problem.toString() === problemId
      );
      if (!alreadySolved) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { solvedProblems: { problem: problemId, language } }
        });
      }
    }

    const firstError = results.find(r => r.stderr || r.compileOutput);

    res.json({
      success: true,
      submission: {
        id: submission._id,
        status,
        runtime: submission.runtime,
        memory: submission.memory,
        testCasesPassed: passed,
        totalTestCases: total,
        stderr: firstError ? (firstError.stderr || firstError.compileOutput) : '',
        results: results.map(r => ({
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput,
          passed: r.passed,
          status: r.status
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Submission failed: ' + error.message });
  }
};

// Get submissions for a problem by current user
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
      problem: req.params.problemId
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all submissions by current user
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
