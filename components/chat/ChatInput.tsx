// components/chat/ChatInput.tsx
"use client";

import { ChangeEvent, FormEvent, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type your message..."
          disabled={disabled}
          className="
          border
        border-gray-300
         rounded-lg 
         flex-1 px-4 
         py-2 
         focus:outline-none 
         focus:ring-2
         focus:ring-blue-500
         disabled:opacity-50
         "
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="rounder-lg bg-blue-300 text-white px-6 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
}
