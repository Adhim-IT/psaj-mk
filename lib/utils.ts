import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a plain text excerpt from HTML content
 */
export function extractExcerpt(content: string, maxLength = 160): string {
  if (!content) return ""

  // Remove HTML tags
  const plainText = content.replace(/<[^>]+>/g, "")

  // Remove extra whitespace
  const trimmedText = plainText.replace(/\s+/g, " ").trim()

  if (trimmedText.length <= maxLength) {
    return trimmedText
  }

  // Find the last space before maxLength
  const lastSpace = trimmedText.lastIndexOf(" ", maxLength)

  // If no space found, just cut at maxLength
  const cutPoint = lastSpace > 0 ? lastSpace : maxLength

  return trimmedText.substring(0, cutPoint) + "..."
}

/**
 * Calculates reading time in minutes based on content length
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  if (!content) return 1

  // Remove HTML tags
  const plainText = content.replace(/<[^>]+>/g, "")

  // Count words
  const wordCount = plainText.split(/\s+/).filter(Boolean).length

  // Calculate reading time
  const readingTime = Math.ceil(wordCount / wordsPerMinute)

  // Return at least 1 minute
  return Math.max(1, readingTime)
}

/**
 * Formats a date with Intl.DateTimeFormat
 */
export function formatDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("id-ID", options).format(dateObj)
}

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} detik yang lalu`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} minggu yang lalu`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} bulan yang lalu`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} tahun yang lalu`
}

