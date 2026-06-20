"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet"
import { CustomEventDetail } from "@/components/custom-event-detail"
import { SmallLoader } from "@/components/small-loader"
import { Id } from "@/convex/_generated/dataModel"

export function PublishedCustomEventsSection() {
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [selectedEventId, setSelectedEventId] = React.useState<Id<"customEvents"> | null>(null)

  const publishedEvents = useQuery(api.customEvents.listCustomEvents, {
    status: "published",
    limit: 10,
  })

  if (!publishedEvents || publishedEvents.length === 0) {
    return null
  }

  const sortedByStartTime = [...publishedEvents].sort((a, b) => a.startTime - b.startTime)

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            ⭐ Featured Events
          </h2>
        </div>

        {/* Golden Styled Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedByStartTime.map((event) => (
            <button
              key={event._id}
              onClick={() => {
                setSelectedEventId(event._id as Id<"customEvents">)
                setDetailOpen(true)
              }}
              className="group relative overflow-hidden rounded-lg border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-950/40 to-yellow-900/20 hover:from-yellow-900/60 hover:to-yellow-800/40 transition-all p-4 text-left"
            >
              {/* Golden accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-transparent" />

              <div className="space-y-2">
                {/* Event Title and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-yellow-300 transition-colors">
                      {event.homeTeam} vs {event.awayTeam}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{event.title}</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/50 text-[9px] font-bold shrink-0">
                    FEATURED
                  </Badge>
                </div>

                {/* Event Meta */}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-2 border-t border-yellow-500/20">
                  <span>{event.competition}</span>
                  <span>•</span>
                  <span>{event.totalMarkets} markets</span>
                </div>

                {/* View Button */}
                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEventId(event._id as Id<"customEvents">)
                      setDetailOpen(true)
                    }}
                  >
                    View Markets
                  </Button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:w-96 flex flex-col gap-0 p-0 border-l border-border">
          <SheetHeader className="px-6 pt-6 pb-3 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Event Details</h2>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedEventId && (
              <CustomEventDetail
                eventId={selectedEventId}
                onBack={() => setDetailOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
