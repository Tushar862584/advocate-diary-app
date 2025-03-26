"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Send, MessageSquare } from "lucide-react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your legal assistant powered by Gemini AI. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prevent body scrolling and handle mobile viewport issues
  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";

    const setAppHeight = () => {
      // Set a CSS variable for the viewport height to handle mobile browser address bar
      const vh = window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${vh}px`);

      // Also apply fixed height to our container to prevent resizing on scroll
      if (chatContainerRef.current) {
        chatContainerRef.current.style.height = `${vh}px`;
      }
    };

    // Set height initially
    setAppHeight();

    // Update height on resize
    window.addEventListener("resize", setAppHeight);

    // Handle iOS Safari specific issues by listening to scroll events
    const handleIOSScroll = () => {
      // Force reapply height when address bar shows/hides
      if (chatContainerRef.current) {
        chatContainerRef.current.style.height = `${window.innerHeight}px`;
      }
    };

    window.addEventListener("scroll", handleIOSScroll);

    return () => {
      // Clean up
      document.body.style.overflow = "";
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("scroll", handleIOSScroll);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message and API call logic
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Send the user's message to the server
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server.");
      }

      const data = await response.json();

      // Add the assistant's response to the chat
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.text,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error fetching chat response:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-white"
      style={{ height: "var(--app-height, 100vh)" }}
      ref={chatContainerRef}
    >
      {/* Fixed Header - always visible */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 p-2 sm:p-4 shadow-sm z-10">
        <div className="flex items-center">
          <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
          <div>
            <h2 className="text-base sm:text-lg font-medium text-slate-800">
              AI Legal Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ask questions about legal procedures or cases
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Chat Area - only this part scrolls */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 bg-slate-50/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-2 py-1.5 sm:px-4 sm:py-2 ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
              }`}
            >
              <p className="text-xs sm:text-sm break-words whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-800 rounded-lg px-3 py-2 border border-slate-200 rounded-bl-none shadow-sm">
              <div className="flex space-x-1 items-center h-5">
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-500 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm border border-red-200 shadow-sm">
              <span className="mr-1">Error:</span> {error}
              <button
                onClick={() => setError(null)}
                className="ml-1 sm:ml-2 underline text-blue-500 hover:text-blue-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area - always visible at bottom */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white p-2 sm:p-3 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-1.5 sm:space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 min-w-0 rounded-full border border-slate-300 px-2.5 py-2 text-xs sm:text-sm bg-white text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 flex items-center justify-center rounded-full w-8 h-8 sm:w-10 sm:h-10 min-w-0 bg-blue-600 hover:bg-blue-700 text-white p-0 shadow-md"
          >
            <Send className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
