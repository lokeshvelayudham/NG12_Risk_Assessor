import { ChatInterface } from "@/components/ChatInterface";
import { Suspense } from "react";

export default function ChatPage() {
  return (
    <div className="h-full p-4 lg:p-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Chat Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about the NG12 guidelines and get sourced answers.
        </p>
      </div>
      <Suspense fallback={<div>Loading chat...</div>}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}
