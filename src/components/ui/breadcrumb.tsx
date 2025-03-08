"use client"

import * as React from "react"
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode
  children: React.ReactNode
}

export interface BreadcrumbListProps extends React.ComponentPropsWithoutRef<"ol"> {
  children: React.ReactNode
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<"li"> {
  children: React.ReactNode
}

export interface BreadcrumbLinkProps {
  href?: string
  className?: string
  children: React.ReactNode
  asChild?: boolean
}

export interface BreadcrumbSeparatorProps extends React.ComponentPropsWithoutRef<"li"> {
  children?: React.ReactNode
}

export interface BreadcrumbEllipsisProps extends React.ComponentPropsWithoutRef<"li"> {
  children?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4" />, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex flex-wrap items-center", className)}
        {...props}
      >
        {children}
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => {
    return (
      <ol
        ref={ref}
        className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  }
)
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      />
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, children, ...props }, ref) => {
    if (!href) {
      return (
        <span
          className={cn("flex items-center text-foreground font-medium", className)}
        >
          {children}
        </span>
      )
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={cn("transition-colors hover:text-foreground flex items-center", className)}
        {...props}
      >
        {children}
      </Link>
    )
  }
)
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, children = <ChevronRight className="h-4 w-4" />, ...props }, ref) => {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("text-muted-foreground", className)}
        {...props}
      >
        {children}
      </li>
    )
  }
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = React.forwardRef<HTMLLIElement, BreadcrumbEllipsisProps>(
  ({ className, children = <MoreHorizontal className="h-4 w-4" />, ...props }, ref) => {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn("flex h-4 w-4 items-center justify-center text-muted-foreground", className)}
        {...props}
      >
        {children}
      </li>
    )
  }
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}