import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "@/components/landing-page/styles.css"
import { Suspense } from "react"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "vhionex (Pvt Ltd) - Your AI-first Development Partner",
  description:
    "vhionex (Pvt Ltd) builds high-quality, scalable platforms—client portals, marketplaces, AI automations, and SaaS—using the best tools for the job, no shortcuts.",
  icons: {
    icon: [
      { url: "/vhionex-new.png", type: "image/png", sizes: "any" },
      { url: "/vhionex-new.png", type: "image/png", sizes: "32x32" },
      { url: "/vhionex-new.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/vhionex-new.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/vhionex-new.png", type: "image/png" }],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
