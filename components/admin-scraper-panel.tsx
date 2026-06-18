"use client"

import * as React from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SmallLoader } from "@/components/small-loader"
import { toast } from "sonner"
import { PlayCircle, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScraperTerminal } from "@/components/scraper-terminal"
import { useMediaQuery } from "@/hooks/use-media-query"

const AVAILABLE_SPORTS = [
  { id: "football", label: "Football" },
  { id: "basketball", label: "Basketball" },
  { id: "tennis", label: "Tennis" },
  { id: "volleyball", label: "Volleyball" },
  { id: "american_football", label: "American Football" },
  { id: "ice_hockey", label: "Ice Hockey" },
]

const MATCH_LIMITS = [
  { value: "20", label: "20 matches" },
  { value: "50", label: "50 matches" },
  { value: "100", label: "100 matches" },
  { value: "200", label: "200 matches" },
  { value: "300", label: "300 matches" },
  { value: "500", label: "500 matches" },
]

export function AdminScraperPanel() {
  const overview = useQuery(api.scraper.getAdminOverview)
  const updateSettings = useMutation(api.scraper.updateSettings)
  const triggerNow = useMutation(api.scraper.triggerNow)

  const [selectedSport, setSelectedSport] = React.useState<string>("")
  const [cadenceMinutes, setCadenceMinutes] = React.useState<string>("")
  const [dateWindowDays, setDateWindowDays] = React.useState<string>("")
  const [matchLimit, setMatchLimit] = React.useState<string>("")
  const [saving, setSaving] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [showTerminal, setShowTerminal] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const settings = overview?.settings
  const currentRun = overview?.runs?.[0]
  const isCurrentlyRunning = currentRun?.status === "running"

  // Initialize form with settings
  React.useEffect(() => {
    if (settings) {
      setSelectedSport(settings.selectedSports?.[0] ?? "football")
      setCadenceMinutes(String(settings.cadenceMinutes ?? 5))
      setDateWindowDays(String(settings.dateWindowDays ?? 2))
      setMatchLimit(String((settings as any).matchLimit ?? 50))
    }
  }, [settings])

  // Auto-open terminal when scraper starts running
  React.useEffect(() => {
    if (isCurrentlyRunning && !showTerminal) {
      setShowTerminal(true)
    }
  }, [isCurrentlyRunning, showTerminal])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings({
        enabled: true,
        cadenceMinutes: Number(cadenceMinutes),
        dateWindowDays: Number(dateWindowDays),
        selectedSports: [selectedSport],
        matchLimit: Number(matchLimit),
      })
      toast.success("Settings saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleRunNow = async () => {
    setRunning(true)
    setShowTerminal(true)
    try {
      await triggerNow({})
      toast.success("Scraper started")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start scraper")
      setShowTerminal(false)
    } finally {
      setRunning(false)
    }
  }

  if (!overview) {
    return <SmallLoader />
  }

  const sportLabel = AVAILABLE_SPORTS.find(s => s.id === selectedSport)?.label || selectedSport

  const TerminalContent = (
    <ScraperTerminal 
      runId={currentRun?._id ?? null} 
      isRunning={isCurrentlyRunning} 
    />
  )

  return (
    <div className="space-y-4 py-4 px-4">
      {/* Minimal Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold">Sports Scraper</h1>
        </div>
        <Badge 
          variant={isCurrentlyRunning ? "secondary" : "outline"}
          className="text-[10px] uppercase"
        >
          {isCurrentlyRunning ? "● Running" : "● Idle"}
        </Badge>
      </div>

      {/* Main Controls - Compact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Sport Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Sport</label>
          <Select value={selectedSport} onValueChange={setSelectedSport} disabled={isCurrentlyRunning}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_SPORTS.map((sport) => (
                <SelectItem key={sport.id} value={sport.id}>
                  {sport.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cadence */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Cadence (min)</label>
          <Input
            type="number"
            min="1"
            max="120"
            value={cadenceMinutes}
            onChange={(e) => setCadenceMinutes(e.target.value)}
            disabled={isCurrentlyRunning}
            className="h-8 text-xs focus-visible:ring-primary"
          />
        </div>

        {/* Date Window */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Window (days)</label>
          <Input
            type="number"
            min="1"
            max="14"
            value={dateWindowDays}
            onChange={(e) => setDateWindowDays(e.target.value)}
            disabled={isCurrentlyRunning}
            className="h-8 text-xs focus-visible:ring-primary"
          />
        </div>

        {/* Match Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Match Limit</label>
          <Select value={matchLimit} onValueChange={setMatchLimit} disabled={isCurrentlyRunning}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select limit" />
            </SelectTrigger>
            <SelectContent>
              {MATCH_LIMITS.map((limit) => (
                <SelectItem key={limit.value} value={limit.value}>
                  {limit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 sm:col-span-2 lg:col-span-1 items-end">
          <Button 
            size="sm" 
            className="h-8 text-xs font-semibold flex-1 gap-1"
            onClick={handleSave}
            disabled={saving || isCurrentlyRunning}
          >
            <Save className="size-3" />
            Save
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 text-xs font-semibold flex-1 gap-1"
            onClick={handleRunNow}
            disabled={running || isCurrentlyRunning}
          >
            <PlayCircle className="size-3" />
            Run
          </Button>
        </div>
      </div>

      {/* Status Row - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-card/50 rounded px-2 py-1.5 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Last Run</p>
          <p className="font-mono text-xs mt-0.5">
            {overview.settings.lastRunAt 
              ? new Date(overview.settings.lastRunAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Never"}
          </p>
        </div>
        <div className="bg-card/50 rounded px-2 py-1.5 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Next Run</p>
          <p className="font-mono text-xs mt-0.5">
            {new Date(overview.settings.nextRunAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="bg-card/50 rounded px-2 py-1.5 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Current Sport</p>
          <p className="font-semibold text-xs mt-0.5">{sportLabel}</p>
        </div>
        <div className="bg-card/50 rounded px-2 py-1.5 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Fetch Limit</p>
          <p className="font-mono text-xs mt-0.5">{matchLimit}</p>
        </div>
      </div>

      {/* Recent Runs Table - Minimal */}
      {overview.runs.length > 0 && (
        <div className="border border-border rounded-lg bg-card/50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold">Recent Activity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[600px]">
              <thead className="border-b border-border text-muted-foreground text-[10px] uppercase bg-card/30">
                <tr>
                  <th className="px-3 py-1.5 text-left">Time</th>
                  <th className="px-3 py-1.5 text-left">Status</th>
                  <th className="px-3 py-1.5 text-left">Sport</th>
                  <th className="px-3 py-1.5 text-right">Matches</th>
                  <th className="px-3 py-1.5 text-right">Markets</th>
                  <th className="px-3 py-1.5 text-right">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {overview.runs.slice(0, 5).map((run) => (
                  <tr key={run._id} className="hover:bg-card/20 transition-colors">
                    <td className="px-3 py-1.5 font-mono text-[10px]">
                      {new Date(run.startedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-1.5">
                      <Badge
                        variant={
                          run.status === "success"
                            ? "default"
                            : run.status === "running"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-[9px] uppercase"
                      >
                        {run.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5 text-[10px]">
                      {run.selectedSports?.join(", ") || "—"}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-[10px]">
                      {run.matchesUpserted}/{run.matchesDiscovered}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-[10px]">
                      {run.marketsUpserted}
                    </td>
                    <td className="px-3 py-1.5 text-right text-[10px]">
                      {run.failedMatches > 0 ? (
                        <Badge variant="destructive" className="text-[9px]">
                          {run.failedMatches}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Terminal Modal/Drawer */}
      {isDesktop ? (
        <Dialog open={showTerminal} onOpenChange={setShowTerminal}>
          <DialogContent className="max-w-2xl max-h-[70vh]">
            <DialogHeader>
              <DialogTitle className="text-sm">Live Activity</DialogTitle>
              <DialogDescription className="text-xs">
                Real-time scraper logs
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {TerminalContent}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={showTerminal} onOpenChange={setShowTerminal}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-sm">Live Activity</DrawerTitle>
              <DrawerDescription className="text-xs">
                Real-time scraper logs
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4 max-h-[60vh]">
              {TerminalContent}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
