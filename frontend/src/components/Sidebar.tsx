"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, MessageSquare, FileText, Home, Activity, Plus } from "lucide-react"
import { useState, useEffect } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSessionId = searchParams.get("session_id")
  
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    const fetchSessions = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/sessions")
            if (res.ok) {
                const data = await res.json()
                setSessions(data.sessions)
            }
        } catch (e) {
            console.error(e)
        }
    }
    // Poll or fetch on mount. Ideally should use SWR/React Query, but simple fetch is fine.
    fetchSessions()
    
    // Refresh every 5 seconds to catch new chats (hacky but works for demo)
    const interval = setInterval(fetchSessions, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleNewChat = () => {
     const newId = crypto.randomUUID()
     router.push(`/chat?session_id=${newId}`)
  }

  return (
    <div className={`pb-12 ${className}`}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            NG12 Risk Assessor
          </h2>
          <div className="space-y-1">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Overview
              </Link>
            </Button>
            <Button
              variant={pathname === "/assessment" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/assessment">
                <Activity className="mr-2 h-4 w-4" />
                New Assessment
              </Link>
            </Button>
            <Button
              onClick={handleNewChat}
              variant="outline"
              className="w-full justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            History
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
               {sessions.map((session) => (
                   <Button 
                        key={session.session_id}
                        variant={currentSessionId === session.session_id ? "secondary" : "ghost"} 
                        className="w-full justify-start font-normal text-muted-foreground truncate"
                        asChild
                    >
                        <Link href={`/chat?session_id=${session.session_id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span className="truncate w-[140px] text-left">
                                {new Date(session.last_active + "Z").toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                                }) || session.session_id}
                            </span>
                        </Link>
                   </Button>
               ))}
               {sessions.length === 0 && (
                   <p className="text-xs text-muted-foreground px-4">No history yet.</p>
               )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Sidebar className="w-full" />
      </SheetContent>
    </Sheet>
  )
}
