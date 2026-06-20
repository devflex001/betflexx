"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SmallLoader } from "@/components/small-loader"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Search, Trash2, ListPlus } from "lucide-react"

interface CustomEventsListProps {
  onSelectEvent?: (eventId: string) => void
  status?: "draft" | "published"
}

export function CustomEventsList({
  onSelectEvent,
  status,
}: CustomEventsListProps) {
  const [search, setSearch] = React.useState("")

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

      {/* Desktop Table */}
      {events.length > 0 ? (
        <>
          <div className="hidden md:block overflow-x-auto -mx-1">
            <table className="w-full text-left text-xs border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[10px] font-semibold">
                  <th className="py-2 px-3 text-left">Start Time</th>
                  <th className="py-2 px-3 text-left">Matchup</th>
                  <th className="py-2 px-3 text-left">Competition</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-right">Markets</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-muted-foreground text-[10px]">
                      {formatTime(event.startTime)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      <div className="truncate">{event.homeTeam} vs {event.awayTeam}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{event.title}</div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground text-[10px]">
                      {event.competition}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        className={cn(
                          "text-[9px] font-semibold",
                          event.status === "draft"
                            ? "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/15 rounded-sm border border-yellow-500/20"
                            : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 rounded-sm border border-emerald-500/20"
                        )}
                      >
                        {event.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[10px]">
                      {event.totalMarkets}
                    </td>
                    <td className="py-2.5 px-3 text-right flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 px-2"
                        onClick={() => onSelectEvent?.(event._id)}
                      >
                        <ListPlus className="size-3" />
                        View
                      </Button>
                      {event.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(event._id, e)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2 p-3">
            {events.map((event) => (
              <div key={event._id} className="border border-border rounded-lg p-3 bg-card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground mb-1">
                      {event.homeTeam} vs {event.awayTeam}
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-1">
                      {event.title} • {event.competition}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {formatTime(event.startTime)}
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "text-[9px] font-semibold",
                      event.status === "draft"
                        ? "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/15 rounded-sm border border-yellow-500/20"
                        : "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 rounded-sm border border-emerald-500/20"
                    )}
                  >
                    {event.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {event.totalMarkets} markets
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 px-2"
                      onClick={() => onSelectEvent?.(event._id)}
                    >
                      <ListPlus className="size-3" />
                      View
                    </Button>
                    {event.status === "draft" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(event._id, e)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No events found</p>
          <p className="text-xs mt-1">Create your first custom event to get started</p>
        </div>
      )}
    </div>
  )
}
