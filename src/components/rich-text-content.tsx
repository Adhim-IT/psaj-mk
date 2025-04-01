"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { marked } from "marked"

// Define types for rich text content
type BlockType =
  | "paragraph"
  | "heading"
  | "list"
  | "listItem"
  | "quote"
  | "image"
  | "code"
  | "table"
  | "tableRow"
  | "tableCell"

interface RichTextNode {
  type: BlockType
  content?: RichTextNode[]
  text?: string
  level?: number // For headings (h1, h2, etc.)
  format?: string // For code blocks
  url?: string // For links and images
  alt?: string // For images
  attrs?: Record<string, any> // For additional attributes
  marks?: Array<{
    type: "bold" | "italic" | "underline" | "strike" | "code" | "link"
    attrs?: { href?: string }
  }>
}

interface RichTextContentProps {
  content: RichTextNode | RichTextNode[] | any
}

export function RichTextContent({ content }: RichTextContentProps) {
  // Handle different content formats
  if (!content) return null

  // If content is a string, process it for markdown-style formatting
  if (typeof content === "string") {
    // Process markdown-style formatting in the string
    return <div dangerouslySetInnerHTML={{ __html: processMarkdownString(content) }} />
  }

  // If content is an array, map through and render each node
  if (Array.isArray(content)) {
    return (
      <>
        {content.map((node, index) => (
          <RenderNode key={index} node={node} />
        ))}
      </>
    )
  }

  // If content is a single node object
  return <RenderNode node={content} />
}

// Function to process markdown-style formatting in strings
function processMarkdownString(text: string): string {
  if (!text) return ""

  try {
    // First try our custom processing which is more reliable for specific patterns
    const processedText = text
      // Headings: # Heading 1, ## Heading 2, etc.
      .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
        const level = hashes.length
        return `<h${level}>${content}</h${level}>`
      })
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic: *text* or _text_
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      // Strikethrough: ~~text~~
      .replace(/~~(.*?)~~/g, "<s>$1</s>")
      // Code: `text`
      .replace(/`(.*?)`/g, "<code>$1</code>")

    // If the text has been modified by our custom processing, return it
    if (processedText !== text) {
      return processedText
    }

    // Otherwise, try marked as a fallback
    return marked.parse(text, { async: false }) as string
  } catch (error) {
    console.error("Error parsing markdown:", error)

    // Fallback manual processing if everything fails
    return (
      text
        // Headings: # Heading 1, ## Heading 2, etc.
        .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
          const level = hashes.length
          return `<h${level}>${content}</h${level}>`
        })
        // Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic: *text* or _text_
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        // Strikethrough: ~~text~~
        .replace(/~~(.*?)~~/g, "<s>$1</s>")
        // Code: `text`
        .replace(/`(.*?)`/g, "<code>$1</code>")
        // Handle paragraphs
        .split("\n\n")
        .map((p) => `<p>${p}</p>`)
        .join("")
    )
  }
}

