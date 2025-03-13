"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getArticleCategoryById, updateArticleCategory } from "@/lib/kategori-artikel"
import { ArticleCategoryForm } from "@/src/components/admin/artikel/kategori/categoryArticle-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { ArticleCategoryFormData } from "@/lib/zod"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditArticleCategoryPage(){
    
}