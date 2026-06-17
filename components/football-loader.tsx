"use client"

import { cn } from "@/lib/utils"

interface FootballLoaderProps {
  label?: string
  size?: "default" | "large"
  className?: string
}

export function FootballLoader({
  label = "Loading markets…",
  size = "default",
  className,
}: FootballLoaderProps) {
  const ballSize = size === "large" ? "h-40 w-40 sm:h-52 sm:w-52" : "h-28 w-28 sm:h-36 sm:w-36"

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 py-16",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="football-loader-scene" style={{ perspective: "900px" }}>
        <div className={cn("football-loader-ball", ballSize)}>
          <div className="football-loader-sphere" />
          <div className="football-loader-shine" aria-hidden="true" />
        </div>
        <div className="football-loader-shadow" aria-hidden="true" />
      </div>

      {label && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}
