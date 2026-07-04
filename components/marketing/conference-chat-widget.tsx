"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function ConferenceChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm the conference assistant. Ask me anything about the 2026 National HUBZone Conference.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/conference/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          sessionId,
          history: messages.filter((m) => m.role !== "assistant" || m.content !== messages[0].content),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get answer");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "I'm not sure about that. Please contact info@hubzonecouncil.org for help.",
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your question right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = async (messageIndex: number, helpful: boolean) => {
    // Client-side feedback is tracked locally; server-side feedback could be added later.
    setMessages((prev) =>
      prev.map((msg, index) =>
        index === messageIndex ? { ...msg, feedback: helpful ? "helpful" : "not-helpful" } : msg
      )
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-[90vw] max-w-md rounded-2xl border border-border bg-white shadow-2xl dark:bg-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#C8A951] to-[#a08840] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Conference Assistant</h3>
                <p className="text-xs text-white/80">Ask about the 2026 HUBZone Conference</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "mb-4 flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-[#C8A951] text-white rounded-br-md"
                      : "bg-white border border-border shadow-sm rounded-bl-md dark:bg-slate-800 dark:text-slate-100"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === "assistant" && index > 0 && (
                    <div className="mt-2 flex items-center gap-2 border-t border-border/50 pt-2">
                      <span className="text-xs text-muted-foreground">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(index, true)}
                        className="rounded p-1 hover:bg-green-50 dark:hover:bg-green-900/20"
                        aria-label="Helpful"
                      >
                        <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleFeedback(index, false)}
                        className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Not helpful"
                      >
                        <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-md bg-white border border-border px-4 py-2.5 shadow-sm dark:bg-slate-800">
                  <Loader2 className="h-4 w-4 animate-spin text-[#C8A951]" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border bg-white p-3 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sessions, tickets, venue..."
                className="h-10 flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 bg-[#C8A951] hover:bg-[#a08840] p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-[#C8A951] hover:bg-[#a08840] shadow-lg p-0"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
