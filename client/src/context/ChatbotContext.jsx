import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatbotContext = createContext(null);

/**
 * Provider that holds problem-related context for the AI chatbot.
 * ProblemDetail pushes data here; ChatBot reads from it.
 */
export const ChatbotProvider = ({ children }) => {
  const [problemContext, setProblemContext] = useState({
    problemTitle: null,
    difficulty: null,
    tags: null,
    language: null,
    userCode: null,
  });

  const updateChatbotContext = useCallback((updates) => {
    setProblemContext((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearChatbotContext = useCallback(() => {
    setProblemContext({
      problemTitle: null,
      difficulty: null,
      tags: null,
      language: null,
      userCode: null,
    });
  }, []);

  return (
    <ChatbotContext.Provider value={{ problemContext, updateChatbotContext, clearChatbotContext }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const ctx = useContext(ChatbotContext);
  if (!ctx) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return ctx;
};

export default ChatbotContext;
