import type { ReactNode } from "react"

interface AkunLayoutProps {
  children: ReactNode
}

export default function AkunLayout({ children }: AkunLayoutProps) {
  return <div className="space-y-6">{children}</div>
}

