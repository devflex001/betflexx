"use client"

import { useEffect } from "react"

/**
 * Suppresses the browser's native "Leave site? Changes you made may not be saved."
 * dialog across the entire app. All navigation in this project is programmatic
 * (SPA routing, logout redirects) — there is no meaningful unsaved-form state
 * that warrants this prompt.
 */
export function SuppressBeforeUnload() {
  useEffect(() => {
    const suppress = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      delete e.returnValue
    }
    window.addEventListener("beforeunload", suppress)
    return () => window.removeEventListener("beforeunload", suppress)
  }, [])

  return null
}
