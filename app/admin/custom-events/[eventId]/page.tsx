"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { AdminLayout } from "@/components/admin-layout"
import { CustomEventDetail } from "@/components/custom-event-detail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, Search, ChevronDown } from "lucide-react"
import { SmallLoader } from "@/components/small-loader"

export default function CustomEventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string
  const [search, setSearch] = React.useState("")
  const [filterMarkets, setFilterMarkets] = React.useState("All")

  const event = useQuery(api.customEvents.getCustomEvent, {
    eventId: eventId as Id<"customEvents">,
  })

  const handleBack = () => {
    router.push("/admin/custom-events")
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 h-8"
              onClick={handleBack}
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
          </div>
          <SmallLoader />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 h-8"
            onClick={handleBack}
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-sm bg-muted/50 border-0"
            />
          </div>

          {/* Filter Dropdowns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5"
              >
                All Markets
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setFilterMarkets("All")}>
                All Markets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMarkets("Active")}>
                Active Markets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMarkets("Inactive")}>
                Inactive Markets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5"
              >
                All
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>Main Markets</DropdownMenuItem>
              <DropdownMenuItem>Additional Markets</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5"
              >
                All Leagues
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>All Leagues</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Detail View */}
        <div className="border border-border rounded-lg bg-card p-4 h-[calc(100vh-280px)]">
          <CustomEventDetail
            eventId={eventId as Id<"customEvents">}
            onBack={handleBack}
            onEdit={() => {
              // Edit functionality can be added later
            }}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
