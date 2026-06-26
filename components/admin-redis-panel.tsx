"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  RefreshCw,
  Trash2,
  Activity,
  Key,
  Zap,
  Clock,
  Database,
  ShieldAlert,
} from "lucide-react"
import type { RedisStats } from "@/app/api/admin/redis-stats/route"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FlushScope =
  | "matches"
  | "rate-limits"
  | "mpesa"
  | "paystack"
  | "admin"
  | "locks"
  | "all"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 5) return "just now"
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
}

function ttlLabel(ttl: number): string {
  if (ttl < 0) return "no expiry"
  if (ttl < 60) return `${ttl}s`
  return `${Math.floor(ttl / 60)}m ${ttl % 60}s`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <span className="text-xl font-extrabold font-mono leading-none tracking-tight">
          {value}
        </span>
      )}
      {sub && !loading && (
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Flush button with confirmation dialog
// ---------------------------------------------------------------------------

function FlushButton({
  scope,
  label,
  description,
  onFlushed,
}: {
  scope: FlushScope
  label: string
  description: string
  onFlushed: () => void
}) {
  const [flushing, setFlushing] = React.useState(false)

  async function handleFlush() {
    setFlushing(true)
    try {
      const res = await fetch("/api/admin/redis-flush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Unknown error")
      toast.success(`Flushed ${data.deleted} key${data.deleted !== 1 ? "s" : ""} (${label})`)
      onFlushed()
    } catch (err) {
      toast.error(`Flush failed: ${String(err)}`)
    } finally {
      setFlushing(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-[11px] font-medium gap-1.5 border-border"
          disabled={flushing}
        >
          <Trash2 className="size-3" />
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Flush — {label}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleFlush}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Flush
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function AdminRedisPanel() {
  const [stats, setStats] = React.useState<RedisStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshedAt, setRefreshedAt] = React.useState<string | null>(null)

  async function fetchStats(silent = false) {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/redis-stats")
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.message ?? `HTTP ${res.status}`)
      }
      const data: RedisStats = await res.json()
      setStats(data)
      setRefreshedAt(data.fetchedAt)
    } catch (err) {
      setError(String(err))
      if (!silent) toast.error("Could not load Redis stats")
    } finally {
      setLoading(false)
    }
  }

  // Initial load only — no polling to save Redis commands
  React.useEffect(() => {
    fetchStats()
  }, [])

  const isOnline = !error && (stats !== null || loading)

  // Namespace rows sorted by count desc
  const namespaces = stats?.namespaces ?? []
  const totalNsKeys = namespaces.reduce((s, n) => s + n.count, 0)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight">Redis</h1>
            <p className="text-xs text-muted-foreground">
              Upstash cache — manual refresh only
              {refreshedAt && (
                <> · last fetched <span className="font-semibold text-foreground">{relativeTime(refreshedAt)}</span></>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status badge */}
            {!loading && (
              <Badge
                variant="outline"
                className={
                  isOnline
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-bold"
                }
              >
                {isOnline ? "Online" : "Unreachable"}
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 font-medium border-border"
              onClick={() => fetchStats()}
              disabled={loading}
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatTile
            label="Total Keys"
            value={stats?.totalKeys ?? "—"}
            sub="across all namespaces"
            icon={Key}
            loading={loading}
          />
          <StatTile
            label="Latency"
            value={stats ? `${stats.latencyMs} ms` : "—"}
            sub="round-trip ping"
            icon={Activity}
            loading={loading}
          />
          <StatTile
            label="Memory"
            value={
              stats?.memoryUsedHuman ??
              (stats?.memoryUsedBytes ? formatBytes(stats.memoryUsedBytes) : "—")
            }
            sub="used heap"
            icon={Database}
            loading={loading}
          />
          <StatTile
            label="Commands"
            value={
              stats?.upstashCommandsToday != null
                ? stats.upstashCommandsToday.toLocaleString()
                : "—"
            }
            sub="total processed"
            icon={Zap}
            loading={loading}
          />
        </div>

        {/* Namespace breakdown + flush actions */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider">
              Key namespaces
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {loading ? "—" : `${totalNsKeys} betflexx: keys`}
            </span>
          </div>

          <div className="divide-y divide-border">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              : namespaces.map((ns) => {
                  const pct =
                    totalNsKeys > 0
                      ? Math.round((ns.count / totalNsKeys) * 100)
                      : 0

                  return (
                    <div
                      key={ns.namespace}
                      className="flex items-center justify-between px-4 py-3 gap-4 text-xs hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="font-medium text-foreground truncate">{ns.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                          betflexx:{ns.namespace}:*
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Mini bar */}
                        {totalNsKeys > 0 && (
                          <div className="hidden sm:flex items-center gap-1.5">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-7 text-right">
                              {pct}%
                            </span>
                          </div>
                        )}
                        <span className="font-bold font-mono w-8 text-right">{ns.count}</span>
                      </div>
                    </div>
                  )
                })}
          </div>
        </div>

        {/* Active rate-limit buckets */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-wider">
              Active rate-limit buckets
            </span>
            <span className="text-[10px] text-muted-foreground">
              {loading
                ? "—"
                : `${stats?.activeRateLimits.length ?? 0} active`}
            </span>
          </div>

          {loading ? (
            <div className="px-4 py-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : !stats?.activeRateLimits.length ? (
            <div className="px-4 py-5 text-center text-xs text-muted-foreground">
              No active rate-limit buckets
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-4">Key</th>
                    <th className="py-2.5 px-4 text-right">Hits</th>
                    <th className="py-2.5 px-4 text-right">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.activeRateLimits.map((bucket) => (
                    <tr
                      key={bucket.key}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono text-[11px] text-foreground max-w-xs truncate">
                        {bucket.key}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold font-mono">
                        {bucket.hits}
                      </td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-end gap-1 cursor-default">
                              <Clock className="size-3" />
                              {ttlLabel(bucket.ttl)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{bucket.ttl}s remaining</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Flush controls */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              Flush cache
            </span>
            <span className="text-[10px] text-muted-foreground">
              Scoped — never wipes full Redis DB
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <FlushButton
              scope="matches"
              label="Match cache"
              description="Deletes all cached match lists, details, odds, and market data. Next requests will re-fetch from Convex."
              onFlushed={() => fetchStats(true)}
            />
            <FlushButton
              scope="rate-limits"
              label="Rate limits"
              description="Clears all sliding-window counters. Use when testing or after a false positive flood block."
              onFlushed={() => fetchStats(true)}
            />
            <FlushButton
              scope="mpesa"
              label="M-Pesa keys"
              description="Clears M-Pesa idempotency records and cached status responses."
              onFlushed={() => fetchStats(true)}
            />
            <FlushButton
              scope="paystack"
              label="Paystack keys"
              description="Clears Paystack idempotency records so transactions can be re-initiated."
              onFlushed={() => fetchStats(true)}
            />
            <FlushButton
              scope="admin"
              label="Admin stats"
              description="Clears the admin stats cache. Will be repopulated on next admin dashboard load."
              onFlushed={() => fetchStats(true)}
            />
            <FlushButton
              scope="locks"
              label="Locks"
              description="Clears any stuck stampede protection locks. Safe to run if you suspect a lock leaked."
              onFlushed={() => fetchStats(true)}
            />
            <FlushButton
              scope="all"
              label="Flush all"
              description="Deletes every key under the betflexx: prefix. All caches will be cold until naturally repopulated. Rate limits reset too."
              onFlushed={() => fetchStats(true)}
            />
          </div>
        </div>

      </div>
    </TooltipProvider>
  )
}
