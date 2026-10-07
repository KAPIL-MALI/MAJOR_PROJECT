import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2, Copy, RefreshCw, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../utils/api';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatbotContext } from '../../context/ChatbotContext';

// Suggested prompt list
const SUGGESTED_PROMPTS = [
  'Explain Binary Search',
  'Explain my code',
  'Find bug',
  'Optimize my solution',
  'Explain TC',
  'Explain SC',
  'Generate test cases',
  'Dry run',
  'Explain code',
  'Convert language',
  'Mock interview',
  'Similar problems'
];

// Helper to build system prompt with allowed topics (in backend)

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am PrimeCode AI. Ask me anything about programming or technical interviews.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const location = useLocation();
  const { problemContext } = useChatbotContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll when new messages appear, unless user scrolled up
  useEffect(() => {
    if (autoScroll) scrollToBottom();
  }, [messages, autoScroll]);

  // Detect manual scroll to pause auto‑scroll
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
      setAutoScroll(atBottom);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const buildContext = () => {
    const path = location.pathname;
    if (path.startsWith('/problems/')) {
      // Assume problem data is stored in route state; fallback if not
      const parts = path.split('/');
      const slug = parts[2];
      return `User is viewing problem slug: ${slug}`;
    }
    return 'User is browsing the platform.';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setLastUserMessage(userMsg);
    const updatedMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context (exclude initial greeting)
      const history = updatedMessages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        content: m.content,
      }));

      const res = await api.post('/chatbot', {
        message: userMsg,
        context: buildContext(),
        history,
        // Problem context from the ProblemDetail page (via ChatbotContext)
        problemTitle: problemContext.problemTitle || undefined,
        difficulty: problemContext.difficulty || undefined,
        tags: problemContext.tags || undefined,
        language: problemContext.language || undefined,
        userCode: problemContext.userCode || undefined,
      });
      if (res.data && res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      } else {
        throw new Error(res.data?.message || 'Unexpected response');
      }
    } catch (err) {
      const status = err.response?.status;
      let errMsg = 'An error occurred. Please try again.';
      if (status) {
        if (status === 400) errMsg = 'Bad request. Check your input.';
        else if (status === 401) errMsg = 'Unauthorized. Please log in again.';
        else if (status === 403) errMsg = 'Forbidden. You do not have access.';
        else if (status === 404) errMsg = 'Endpoint not found.';
        else if (status === 429) errMsg = 'Too many requests. Slow down.';
        else if (status === 500) errMsg = 'Server error. Please try later.';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: 'assistant', content: 'Chat cleared. How can I help you now?' }
    ]);
    setInput('');
    setLastUserMessage('');
  };

  const handleStop = () => {
    // Backend currently does not support streaming cancel, so just disable loading state
    setIsLoading(false);
  };

  const handleRegenerate = async () => {
    if (!lastUserMessage) return;
    // Remove last AI response if present
    setMessages(prev => prev.slice(0, -1));
    setIsLoading(true);
    try {
      const res = await api.post('/chatbot', {
        message: lastUserMessage,
        context: buildContext(),
        problemTitle: problemContext.problemTitle || undefined,
        difficulty: problemContext.difficulty || undefined,
        tags: problemContext.tags || undefined,
        language: problemContext.language || undefined,
        userCode: problemContext.userCode || undefined,
      });
      if (res.data && res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      } else {
        throw new Error('Regeneration failed');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to regenerate response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    // Focus textarea after setting
    setTimeout(() => document.getElementById('chat-input')?.focus(), 0);
  };

  const renderMessage = (msg, idx) => {
    const isUser = msg.role === 'user';
    return (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary text-white' : 'bg-secondary/20 text-secondary'}`}>
          {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
        </div>
        <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${isUser ? 'bg-primary text-primary-content rounded-tr-none' : 'bg-base-200 text-base-content rounded-tl-none prose prose-sm max-w-none'}`}>
          {isUser ? (
            msg.content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  return !inline ? (
                    <div className="relative group">
                      <pre className="bg-base-300 rounded p-2 overflow-x-auto"><code className={className}>{children}</code></pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-base-200 rounded p-1"
                      >
                        <Copy size={14} />
                      </button>
                      {language && (
                        <span className="absolute bottom-2 left-2 text-xs text-base-content/60 bg-base-200 rounded px-1">{language}</span>
                      )}
                    </div>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                }
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-primary/50 hover:scale-110 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col bg-base-100 glass-panel rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        ref={chatContainerRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-content/10 bg-gradient-to-r from-base-200 to-base-100 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/20 text-primary rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-base-content">PrimeCode AI</h3>
              <div className="text-xs text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleClear} className="p-1 hover:bg-base-300 rounded" title="Clear Chat">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-base-300 rounded" title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Suggested prompts when chat is empty */}
        {messages.length === 1 && (
          <div className="p-4 space-y-2">
            <p className="text-sm text-base-content/70">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handlePromptClick(p)}
                  className="btn btn-outline btn-xs rounded-xl"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <AnimatePresence>{messages.map(renderMessage)}</AnimatePresence>
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-base-200 rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-base-content/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-base-content/10 bg-base-200/50 rounded-b-2xl flex flex-col gap-2">
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            className="textarea textarea-bordered textarea-sm flex-1 bg-base-100 focus:outline-primary/50 resize-none"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn btn-primary btn-sm flex-1"
            >
              <Send size={16} className="mr-1" /> Send
            </button>
            {isLoading && (
              <button
                type="button"
                onClick={handleStop}
                className="btn btn-warning btn-sm"
              >
                <XCircle size={16} className="mr-1" /> Stop
              </button>
            )}
            {!isLoading && lastUserMessage && (
              <button
                type="button"
                onClick={handleRegenerate}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw size={16} className="mr-1" /> Regenerate
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
