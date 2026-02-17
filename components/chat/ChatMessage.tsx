// components/chat/ChatMessage.tsx
import { Message } from "@/types";
import { TimeStamp } from "./TimeStamp";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`
         max-w-[70%] rounded-lg px-4 py-2 ${isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 dark:bg-grey-800 dark:text-gray-100"}
        `}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <TimeStamp
          timestamp={new Date(message.timestamp)}
          className="text-xs opacity-70 mt-1 block"
        />
      </div>
    </div>
  );
}
