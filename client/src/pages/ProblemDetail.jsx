import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import CodeEditor from '../components/editor/CodeEditor';
import Timer from '../components/ui/Timer';
import ReactMarkdown from 'react-markdown';
import { Play, Send, CheckCircle2, XCircle, Clock, Cpu, Lock, ChevronDown, ChevronUp, Copy, Check, Edit3 } from 'lucide-react';
import clsx from 'clsx';
import { useChatbotContext } from '../context/ChatbotContext';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

const ProblemDetail = () => {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description'); // description, solutions, submissions
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  
  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // testcases, result
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const { updateChatbotContext, clearChatbotContext } = useChatbotContext();

  // Clear chatbot context when leaving the problem page
  useEffect(() => {
    return () => clearChatbotContext();
  }, [clearChatbotContext]);

  // Fetch submissions automatically once the problem loads to check solved status
  useEffect(() => {
    if (problem) {
      fetchSubmissions();
    }
  }, [problem]);

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const res = await api.get(`/submissions/problem/${problem._id}`);
      setSubmissions(res.data.submissions);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCopyCode = (sub) => {
    navigator.clipboard.writeText(sub.code);
    setCopiedId(sub._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditCode = (sub) => {
    setLanguage(sub.language);
    setCode(sub.code);
    setActiveTab('description'); // Switch back to description to read the problem
  };

  const toggleExpand = (id) => {
    setExpandedSubmissionId(prev => prev === id ? null : id);
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      const statuses = ['Queued...', 'Compiling...', 'Running...'];
      let idx = 0;
      setLoadingStatus(statuses[0]);
      interval = setInterval(() => {
        if (idx < statuses.length - 1) {
          idx++;
          setLoadingStatus(statuses[idx]);
        }
      }, 500);
    } else if (isSubmitting) {
      const statuses = ['Queued...', 'Compiling...', 'Running...', 'Evaluating...'];
      let idx = 0;
      setLoadingStatus(statuses[0]);
      interval = setInterval(() => {
        if (idx < statuses.length - 1) {
          idx++;
          setLoadingStatus(statuses[idx]);
        }
      }, 500);
    } else {
      setLoadingStatus('');
    }
    return () => clearInterval(interval);
  }, [isRunning, isSubmitting]);

  useEffect(() => {
    fetchProblem();
  }, [slug]);

  const fetchProblem = async () => {
    try {
      const res = await api.get(`/problems/${slug}`);
      const p = res.data.problem;
      setProblem(p);
      setCode(p.starterCode[language] || '');
      setLoading(false);

      // Push problem metadata into chatbot context
      updateChatbotContext({
        problemTitle: p.title,
        difficulty: p.difficulty,
        tags: p.tags || p.category,
        language,
        userCode: p.starterCode[language] || '',
      });
    } catch (error) {
      console.error('Failed to fetch problem', error);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem && problem.starterCode) {
      // Basic confirmation could go here if code was modified
      const newCode = problem.starterCode[newLang] || '';
      setCode(newCode);
      updateChatbotContext({ language: newLang, userCode: newCode });
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setActiveConsoleTab('result');
    try {
      // Use the raw testCase input for execution, not the human-readable example string
      const input = problem.testCases ? problem.testCases[activeTestCase]?.input : problem.examples[activeTestCase]?.input || '';
      const res = await api.post('/submissions/run', {
        code,
        language,
        input,
        problemId: problem._id
      });
      setOutput({
        type: 'run',
        status: res.data.status,
        stdout: res.data.output,
        stderr: res.data.error,
        time: res.data.time,
        memory: res.data.memory
      });
    } catch (error) {
      setOutput({
        type: 'error',
        stderr: error.response?.data?.message || error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setActiveConsoleTab('result');
    try {
      const res = await api.post('/submissions/submit', {
        code,
        language,
        problemId: problem._id
      });
      setOutput({
        type: 'submit',
        ...res.data.submission
      });
      // Immediately refresh submissions list if the submission was accepted to unlock the solution tab
      if (res.data.submission.status === 'Accepted') {
        fetchSubmissions();
      }
    } catch (error) {
      setOutput({
        type: 'error',
        stderr: error.response?.data?.message || error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSolved = submissions.some(s => s.status === 'Accepted') || (output?.type === 'submit' && output?.status === 'Accepted');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!problem) return <div>Problem not found</div>;

  return (
    <div className="flex h-full w-full bg-base-200/50 p-2 gap-2 overflow-hidden" style={{ maxHeight: '100%' }}>
      
      {/* Left Panel: Problem Description */}
      <div className="w-1/2 flex flex-col min-h-0 bg-base-100 rounded-xl border border-base-content/10 overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-base-content/10 bg-base-200/30 px-2 pt-2">
          {['description', 'solutions', 'submissions', problem.videoUrl ? 'video' : null, 'pattern'].filter(Boolean).map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
                activeTab === tab 
                  ? 'border-primary text-primary bg-base-100' 
                  : 'border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/50'
              } rounded-t-lg`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'video' ? 'Video Solution' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'description' && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className={clsx(
                  "px-2.5 py-1 rounded-md text-xs font-medium border",
                  problem.difficulty === 'Basic' && "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
                  problem.difficulty === 'Easy' && "text-success bg-success/10 border-success/20",
                  problem.difficulty === 'Medium' && "text-warning bg-warning/10 border-warning/20",
                  problem.difficulty === 'Hard' && "text-error bg-error/10 border-error/20"
                )}>
                  {problem.difficulty}
                </span>
                <span className="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded-md">
                  {problem.category}
                </span>
              </div>
              
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{problem.description}</ReactMarkdown>
              </div>

              {problem.examples && problem.examples.length > 0 && (
                <div className="mt-8 space-y-6">
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-base-200/50 rounded-lg border border-base-content/10 p-4">
                      <p className="font-semibold mb-2">Example {idx + 1}:</p>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-base-content/70">Input:</span> <code className="font-mono text-primary">{ex.input}</code></p>
                        <p><span className="font-semibold text-base-content/70">Output:</span> <code className="font-mono text-primary">{ex.output}</code></p>
                        {ex.explanation && (
                          <p><span className="font-semibold text-base-content/70">Explanation:</span> {ex.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-3">Constraints:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm bg-base-200/30 p-4 rounded-lg border border-base-content/10">
                    {problem.constraints.map((c, i) => (
                      <li key={i}><code className="font-mono text-primary text-xs">{c}</code></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'solutions' && (
            <div className="animate-fade-in p-2">
              {isSolved ? (
                <div className="prose prose-sm max-w-none dark:prose-invert bg-base-200/30 p-6 rounded-xl border border-base-content/10">
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary mb-1">💡 Optimal Approach Summary</h3>
                    <p className="m-0 text-base-content/90 font-sans">{problem.solution || 'No summary available.'}</p>
                  </div>
                  {problem.solutionExplanation ? (
                    <ReactMarkdown>{problem.solutionExplanation}</ReactMarkdown>
                  ) : (
                    <p className="text-base-content/60">Detailed explanation is being loaded...</p>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-base-content/60 mt-10">
                  <Lock className="mx-auto mb-2 opacity-50" size={32} />
                  <p>Solutions are unlocked after you solve the problem.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'submissions' && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-xl font-bold mb-4">Submission History</h2>
              {loadingSubmissions ? (
                <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary"></span></div>
              ) : submissions.length === 0 ? (
                <div className="p-4 text-center text-base-content/60 bg-base-200/30 rounded-lg border border-base-content/10">
                  <p>You have not submitted any solutions for this problem yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-base-content/10 rounded-xl">
                  <table className="table table-zebra w-full text-sm">
                    <thead className="bg-base-200/50">
                      <tr>
                        <th>Status</th>
                        <th>Language</th>
                        <th>Runtime</th>
                        <th>Memory</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(sub => (
                        <React.Fragment key={sub._id}>
                          <tr 
                            className="hover:bg-base-200/50 cursor-pointer transition-colors"
                            onClick={() => toggleExpand(sub._id)}
                          >
                            <td className="font-medium">
                              <span className={clsx(
                                "px-2.5 py-1 rounded-md text-xs border flex items-center gap-1 w-fit",
                                sub.status === 'Accepted' ? 'text-success bg-success/10 border-success/20' : 'text-error bg-error/10 border-error/20'
                              )}>
                                {expandedSubmissionId === sub._id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {sub.status}
                              </span>
                            </td>
                            <td className="capitalize">{sub.language}</td>
                            <td className="font-mono text-base-content/70">{sub.runtime}</td>
                            <td className="font-mono text-base-content/70">{sub.memory}</td>
                            <td className="text-base-content/60">{new Date(sub.createdAt).toLocaleDateString()}</td>
                          </tr>
                          {expandedSubmissionId === sub._id && (
                            <tr>
                              <td colSpan="5" className="p-0 border-b-0 bg-base-200/30">
                                <div className="p-4 border-b border-base-content/10 shadow-inner">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Submitted Code</span>
                                    <div className="flex gap-2">
                                      <button 
                                        className="btn btn-xs btn-ghost gap-1"
                                        onClick={() => handleCopyCode(sub)}
                                      >
                                        {copiedId === sub._id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                        {copiedId === sub._id ? 'Copied!' : 'Copy'}
                                      </button>
                                      <button 
                                        className="btn btn-xs btn-primary gap-1"
                                        onClick={() => handleEditCode(sub)}
                                      >
                                        <Edit3 size={14} />
                                        Move to Editor
                                      </button>
                                    </div>
                                  </div>
                                  <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-base-content/10">
                                    <code>{sub.code}</code>
                                  </pre>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && problem.videoUrl && (
            <div className="animate-fade-in flex flex-col h-full">
              <h2 className="text-xl font-bold mb-4">Video Solution</h2>
              <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden border border-base-content/10 shadow-lg bg-black">
                {getYouTubeEmbedUrl(problem.videoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(problem.videoUrl)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-error p-4 text-center">
                    Invalid YouTube URL. Please check the link.
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-base-content/70">
                <p>If the video doesn't play, you can also watch it directly on YouTube: <a href={problem.videoUrl} target="_blank" rel="noopener noreferrer" className="link link-primary font-semibold">{problem.videoUrl}</a></p>
              </div>
            </div>
          )}

          {activeTab === 'pattern' && (
            <div className="animate-fade-in p-2">
              <div className="prose prose-sm max-w-none dark:prose-invert bg-base-200/30 p-6 rounded-xl border border-base-content/10">
                {problem.pattern ? (
                  <ReactMarkdown>{problem.pattern}</ReactMarkdown>
                ) : (
                  <div className="text-center text-base-content/60 py-8">
                    <p className="text-lg font-semibold mb-2">🧠 Pattern explanation coming soon!</p>
                    <p>We are currently writing the learning takeaways for this problem.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Editor and Console */}
      <div className="w-1/2 flex flex-col gap-2 min-h-0">
        
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-h-0 bg-base-100 rounded-xl border border-base-content/10 overflow-hidden shadow-sm">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-base-content/10 bg-base-200/30">
            <select 
              className="select select-sm select-bordered bg-base-100 focus:outline-primary"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            <div className="flex items-center gap-4">
              <Timer />
            </div>
          </div>

          {/* Editor Core */}
          <div className="flex-1 overflow-hidden relative">
            <CodeEditor language={language} value={code} onChange={(newCode) => {
              setCode(newCode);
              updateChatbotContext({ userCode: newCode });
            }} />
          </div>
        </div>

        {/* Console / Testcases */}
        <div className="h-64 flex flex-col bg-base-100 rounded-xl border border-base-content/10 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-2 bg-base-200/30 border-b border-base-content/10">
            <div className="flex">
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeConsoleTab === 'testcases' ? 'border-primary text-primary bg-base-100' : 'border-transparent text-base-content/60 hover:bg-base-200/50'}`}
                onClick={() => setActiveConsoleTab('testcases')}
              >
                Testcases
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeConsoleTab === 'result' ? 'border-primary text-primary bg-base-100' : 'border-transparent text-base-content/60 hover:bg-base-200/50'}`}
                onClick={() => setActiveConsoleTab('result')}
              >
                Test Result
              </button>
            </div>
            <div className="flex gap-2 pr-2 py-1">
              <button 
                className="btn btn-sm btn-ghost hover:bg-base-200 gap-1 text-base-content/80"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
              >
                {isRunning ? <span className="loading loading-spinner loading-xs"></span> : <Play size={14} />}
                Run
              </button>
              <button 
                className="btn btn-sm btn-primary gap-1 shadow-md shadow-primary/20"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
              >
                {isSubmitting ? <span className="loading loading-spinner loading-xs"></span> : <Send size={14} />}
                Submit
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-base-100 font-mono text-sm">
            {activeConsoleTab === 'testcases' && (
              <div>
                <div className="flex gap-2 mb-4">
                  {problem.testCases?.map((_, idx) => (
                    <button
                      key={idx}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${activeTestCase === idx ? 'bg-base-300 text-base-content' : 'bg-base-200/50 text-base-content/60 hover:bg-base-200'}`}
                      onClick={() => setActiveTestCase(idx)}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>
                {problem.testCases && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-base-content/50 mb-1 font-sans">Input</p>
                      <div className="bg-base-200 p-3 rounded-lg whitespace-pre-wrap">{problem.testCases[activeTestCase]?.input}</div>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50 mb-1 font-sans">Expected Output</p>
                      <div className="bg-base-200 p-3 rounded-lg whitespace-pre-wrap">{problem.testCases[activeTestCase]?.expectedOutput}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeConsoleTab === 'result' && (
              <div>
                {!output && !isRunning && !isSubmitting && (
                  <div className="h-full flex items-center justify-center text-base-content/40 font-sans">
                    Run or submit code to see results
                  </div>
                )}
                {(isRunning || isSubmitting) && (
                  <div className="h-full flex items-center justify-center gap-2 text-primary">
                    <span className="loading loading-spinner loading-md"></span>
                    <span>{loadingStatus}</span>
                  </div>
                )}
                {output && !isRunning && !isSubmitting && (
                  <div className="animate-fade-in">
                    {/* Status Header */}
                    <h3 className={clsx(
                      "text-xl font-bold mb-4 flex items-center gap-2",
                      output.status === 'Accepted' ? 'text-success' : 'text-error'
                    )}>
                      {output.status === 'Accepted' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                      {output.type === 'error' 
                        ? 'Execution Error'
                        : output.status === 'Accepted' 
                          ? (output.type === 'submit' ? 'Correct Answer' : 'Compilation Completed') 
                          : output.status}
                    </h3>

                    {/* Stats for Submit (only show when accepted or wrong answer, not for compile errors) */}
                    {output.type === 'submit' && output.status !== 'Compilation Error' && (
                      <div className="flex gap-4 mb-6">
                        <div className="bg-base-200/50 px-4 py-2 rounded-lg border border-base-content/5 flex items-center gap-2">
                          <Clock size={16} className="text-base-content/60" />
                          <span className="text-base-content/60 font-sans text-sm">Runtime:</span>
                          <span className="font-semibold">{output.runtime}</span>
                        </div>
                        <div className="bg-base-200/50 px-4 py-2 rounded-lg border border-base-content/5 flex items-center gap-2">
                          <Cpu size={16} className="text-base-content/60" />
                          <span className="text-base-content/60 font-sans text-sm">Memory:</span>
                          <span className="font-semibold">{output.memory}</span>
                        </div>
                        <div className="bg-base-200/50 px-4 py-2 rounded-lg border border-base-content/5 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-success" />
                          <span className="font-semibold text-success">{output.testCasesPassed} / {output.totalTestCases}</span>
                          <span className="text-base-content/60 font-sans text-sm">Passed</span>
                        </div>
                      </div>
                    )}

                    {/* Test case count for compilation errors on submit */}
                    {output.type === 'submit' && output.status === 'Compilation Error' && (
                      <div className="flex gap-4 mb-4">
                        <div className="bg-error/10 px-4 py-2 rounded-lg border border-error/20 flex items-center gap-2">
                          <XCircle size={16} className="text-error" />
                          <span className="font-semibold text-error">0 / {output.totalTestCases}</span>
                          <span className="text-error/70 font-sans text-sm">Passed</span>
                        </div>
                      </div>
                    )}

                    {/* Error output: stderr, compile errors */}
                    {output.type === 'error' && output.stderr && (
                      <div className="bg-error/10 text-error p-4 rounded-lg border border-error/20 whitespace-pre-wrap font-mono text-xs">
                        {output.stderr}
                      </div>
                    )}

                    {output.type === 'run' && output.stderr && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-error font-semibold mb-1 font-sans flex items-center gap-1">
                            <XCircle size={12} /> Error Output
                          </p>
                          <div className="bg-error/10 text-error p-3 rounded-lg border border-error/20 whitespace-pre-wrap text-xs">
                            {output.stderr}
                          </div>
                        </div>
                        {output.stdout && (
                          <div>
                            <p className="text-xs text-base-content/50 mb-1 font-sans">Standard Output</p>
                            <div className="bg-base-200 p-3 rounded-lg whitespace-pre-wrap">{output.stdout}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {output.type === 'run' && !output.stderr && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-base-content/50 mb-1 font-sans">Output</p>
                          <div className="bg-base-200 p-3 rounded-lg whitespace-pre-wrap">{output.stdout || 'No output'}</div>
                        </div>
                      </div>
                    )}

                    {/* Submit: show compilation error details from results */}
                    {output.type === 'submit' && output.stderr && (
                      <div>
                        <p className="text-xs text-error font-semibold mb-1 font-sans flex items-center gap-1">
                          <XCircle size={12} /> Compiler / Runtime Error
                        </p>
                        <div className="bg-error/10 text-error p-3 rounded-lg border border-error/20 whitespace-pre-wrap font-mono text-xs">
                          {output.stderr}
                        </div>
                      </div>
                    )}

                    {/* Submit: show failed test cases for wrong answers (not compile errors) */}
                    {output.type === 'submit' && !output.stderr && output.results && output.status !== 'Accepted' && output.status !== 'Compilation Error' && (
                      <div className="space-y-4">
                        {output.results.filter(r => !r.passed).slice(0, 1).map((failedCase, idx) => (
                          <div key={idx}>
                            <p className="text-error font-semibold mb-2">Failed Test Case:</p>
                            <div className="space-y-2">
                              <div><span className="text-xs text-base-content/50 font-sans">Input:</span><div className="bg-base-200 p-2 rounded">{failedCase.input}</div></div>
                              <div><span className="text-xs text-base-content/50 font-sans">Expected:</span><div className="bg-base-200 p-2 rounded">{failedCase.expectedOutput}</div></div>
                              <div><span className="text-xs text-base-content/50 font-sans">Actual:</span><div className="bg-base-200 p-2 rounded text-error">{failedCase.actualOutput || 'No output'}</div></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};



export default ProblemDetail;
