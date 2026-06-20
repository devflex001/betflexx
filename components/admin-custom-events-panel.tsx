"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomEventEditor } from "@/components/custom-event-editor"
import { CustomEventsList } from "@/components/custom-events-list"
import { CustomEventDetail } from "@/components/custom-event-detail"
import { Plus } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

type ViewMode = "list" | "detail"

export function AdminCustomEventsPanel() {
  const [tab, setTab] = React.useState<"draft" | "published">("draft")
  const [viewMode, setViewMode] = React.useState<ViewMode>("list")
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null)
  const [editorOpen, setEditorOpen] = React.useState(false)

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    setViewMode("detail")
  }

  const handleBackFromDetail = () => {
    setViewMode("list")
    setSelectedEventId(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Custom Events</h1>
          <p className="text-xs text-muted-foreground">Create and manage custom betting events</p>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs font-semibold gap-1.5"
          onClick={() => setEditorOpen(true)}
        >
          <Plus className="size-3.5" />
          Create Event
        </Button>
      </div>

      {/* Main Content */}
      {viewMode === "list" ? (
        <>
          {/* Tabs */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as "draft" | "published")}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="draft" className="text-xs">
                <span>Drafts</span>
              </TabsTrigger>
              <TabsTrigger value="published" className="text-xs">
                <span>Published</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Events List */}
          <div className="border border-border rounded-lg bg-card p-4">
            <CustomEventsList
              status={tab}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </>
      ) : (
        <>
          {/* Detail View */}
          <div className="border border-border rounded-lg bg-card p-4 h-[calc(100vh-250px)]">
            {selectedEventId && (
              <CustomEventDetail
                eventId={selectedEventId as Id<"customEvents">}
                onBack={handleBackFromDetail}
                onEdit={() => {
                  // Could implement edit mode in detail view if needed
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Editor Modal */}
      <CustomEventEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSuccess={() => {
          setEditorOpen(false)
          setTab("draft")
          setViewMode("list")
        }}
      />
    </div>
  )
}
