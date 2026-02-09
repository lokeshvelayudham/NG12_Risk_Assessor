"use client"

import * as React from "react"
import { Send } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  role: "user" | "agent"
  content: string
  citations?: any[]
}

export function ChatInterface() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get session from URL or default. 
  const sessionId = searchParams.get("session_id") || "default-session-1"
  
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  // Load history on mount or session change
  React.useEffect(() => {
    const fetchHistory = async () => {
      setMessages([]) // Clear previous messages while loading
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/chat/${sessionId}/history`)
        if (res.ok) {
          const data = await res.json()
          const parsedMessages: Message[] = data.history.map((line: string) => {
             if (line.startsWith("User: ")) return { role: "user", content: line.replace("User: ", "") }
             if (line.startsWith("Agent: ")) return { role: "agent", content: line.replace("Agent: ", "") }
             return { role: "agent", content: line }
          })
          if (parsedMessages.length > 0) {
             setMessages(parsedMessages)
          } else {
             setMessages([{ role: "agent", content: "Hello! I am your NICE NG12 assistant. How can I help you today?" }])
          }
        }
      } catch (e) {
        console.error("Failed to load history", e)
      }
    }
    fetchHistory()
  }, [sessionId])

  const handleClear = async () => {
    try {
        await fetch(`http://127.0.0.1:8000/api/chat/${sessionId}`, { method: "DELETE" })
        setMessages([{ role: "agent", content: "Chat history cleared. How can I help?" }])
    } catch (e) {
        console.error("Failed to clear history", e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.answer,
          citations: data.citations,
        },
      ])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Sorry, I encountered an error connecting to the server." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Chat Assistant</CardTitle>
            <CardDescription>Ask questions about cancer guidelines.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear}>Clear Chat</Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg p-2",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar>
                  <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                  <AvatarImage src={message.role === "agent" ? "/bot-avatar.png" : undefined} />
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.citations && message.citations.length > 0 && (
                     <div className="mt-2 text-xs text-muted-foreground border-t pt-2 space-y-1">
                        <p className="font-semibold mb-1">References:</p>
                        {message.citations.map((cite: any, i: number) => (
                           <div key={i} className="bg-background/50 p-2 rounded border mb-1">
                              <span className="font-medium text-foreground block mb-0.5">
                                 [{cite.source} p.{cite.page}]
                              </span>
                              <p className="text-xs opacity-90 leading-relaxed">
                                 "{cite.excerpt}"
                              </p>
                           </div>
                        ))}
                     </div>
                  )}
                </div>
              </div>
            ))}
             {isLoading && (
                 <div className="flex w-full items-start gap-2 rounded-lg p-2">
                    <Avatar><AvatarFallback>AI</AvatarFallback></Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2 text-sm">Thinking...</div>
                 </div>
             )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
