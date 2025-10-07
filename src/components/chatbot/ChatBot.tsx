import { useState, useEffect, useRef } from "react";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! I'm your Lease Agent assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('langgraph-chat', {
        body: {
          message: text,
          conversationId,
        }
      });

      if (error) throw error;

      // Add bot response
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.response || data.message || "I'm sorry, I couldn't process that request.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50",
          "transition-transform hover:scale-110"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold">Lease Agent Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-dark"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isBot={message.isBot}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </Card>
      )}
    </>
  );
};
