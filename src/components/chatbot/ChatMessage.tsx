import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatMessage = ({ message, isBot, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isBot ? "flex-row" : "flex-row-reverse"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isBot ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
      )}>
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>
      
      <div className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isBot ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2",
          isBot 
            ? "bg-muted text-foreground" 
            : "bg-primary text-primary-foreground"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
