'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ content: string; isUser: boolean }[]>([
    { 
      content: 'Hello! I am your legal assistant. How can I help you today?',
      isUser: false 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = { content: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage = { 
        content: getPlaceholderResponse(input),
        isUser: false 
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Placeholder function - replace with actual AI integration
  const getPlaceholderResponse = (userInput: string) => {
    const lowercaseInput = userInput.toLowerCase();
    
    if (lowercaseInput.includes('case') && lowercaseInput.includes('filing')) {
      return 'To file a new case, you can go to the Cases section and click on "Create New Case". You\'ll need to fill in the details like case type, court name, and parties involved.';
    }
    
    if (lowercaseInput.includes('hearing') || lowercaseInput.includes('date')) {
      return 'You can schedule or update hearing dates in the specific case details page. Navigate to the case and use the Hearings tab to add or modify hearing information.';
    }
    
    if (lowercaseInput.includes('help') || lowercaseInput.includes('guide')) {
      return 'I can help you with managing cases, scheduling hearings, understanding legal procedures, and navigating this application. What specific assistance do you need?';
    }
    
    return 'I understand your query about "' + userInput + '". This is a placeholder response - in the live version, I would connect to an AI service to provide relevant legal information and assistance.';
  };

  return (
    <div className="px-2 sm:px-4 py-4 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-200 mb-4">Legal Assistant</h1>
      
      <Card className="mx-auto shadow-md border-slate-300 dark:border-slate-700 overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4">
          <CardTitle className="text-slate-800 dark:text-slate-200">AI Legal Assistant</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
            Ask questions about legal procedures, case management, or app usage
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex flex-col h-[calc(100vh-250px)] sm:h-[500px]">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 sm:px-4 ${
                      message.isUser 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 sm:px-4 border border-slate-200 dark:border-slate-600 rounded-bl-none">
                    <div className="flex space-x-1 items-center h-5">
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 rounded-full border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex items-center justify-center rounded-full w-10 h-10 min-w-[40px] bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 