"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const FOOTBALL_ICON_URL = "https://openmoji.org/data/color/svg/26BD.svg"

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
  const iconSize = size === "large" ? 208 : 144
  const iconClass =
    size === "large"
      ? "h-40 w-40 sm:h-52 sm:w-52"
      : "h-28 w-28 sm:h-36 sm:w-36"

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
      <Image
        src={FOOTBALL_ICON_URL}
        alt=""
        width={iconSize}
        height={iconSize}
        unoptimized
        className={cn(iconClass, "animate-spin drop-shadow-lg")}
        aria-hidden="true"
      />

      {label && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}
