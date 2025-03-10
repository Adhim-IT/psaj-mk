"use client"

import { useState, useEffect } from "react"
import { extractYouTubeId, isValidYouTubeUrl } from "@/lib/youtube"

interface YouTubePreviewProps {
  url: string
}

export function YouTubePreview({ url }: YouTubePreviewProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (url) {
      const valid = isValidYouTubeUrl(url)
      setIsValid(valid)

      if (valid) {
        const id = extractYouTubeId(url)
        setVideoId(id)
      } else {
        setVideoId(null)
      }
    } else {
      setIsValid(false)
      setVideoId(null)
    }
  }, [url])

  if (!url) {
    return null
  }

  if (!isValid) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">Masukkan URL YouTube yang valid</div>
    )
  }

  if (!videoId) {
    return null
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      ></iframe>
    </div>
  )
}

