export interface PortfolioItem {
  slug: string
  title: string
  logo: string
  mainImage: string
  shortDescription: string
  projectUrl: string
  content: string
  sortOrder: string
  categories?: string[]
  tags?: string[] 
}

// Add a check for client-side environment at the top of the fetchPortfolioData function

export async function fetchPortfolioData(): Promise<PortfolioItem[]> {
  // Use a cache to avoid refetching the data multiple times
  if (typeof window !== "undefined" && (window as any).__portfolioCache) {
    return (window as any).__portfolioCache
  }

  try {
    let csvText: string

    if (typeof window === "undefined") {
      // Server-side: Read file directly from filesystem
      const fs = await import("fs/promises")
      const path = await import("path")
      const filePath = path.join(process.cwd(), "public", "data", "portfolio-sample.csv")
      csvText = await fs.readFile(filePath, "utf-8")
    } else {
      // Client-side: Use fetch
      const response = await fetch("/data/portfolio-sample.csv", {
        cache: "force-cache",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio CSV: ${response.status}`)
      }

      csvText = await response.text()
    }

    const parsedData = parseCSV(csvText)

    // Cache the data on the client side
    if (typeof window !== "undefined") {
      ;(window as any).__portfolioCache = parsedData
    }

    return parsedData
  } catch (error) {
    console.error("Error fetching portfolio data:", error)
    // Throw error instead of returning fallback data
    throw error
  }
}

function parseCSV(csvText: string): PortfolioItem[] {
  // Split the CSV into lines
  const lines = csvText.split("\n").filter((line) => line.trim()) // Remove empty lines

  if (lines.length < 2) {
    console.error("CSV file is empty or has no data rows")
    return []
  }

  // Extract headers (first line) - handle quoted headers
  const headerLine = lines[0]
  const headers: string[] = []
  let currentHeader = ""
  let insideQuotes = false

  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i]
    if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === "," && !insideQuotes) {
      headers.push(currentHeader.trim().replace(/^"/, "").replace(/"$/, ""))
      currentHeader = ""
    } else {
      currentHeader += char
    }
  }
  // Add the last header
  if (currentHeader.trim()) {
    headers.push(currentHeader.trim().replace(/^"/, "").replace(/"$/, ""))
  }

  console.log("Parsed CSV headers:", headers)

  // Map CSV columns to our interface properties
  const columnMap: Record<string, keyof PortfolioItem> = {
    Slug: "slug",
    Title: "title",
    Logo: "logo",
    "Main Image": "mainImage",
    "Short Description": "shortDescription",
    "Project URL": "projectUrl",
    Content: "content",
    "Sort Order": "sortOrder",
    Tags: "tags",
  }

  // Parse the data rows
  const items: PortfolioItem[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue // Skip empty lines

    // Handle CSV values that might contain commas within quotes
    const values: string[] = []
    let currentValue = ""
    let insideQuotes = false

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"/, "").replace(/"$/, ""))
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    // Add the last value
    values.push(currentValue.trim().replace(/^"/, "").replace(/"$/, ""))

    // Create the portfolio item
    const item: Partial<PortfolioItem> = {}

    // Map values to properties
    headers.forEach((header, index) => {
      const key = columnMap[header]
      if (key && index < values.length) {
        // Handle tags separately (comma-separated values)
        if (key === "tags") {
          const tagsValue = values[index]
          item.tags = tagsValue ? tagsValue.split(",").map((tag) => tag.trim()) : []
        } else {
          // Workaround for type assignment; TS complains because some PortfolioItem properties are not string
          // We'll handle 'categories' later, so treat other keys as string
          (item as any)[key] = values[index]
        }
      }
    })
    // Map tags to categories for filtering
    item.categories = mapTagsToCategories(item.tags || [], item as PortfolioItem)

    items.push(item as PortfolioItem)
  }

  console.log(`Parsed ${items.length} portfolio items from CSV`)

  // Sort by sortOrder
  const sorted = items.sort((a, b) => {
    return new Date(b.sortOrder).getTime() - new Date(a.sortOrder).getTime()
  })

  console.log("Sorted portfolio items (most recent first):", sorted.map((item) => ({ title: item.title, sortOrder: item.sortOrder })))

  return sorted
}

// Map tags from CSV to filter categories
function mapTagsToCategories(tags: string[], item: PortfolioItem): string[] {
  const categories: string[] = ["all"]

  // Map tags to category IDs based on filter categories
  tags.forEach((tag) => {
    const tagLower = tag.toLowerCase().trim()
    
    // AI Solutions
    if (tagLower === "ai" || tagLower.includes("ai solution")) {
      if (!categories.includes("ai")) categories.push("ai")
    }
    
    // Mobile Apps
    if (tagLower === "mobile app" || tagLower === "mobile" || tagLower.includes("mobile app")) {
      if (!categories.includes("mobile")) categories.push("mobile")
    }
    
    // Web Applications
    if (tagLower === "web app" || tagLower === "web application" || tagLower === "web" || tagLower.includes("web app")) {
      if (!categories.includes("web")) categories.push("web")
    }
    
    // Web3 & Blockchain
    if (tagLower === "web3" || tagLower === "blockchain" || tagLower === "crypto" || tagLower.includes("web3") || tagLower.includes("blockchain") || tagLower.includes("crypto")) {
      if (!categories.includes("web3")) categories.push("web3")
    }
    
    // Bubble Projects
    if (tagLower === "bubble" || tagLower.includes("bubble") || tagLower.includes("no-code") || tagLower.includes("nocode")) {
      if (!categories.includes("bubble")) categories.push("bubble")
    }
    
    // UX/UI Design
    if (tagLower === "design" || tagLower === "ui" || tagLower === "ux" || tagLower.includes("design") || tagLower.includes("ui") || tagLower.includes("ux")) {
      if (!categories.includes("design")) categories.push("design")
    }
  })

  // Fallback: if no tags match, infer from content (for backward compatibility)
  if (categories.length === 1) {
    const inferred = inferCategoriesFromContent(item)
    categories.push(...inferred.filter((cat) => cat !== "all"))
  }

  // Ensure at least one category besides "all"
  if (categories.length === 1) {
    categories.push("web")
  }

  return categories
}

// Fallback function to infer categories from content if tags are not available
function inferCategoriesFromContent(item: PortfolioItem): string[] {
  const categories: string[] = ["all"]
  const contentLower = (item.content || "").toLowerCase()
  const titleLower = (item.title || "").toLowerCase()
  const descriptionLower = (item.shortDescription || "").toLowerCase()

  if (
    contentLower.includes("web3") ||
    contentLower.includes("blockchain") ||
    titleLower.includes("web3") ||
    descriptionLower.includes("web3") ||
    contentLower.includes("crypto") ||
    titleLower.includes("crypto") ||
    titleLower.includes("blockchain")
  ) {
    categories.push("web3")
  }

  if (
    contentLower.includes("bubble") ||
    contentLower.includes("no-code") ||
    contentLower.includes("nocode") ||
    contentLower.includes("no code")
  ) {
    categories.push("bubble")
  }

  if (
    contentLower.includes("ai") ||
    contentLower.includes("artificial intelligence") ||
    titleLower.includes("ai") ||
    descriptionLower.includes("ai") ||
    titleLower.includes("content") ||
    descriptionLower.includes("ai-powered")
  ) {
    categories.push("ai")
  }

  if (
    contentLower.includes("mobile") ||
    contentLower.includes("ios") ||
    contentLower.includes("android") ||
    titleLower.includes("app")
  ) {
    categories.push("mobile")
  }

  if (
    contentLower.includes("design") ||
    contentLower.includes("ui") ||
    contentLower.includes("ux") ||
    contentLower.includes("interface")
  ) {
    categories.push("design")
  }

  // Default to "web" if no specific category is found
  if (categories.length === 1) {
    categories.push("web")
  }

  return categories
}
