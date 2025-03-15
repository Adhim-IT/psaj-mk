"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
} from "lucide-react"

interface RichTextEditorProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  showPreview?: boolean
  error?: string
}

export function RichTextEditor({
  id = "rich-text-editor",
  label,
  value,
  onChange,
  placeholder = "Write your content here...",
  minHeight = "200px",
  showPreview = true,
  error,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Add to history when content changes significantly
  useEffect(() => {
    const lastHistory = history[historyIndex]
    if (value !== lastHistory) {
      // Only add to history if the change is significant (more than a few characters)
      if (Math.abs(value.length - lastHistory.length) > 3 || value.length === 0) {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(value)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
      }
    }
  }, [value, history, historyIndex])

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      onChange(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      onChange(history[historyIndex + 1])
    }
  }

  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    let formattedText = ""
    let cursorPosition = 0

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        cursorPosition = start + 2
        break
      case "italic":
        formattedText = `*${selectedText}*`
        cursorPosition = start + 1
        break
      case "list":
        formattedText = selectedText
          ? selectedText
              .split("\n")
              .map((line) => `- ${line}`)
              .join("\n")
          : "- "
        cursorPosition = start + 2
        break
      case "ordered-list":
        formattedText = selectedText
          ? selectedText
              .split("\n")
              .map((line, i) => `${i + 1}. ${line}`)
              .join("\n")
          : "1. "
        cursorPosition = start + 3
        break
      case "link":
        formattedText = `[${selectedText || "Link text"}](url)`
        cursorPosition = selectedText ? end + 3 : start + 11
        break
      case "image":
        formattedText = `![${selectedText || "Image alt text"}](url)`
        cursorPosition = selectedText ? end + 3 : start + 17
        break
      case "code":
        formattedText = selectedText.includes("\n") ? "```\n" + selectedText + "\n```" : "`" + selectedText + "`"
        cursorPosition = start + (selectedText.includes("\n") ? 4 : 1)
        break
      case "h1":
        formattedText = `# ${selectedText}`
        cursorPosition = start + 2
        break
      case "h2":
        formattedText = `## ${selectedText}`
        cursorPosition = start + 3
        break
      case "h3":
        formattedText = `### ${selectedText}`
        cursorPosition = start + 4
        break
      case "quote":
        formattedText = `> ${selectedText}`
        cursorPosition = start + 2
        break
      default:
        return
    }

    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)
    onChange(newValue)

    // Set cursor position after the operation is complete
    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start, start + formattedText.length)
      } else {
        textarea.setSelectionRange(cursorPosition, cursorPosition)
      }
    }, 0)
  }

  const renderMarkdown = (text: string) => {
    if (!text) return []

    return text
      .split("\n")
      .map((line, i) => {
        // Headings
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-2xl font-bold mt-4 mb-2">
              {line.substring(2)}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-xl font-bold mt-3 mb-2">
              {line.substring(3)}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-bold mt-2 mb-1">
              {line.substring(4)}
            </h3>
          )
        }

        // Blockquote
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-gray-300 pl-4 italic my-2">
              {renderInlineMarkdown(line.substring(2))}
            </blockquote>
          )
        }

        // Unordered list
        if (line.startsWith("- ")) {
          return <li key={i}>{renderInlineMarkdown(line.substring(2))}</li>
        }

        // Ordered list
        const orderedListMatch = line.match(/^(\d+)\.\s(.*)$/)
        if (orderedListMatch) {
          return <li key={i}>{renderInlineMarkdown(orderedListMatch[2])}</li>
        }

        // Code block
        if (line.startsWith("```")) {
          return null // Handle multi-line code blocks separately
        }

        // Regular paragraph (with inline formatting)
        return (
          <p key={i} className="my-2">
            {renderInlineMarkdown(line)}
          </p>
        )
      })
      .filter(Boolean)
  }

  const renderInlineMarkdown = (text: string) => {
    const content = text

    // Process inline elements
    const elements = []
    let lastIndex = 0
    let key = 0

    // Bold
    const boldRegex = /\*\*(.*?)\*\*/g
    let boldMatch
    while ((boldMatch = boldRegex.exec(content)) !== null) {
      if (boldMatch.index > lastIndex) {
        elements.push(content.substring(lastIndex, boldMatch.index))
      }
      elements.push(<strong key={key++}>{boldMatch[1]}</strong>)
      lastIndex = boldMatch.index + boldMatch[0].length
    }

    // Italic
    const italicRegex = /\*(.*?)\*/g
    let italicMatch
    while ((italicMatch = italicRegex.exec(content)) !== null) {
      if (italicMatch.index > lastIndex) {
        elements.push(content.substring(lastIndex, italicMatch.index))
      }
      elements.push(<em key={key++}>{italicMatch[1]}</em>)
      lastIndex = italicMatch.index + italicMatch[0].length
    }

    // Inline code
    const codeRegex = /`(.*?)`/g
    let codeMatch
    while ((codeMatch = codeRegex.exec(content)) !== null) {
      if (codeMatch.index > lastIndex) {
        elements.push(content.substring(lastIndex, codeMatch.index))
      }
      elements.push(
        <code key={key++} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
          {codeMatch[1]}
        </code>,
      )
      lastIndex = codeMatch.index + codeMatch[0].length
    }

    // Links
    const linkRegex = /\[(.*?)\]$$(.*?)$$/g
    let linkMatch
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      if (linkMatch.index > lastIndex) {
        elements.push(content.substring(lastIndex, linkMatch.index))
      }
      elements.push(
        <a key={key++} href={linkMatch[2]} className="text-blue-600 hover:underline">
          {linkMatch[1]}
        </a>,
      )
      lastIndex = linkMatch.index + linkMatch[0].length
    }

    // Images
    const imageRegex = /!\[(.*?)\]$$(.*?)$$/g
    let imageMatch
    while ((imageMatch = imageRegex.exec(content)) !== null) {
      if (imageMatch.index > lastIndex) {
        elements.push(content.substring(lastIndex, imageMatch.index))
      }
      elements.push(
        <img
          key={key++}
          src={imageMatch[2] || "/placeholder.svg"}
          alt={imageMatch[1]}
          className="max-w-full h-auto my-2 rounded"
        />,
      )
      lastIndex = imageMatch.index + imageMatch[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(content.substring(lastIndex))
    }

    return elements.length > 0 ? elements : content
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="rounded-md border border-input">
        <div className="bg-muted/50 p-1 flex flex-wrap gap-1 border-b">
          <div className="flex gap-1 mr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 border-r border-gray-300 mx-1"></div>

          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("h1")} title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("h2")} title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("h3")} title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="h-6 border-r border-gray-300 mx-1"></div>

          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("bold")} title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("italic")} title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("code")} title="Code">
            <Code className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("quote")} title="Quote">
            <Quote className="h-4 w-4" />
          </Button>

          <div className="h-6 border-r border-gray-300 mx-1"></div>

          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("list")} title="Bullet List">
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting("ordered-list")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="h-6 border-r border-gray-300 mx-1"></div>

          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("link")} title="Link">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("image")} title="Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          id={id}
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`font-mono border-0 rounded-t-none min-h-[${minHeight}]`}
          placeholder={placeholder}
          style={{ minHeight }}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {showPreview && value && (
        <div className="mt-4">
          <Label>Preview</Label>
          <div className="mt-1 p-4 border rounded-md bg-white overflow-auto">
            <div className="prose prose-sm max-w-none">{renderMarkdown(value)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

