"use client"
import type { PortfolioItem } from "@/utils/csv-parser"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface PortfolioGridProps {
  items: PortfolioItem[]
}

export default function PortfolioMasonryGridFinal({ items }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/portfolio/${item.slug}`}
          className="card overflow-hidden rounded-3xl bg-white dark:bg-[#272829] border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-lg h-full cursor-pointer block"
        >
          <div className="block h-full flex flex-col">
            <div className="relative overflow-hidden">
              <Image
                src={item.mainImage || "/placeholder.svg?height=600&width=800&query=project"}
                alt={item.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
              />
              {item.tags && item.tags.length > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="px-2 py-1 bg-black/50 dark:bg-black/70 backdrop-blur-sm rounded-full text-xs text-white">
                    {item.tags[0]}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 flex flex-col flex-grow">
              <h3 className="font-medium text-gray-900 dark:text-white text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{item.shortDescription}</p>
              <div className="inline-flex items-center text-[#7A7FEE] text-sm font-medium mt-auto group">
                View Case Study{" "}
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
