import axios from 'axios';

const LANGUAGE_IDS = {
  javascript: 93,  // Node.js
  cpp: 54,          // C++ (GCC 9.2.0)
  java: 91          // Java (JDK 17.0.6)
};

const JUDGE0_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY;

const isRapidAPI = JUDGE0_URL.includes('rapidapi.com');

const judge0Headers = {
  'Content-Type': 'application/json'
};

if (isRapidAPI && JUDGE0_KEY && JUDGE0_KEY !== 'your_rapidapi_key_here') {
  judge0Headers['X-RapidAPI-Key'] = JUDGE0_KEY;
  try {
    judge0Headers['X-RapidAPI-Host'] = new URL(JUDGE0_URL).hostname;
  } catch(e) {
    judge0Headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }
}

// Submit code to Judge0
export const submitToJudge0 = async (code, language, stdin = '') => {
  try {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new Error(`Unsupported language: ${language}`);

    const response = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true&fields=*`,
      {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString('base64'),
        cpu_time_limit: 5,
        memory_limit: 256000
      },
      { headers: judge0Headers }
    );

    return response.data;
  } catch (error) {
    console.error('Judge0 Error:', error.response?.data || error.message);
    throw error;
  }
};

// Run against multiple test cases
export const runTestCases = async (code, language, testCases) => {
  const results = [];
  let passed = 0;

  for (const testCase of testCases) {
    try {
      const cleanInput = testCase.input.replace(/\r/g, '');
      const result = await submitToJudge0(code, language, cleanInput);
      
      const stdout = result.stdout 
        ? Buffer.from(result.stdout, 'base64').toString().trim() 
        : '';
      const stderr = result.stderr 
        ? Buffer.from(result.stderr, 'base64').toString().trim() 
        : '';
      const compileOutput = result.compile_output 
        ? Buffer.from(result.compile_output, 'base64').toString().trim() 
        : '';

      const expectedOutput = testCase.expectedOutput.trim();
      const isPassed = stdout === expectedOutput;
      if (isPassed) passed++;

      results.push({
        input: testCase.input,
        expectedOutput,
        actualOutput: stdout,
        stderr,
        compileOutput,
        passed: isPassed,
        time: result.time,
        memory: result.memory,
        status: result.status?.description || 'Unknown'
      });
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        error: error.message,
        passed: false,
        status: 'Error'
      });
    }
  }

  return { results, passed, total: testCases.length };
};

// Get status description code
export const getStatusDescription = (statusId) => {
  const statuses = {
    1: 'In Queue',
    2: 'Processing',
    3: 'Accepted',
    4: 'Wrong Answer',
    5: 'Time Limit Exceeded',
    6: 'Compilation Error',
    7: 'Runtime Error (SIGSEGV)',
    8: 'Runtime Error (SIGXFSZ)',
    9: 'Runtime Error (SIGFPE)',
    10: 'Runtime Error (SIGABRT)',
    11: 'Runtime Error (NZEC)',
    12: 'Runtime Error (Other)',
    13: 'Internal Error',
    14: 'Exec Format Error'
  };
  return statuses[statusId] || 'Unknown';
};