// Component to render a single node based on its type
function RenderNode({ node }: { node: RichTextNode | any }) {
  if (!node) return null

  // Direct string processing - apply markdown formatting
  if (typeof node === "string") {
    return <span dangerouslySetInnerHTML={{ __html: processMarkdownString(node) }} />
  }

  // Handle different node structures based on the rich text editor format

  // Handle Prosemirror/TipTap format
  if (node.type) {
    switch (node.type) {
      case "doc":
        return (
          <>
            {node.content?.map((child: RichTextNode, index: number) => (
              <RenderNode key={index} node={child} />
            ))}
          </>
        )

      case "paragraph":
        // If paragraph has text directly, process it for markdown
        if (node.text && typeof node.text === "string") {
          return <p dangerouslySetInnerHTML={{ __html: processMarkdownString(node.text) }} />
        }

        // If paragraph has content, process each child
        if (node.content) {
          // Check if all content is text that might need markdown processing
          const allText = node.content.every(
            (child: any) => typeof child.text === "string" && (!child.marks || child.marks.length === 0),
          )

          if (allText) {
            const combinedText = node.content.map((child: any) => child.text).join("")
            return <p dangerouslySetInnerHTML={{ __html: processMarkdownString(combinedText) }} />
          }
        }

        return (
          <p>
            {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
              node.text}
          </p>
        )

      case "heading": {
        const level = node.attrs?.level || 1
        // If heading has text directly, process it for markdown
        if (node.text && typeof node.text === "string") {
          // Use createElement instead of JSX for dynamic heading levels
          return React.createElement(`h${level}`, {
            dangerouslySetInnerHTML: { __html: processMarkdownString(node.text) },
          })
        }

        // If heading has content, check if it's all text that might need markdown processing
        if (node.content) {
          const allText = node.content.every(
            (child: any) => typeof child.text === "string" && (!child.marks || child.marks.length === 0),
          )

          if (allText) {
            const combinedText = node.content.map((child: any) => child.text).join("")
            return React.createElement(`h${level}`, {
              dangerouslySetInnerHTML: { __html: processMarkdownString(combinedText) },
            })
          }
        }

        switch (level) {
          case 1:
            return (
              <h1>
                {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                  node.text}
              </h1>
            )
          case 2:
            return (
              <h2>
                {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                  node.text}
              </h2>
            )
          case 3:
            return (
              <h3>
                {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                  node.text}
              </h3>
            )
          case 4:
            return (
              <h4>
                {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                  node.text}
              </h4>
            )
          case 5:
            return (
              <h5>
                {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                  node.text}
              </h5>
            )
          case 6:
            return (
              <h6>
                {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                  node.text}
              </h6>
            )
          default:
            return (
              <h1>
                {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                  node.text}
              </h1>
            )
        }
      }

      case "bulletList":
      case "orderedList": {
        const ListTag = node.type === "bulletList" ? "ul" : "ol"
        return React.createElement(
          ListTag,
          {},
          node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />),
        )
      }

      case "listItem":
        // If list item has text directly, process it for markdown
        if (node.text && typeof node.text === "string") {
          return <li dangerouslySetInnerHTML={{ __html: processMarkdownString(node.text) }} />
        }

        // If list item has content, check if it's all text that might need markdown processing
        if (node.content) {
          const allText = node.content.every(
            (child: any) => typeof child.text === "string" && (!child.marks || child.marks.length === 0),
          )

          if (allText) {
            const combinedText = node.content.map((child: any) => child.text).join("")
            return <li dangerouslySetInnerHTML={{ __html: processMarkdownString(combinedText) }} />
          }
        }

        return (
          <li>
            {node.content?.map((child: RichTextNode, index: number) => (
              <RenderNode key={index} node={child} />
            ))}
          </li>
        )

      case "blockquote":
        // If blockquote has text directly, process it for markdown
        if (node.text && typeof node.text === "string") {
          return <blockquote dangerouslySetInnerHTML={{ __html: processMarkdownString(node.text) }} />
        }

        // If blockquote has content, check if it's all text that might need markdown processing
        if (node.content) {
          const allText = node.content.every(
            (child: any) => typeof child.text === "string" && (!child.marks || child.marks.length === 0),
          )

          if (allText) {
            const combinedText = node.content.map((child: any) => child.text).join("")
            return <blockquote dangerouslySetInnerHTML={{ __html: processMarkdownString(combinedText) }} />
          }
        }

        return (
          <blockquote>
            {node.content?.map((child: RichTextNode, index: number) => (
              <RenderNode key={index} node={child} />
            ))}
          </blockquote>
        )

      case "image":
        return (
          <div className="my-4">
            <Image
              src={node.attrs?.src || ""}
              alt={node.attrs?.alt || ""}
              width={node.attrs?.width || 800}
              height={node.attrs?.height || 600}
              className="rounded-md"
            />
            {node.attrs?.caption && <p className="text-sm text-center text-gray-500 mt-2">{node.attrs.caption}</p>}
          </div>
        )

      case "codeBlock":
        return (
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code className={node.attrs?.language ? `language-${node.attrs.language}` : ""}>
              {node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />) ||
                node.text}
            </code>
          </pre>
        )

      case "table":
        return (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse">
              {node.content?.map((child: RichTextNode, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </table>
          </div>
        )

      case "tableRow":
        return (
          <tr>
            {node.content?.map((child: RichTextNode, index: number) => (
              <RenderNode key={index} node={child} />
            ))}
          </tr>
        )

      case "tableCell": {
        const CellTag = node.attrs?.header ? "th" : "td"
        // If cell has text directly, process it for markdown
        if (node.text && typeof node.text === "string") {
          return React.createElement(CellTag, {
            className: "border p-2",
            dangerouslySetInnerHTML: { __html: processMarkdownString(node.text) },
          })
        }

        // If cell has content, check if it's all text that might need markdown processing
        if (node.content) {
          const allText = node.content.every(
            (child: any) => typeof child.text === "string" && (!child.marks || child.marks.length === 0),
          )

          if (allText) {
            const combinedText = node.content.map((child: any) => child.text).join("")
            return React.createElement(CellTag, {
              className: "border p-2",
              dangerouslySetInnerHTML: { __html: processMarkdownString(combinedText) },
            })
          }
        }

        return React.createElement(
          CellTag,
          { className: "border p-2" },
          node.content?.map((child: RichTextNode, index: number) => <RenderNode key={index} node={child} />),
        )
      }

      case "text":
        // Handle text with marks (formatting)
        if (node.marks && node.marks.length > 0) {
          // If the text might contain markdown, process it first
          const processedText = typeof node.text === "string" ? processMarkdownString(node.text) : node.text

          return node.marks.reduce(
            (acc: React.ReactNode, mark: any) => {
              switch (mark.type) {
                case "bold":
                  return <strong>{acc}</strong>
                case "italic":
                  return <em>{acc}</em>
                case "underline":
                  return <u>{acc}</u>
                case "strike":
                  return <s>{acc}</s>
                case "code":
                  return <code className="bg-gray-100 px-1 rounded">{acc}</code>
                case "link":
                  return (
                    <Link href={mark.attrs?.href || "#"} className="text-blue-600 hover:underline">
                      {acc}
                    </Link>
                  )
                default:
                  return acc
              }
            },
            typeof processedText === "string" ? (
              <span dangerouslySetInnerHTML={{ __html: processedText }} />
            ) : (
              processedText
            ),
          )
        }

        // Process plain text for markdown
        if (typeof node.text === "string") {
          return <span dangerouslySetInnerHTML={{ __html: processMarkdownString(node.text) }} />
        }

        return node.text

      default:
        // For unknown node types, try to render content if available
        if (node.content) {
          return (
            <>
              {node.content.map((child: RichTextNode, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </>
          )
        }
        // If it has text, render the text with markdown processing
        if (node.text && typeof node.text === "string") {
          return <span dangerouslySetInnerHTML={{ __html: processMarkdownString(node.text) }} />
        }
        // Otherwise return null
        return null
    }
  }

  // Handle Slate.js format
  if (Array.isArray(node.children)) {
    if (node.type === "paragraph") {
      // Check if this paragraph has only text children that might contain markdown
      const hasOnlyTextChildren = node.children.every(
        (child: any) =>
          typeof child.text === "string" &&
          !child.bold &&
          !child.italic &&
          !child.underline &&
          !child.strikethrough &&
          !child.code &&
          !child.link,
      )

      if (hasOnlyTextChildren) {
        // Combine all text and process as markdown
        const combinedText = node.children.map((child: any) => child.text).join("")
        return <p dangerouslySetInnerHTML={{ __html: processMarkdownString(combinedText) }} />
      }

      return (
        <p>
          {node.children.map((child: any, index: number) => (
            <RenderNode key={index} node={child} />
          ))}
        </p>
      )
    }

    if (node.type === "heading") {
      const level = node.level || 1
      // Check if this heading has only text children that might contain markdown
      const hasOnlyTextChildren = node.children.every(
        (child: any) =>
          typeof child.text === "string" &&
          !child.bold &&
          !child.italic &&
          !child.underline &&
          !child.strikethrough &&
          !child.code &&
          !child.link,
      )

      if (hasOnlyTextChildren) {
        // Combine all text and process as markdown
        const combinedText = node.children.map((child: any) => child.text).join("")
        // Use createElement instead of JSX for dynamic heading levels
        return React.createElement(`h${level}`, {
          dangerouslySetInnerHTML: { __html: processMarkdownString(combinedText) },
        })
      }

      switch (level) {
        case 1:
          return (
            <h1>
              {node.children.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </h1>
          )
        case 2:
          return (
            <h2>
              {node.children.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </h2>
          )
        case 3:
          return (
            <h3>
              {node.children.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </h3>
          )
        case 4:
          return (
            <h4>
              {node.children.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </h4>
          )
        case 5:
          return (
            <h5>
              {node.children.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </h5>
          )
        case 6:
          return (
            <h6>
              {node.children.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </h6>
          )
        default:
          return (
            <h1>
              {node.children.map((child: any, index: number) => (
                <RenderNode key={index} node={child} />
              ))}
            </h1>
          )
      }
    }

    // Render children for other node types
    return (
      <>
        {node.children.map((child: any, index: number) => (
          <RenderNode key={index} node={child} />
        ))}
      </>
    )
  }

  // Handle leaf text nodes in Slate.js
  if (node.text !== undefined) {
    let content = node.text

    // Process markdown in text if no other formatting is applied
    if (
      typeof content === "string" &&
      !node.bold &&
      !node.italic &&
      !node.underline &&
      !node.strikethrough &&
      !node.code &&
      !node.link
    ) {
      content = <span dangerouslySetInnerHTML={{ __html: processMarkdownString(content) }} />
    }

    // Apply formatting
    if (node.bold) content = <strong>{content}</strong>
    if (node.italic) content = <em>{content}</em>
    if (node.underline) content = <u>{content}</u>
    if (node.strikethrough) content = <s>{content}</s>
    if (node.code) content = <code className="bg-gray-100 px-1 rounded">{content}</code>

    // Apply link if present
    if (node.link) {
      content = (
        <Link href={node.link} className="text-blue-600 hover:underline">
          {content}
        </Link>
      )
    }

    return content
  }

  // Fallback for any other format - try to render as string or return null
  if (typeof node === "string") {
    return <span dangerouslySetInnerHTML={{ __html: processMarkdownString(node) }} />
  }

  return node.toString ? node.toString() : null
}

