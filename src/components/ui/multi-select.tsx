"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Search, ChevronDown } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Option = {
  value: string
  label: string
  group?: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  badgeClassName?: string
  disabled?: boolean
  maxDisplayItems?: number
  emptyMessage?: string
  showSelectAll?: boolean
  selectAllLabel?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  badgeClassName,
  disabled = false,
  maxDisplayItems = 999,
  emptyMessage = "No item found.",
  showSelectAll = false,
  selectAllLabel = "Select All",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange(options.map(option => option.value))
    }
  }

  const filteredOptions = searchQuery 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  const selectedLabels = selected.map(
    (value) => options.find((option) => option.value === value)?.label || value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 px-3 py-2",
            selected.length > 0 ? "h-auto" : "",
            className
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selectedLabels.slice(0, maxDisplayItems).map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className={cn(
                  "mr-1 mb-1 text-xs py-1 px-2 font-normal bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors",
                  badgeClassName
                )}
              >
                {label}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${label}`}
                  className="ml-1 cursor-pointer rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus-visible:ring-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      e.stopPropagation()
                      const value = options.find((option) => option.label === label)?.value
                      if (value) handleUnselect(value)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const value = options.find((option) => option.label === label)?.value
                    if (value) handleUnselect(value)
                  }}
                >
                  <X className="h-3 w-3 text-blue-700 hover:text-blue-900" />
                </span>
              </Badge>
            ))}
            {selected.length > maxDisplayItems && (
              <Badge variant="secondary" className="mb-1 bg-blue-100 text-blue-800">
                +{selected.length - maxDisplayItems} more
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="w-full">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input 
              className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear search"
                className="h-6 px-2 ml-2 cursor-pointer rounded-md hover:bg-accent flex items-center justify-center"
                onClick={() => setSearchQuery("")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setSearchQuery("")
                  }
                }}
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </div>
          <div className="max-h-[300px] overflow-auto p-1">
            {filteredOptions.length === 0 && (
              <div className="py-6 text-center text-sm">{emptyMessage}</div>
            )}
            
            {showSelectAll && filteredOptions.length > 0 && (
              <div className="px-2 py-1.5 border-b">
                <div 
                  role="checkbox"
                  aria-checked={selected.length === options.length}
                  className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent"
                  onClick={handleSelectAll}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectAll()
                    }
                  }}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-sm border mr-2",
                    selected.length === options.length ? "bg-primary border-primary" : "border-primary"
                  )}>
                    {selected.length === options.length && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span>{selectAllLabel}</span>
                </div>
              </div>
            )}
            
            <div className="p-1">
              {filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <div
                    key={option.value}
                    role="checkbox"
                    aria-checked={isSelected}
                    className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent"
                    onClick={() => handleSelect(option.value)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelect(option.value)
                      }
                    }}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border mr-2",
                      isSelected ? "bg-primary border-primary" : "border-primary"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    {option.label}
                  </div>
                )
              })}
            </div>
          </div>
          {selected.length > 0 && (
            <div className="flex items-center justify-between p-2 border-t">
              <div className="text-sm text-muted-foreground">
                {selected.length} selected
              </div>
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear all selections"
                className="h-7 text-xs px-2 py-1 cursor-pointer rounded-md hover:bg-accent flex items-center justify-center"
                onClick={() => onChange([])}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onChange([])
                  }
                }}
              >
                Clear all
              </span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

