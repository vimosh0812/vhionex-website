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

  // Use resolvedTheme for immediate updates, fallback to light for SSR
  const isDarkMode = mounted ? resolvedTheme === "dark" : false

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
      {mounted ? (
        isDarkMode ? (
          <Sun className="h-5 w-5 text-white" />
        ) : (
          <Moon className="h-5 w-5 text-gray-800" />
        )
      ) : (
        <Moon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  )
}
