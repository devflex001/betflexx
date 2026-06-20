"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SmallLoader } from "@/components/small-loader"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Search, Trash2, Eye, Edit2, Share2, Clock, Users } from "lucide-react"

interface CustomEventsListProps {
  onSelectEvent?: (eventId: string) => void
  onEditEvent?: (eventId: string) => void
  status?: "draft" | "published"
}

export function CustomEventsList({
  onSelectEvent,
  onEditEvent,
  status,
}: CustomEventsListProps) {
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const events = useQuery(api.customEvents.listCustomEvents, {
    status,
    search: search || undefined,
    limit: 50,
  })

  const deleteEvent = useMutation(api.customEvents.deleteCustomEvent)

  const handleDelete = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure? This cannot be undone.")) return

    try {
      await deleteEvent({ eventId: eventId as any })
      toast.success("Event deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete")
    }
  }

  const handleEdit = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onEditEvent?.(eventId)
  }

  const handleSelect = (eventId: string) => {
    setSelectedId(eventId)
    onSelectEvent?.(eventId)
  }

  if (!events) {
    return <SmallLoader />
  }

  const formatTime = (ms: number) => {
    return new Date(ms).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 pl-8 text-xs bg-muted/50"
        />
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No events found</p>
          <p className="text-xs mt-1">Create your first custom event to get started</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)] border border-border rounded-lg">
          <div className="space-y-1 p-2">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => handleSelect(event._id)}
                className={cn(
                  "p-3 rounded-lg border border-transparent cursor-pointer transition-all hover:bg-muted/50 group",
                  selectedId === event._id && "border-primary bg-muted/70"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {event.homeTeam} vs {event.awayTeam}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.title}
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] font-semibold",
                      event.status === "draft"
                        ? "bg-yellow-500/15 text-yellow-600 border border-yellow-500/30 hover:bg-yellow-500/15"
                        : "bg-green-500/15 text-green-600 border border-green-500/30 hover:bg-green-500/15"
                    )}
                  >
                    {event.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatTime(event.startTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="size-3" />
                    {event.totalMarkets} markets
                  </div>
                  <div className="text-right">
                    {event.sport}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(event._id)
                    }}
                  >
                    <Eye className="size-3" />
                  </Button>
                  {event.status === "draft" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px]"
                        onClick={(e) => handleEdit(event._id, e)}
                      >
                        <Edit2 className="size-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(event._id, e)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
