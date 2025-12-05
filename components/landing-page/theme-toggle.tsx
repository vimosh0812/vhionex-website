"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Return non-interactive placeholder during SSR/mounting to prevent unintended clicks
  if (!mounted) {
    return <div className={`p-2 rounded-full ${className}`} aria-hidden="true" />
  }

  // Use resolvedTheme for immediate updates once mounted
  const isDarkMode = resolvedTheme === "dark"

  const handleToggle = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setTheme(newTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors bg-transparent ${
        isDarkMode ? "hover:bg-gray-800/20" : "hover:bg-gray-200/50"
      } ${className}`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-white" />
      ) : (
        <Moon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  )
}
