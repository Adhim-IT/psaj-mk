"use client"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface DialogImageProps {
  src: string | null
  alt: string
}

export function DialogImage({ src, alt }: DialogImageProps) {
  if (!src) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <div className="aspect-video relative">
          <Image src={src || "/placeholder.svg"} alt={alt} fill className="object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

