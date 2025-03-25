"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, Clock, User, Tag, Share2, Bookmark, BookmarkCheck } from "lucide-react"
import type { ListArticle } from "@/types"
import { getWriters } from "@/lib/list-artikel"

interface DetailArtikelProps {
  article: ListArticle
}

interface Writer {
  id: string
  name: string
}

export default function DetailArtikel({ article }: DetailArtikelProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [writer, setWriter] = useState<Writer | null>(null)

  useEffect(() => {
    const fetchWriter = async () => {
      try {
        const result = await getWriters()
        if (result.writer) {
          const foundWriter = result.writer.find((w) => w.id === article.writer_id)
          if (foundWriter) {
            setWriter(foundWriter)
          }
        }
      } catch (error) {
        console.error("Error fetching writer:", error)
      }
    }

    fetchWriter()

    // Check if article is bookmarked in localStorage
    const bookmarkedArticles = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")
    setIsBookmarked(bookmarkedArticles.includes(article.id))
  }, [article.writer_id, article.id])

  const toggleBookmark = () => {
    const newBookmarkState = !isBookmarked
    setIsBookmarked(newBookmarkState)

    // Save bookmark state to localStorage
    const bookmarkedArticles = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")

    if (newBookmarkState) {
      if (!bookmarkedArticles.includes(article.id)) {
        bookmarkedArticles.push(article.id)
      }
    } else {
      const index = bookmarkedArticles.indexOf(article.id)
      if (index > -1) {
        bookmarkedArticles.splice(index, 1)
      }
    }

    localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarkedArticles))
  }

  const shareArticle = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err))
    }
  }

  // Function to format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return ""

    const dateObj = typeof date === "string" ? new Date(date) : date

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dateObj)
  }

  // Calculate read time based on content length
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200 // Average reading speed
    const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readTime} min read`
  }

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-[400px] w-full">
        <Image
          src={article.thumbnail || "/placeholder.svg"}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {article.categories &&
            article.categories.map((category) => (
              <span key={category.id} className="bg-[#3182CE] text-white text-xs font-semibold px-2 py-1 rounded">
                {category.name}
              </span>
            ))}

          {article.tags &&
            article.tags.map((tag) => (
              <span key={tag.id} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                <Tag size={12} className="mr-1" />
                {tag.name}
              </span>
            ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {writer ? (
                <span className="font-bold text-gray-500">{writer.name.charAt(0)}</span>
              ) : (
                <User size={20} className="text-gray-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <User size={14} />
                <span>{writer?.name || "Unknown Writer"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{calculateReadTime(article.content)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareArticle}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Share article"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={toggleBookmark}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
            >
              {isBookmarked ? <BookmarkCheck size={18} className="text-[#3182CE]" /> : <Bookmark size={18} />}
            </button>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-a:text-[#3182CE]"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold mb-2">Bagikan Artikel</h3>
          <div className="flex gap-2">
            <button
              onClick={shareArticle}
              className="px-4 py-2 bg-[#3182CE] text-white rounded-md hover:bg-[#2c6cb0] transition-colors flex items-center gap-2"
            >
              <Share2 size={16} />
              Bagikan
            </button>
            <button
              onClick={toggleBookmark}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                isBookmarked ? "bg-gray-100 text-[#3182CE]" : "bg-gray-100 hover:bg-gray-200 transition-colors"
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck size={16} />
                  Tersimpan
                </>
              ) : (
                <>
                  <Bookmark size={16} />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

