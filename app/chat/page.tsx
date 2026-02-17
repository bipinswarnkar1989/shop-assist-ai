// app/chat/page.tsx
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <ChatContainer />
    </main>
  );
}
