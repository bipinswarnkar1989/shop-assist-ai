// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ShopAssist AI</h1>
      <p className="text-xl mb-8 text-gray-600">
        Your intelligent e-commerce assistant
      </p>
      <Link
        href="/chat"
        className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
      >
        Start Chatting
      </Link>
    </main>
  );
}
