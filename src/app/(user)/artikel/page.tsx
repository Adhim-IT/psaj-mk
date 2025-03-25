"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getListArticles } from "@/lib/list-artikel"
import ListArtikel from "@/components/user/artikel/list-artikel"
import type { ListArticle, Category, Tag, CategoryArticle, TagArticle } from "@/types"

export default function ArtikelPage() {
  const [articles, setArticles] = useState<ListArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true)
      try {
        const result = await getListArticles()
        if (result.ListArticles) {
          // Transform the data to match the ListArticle type
          const formattedArticles = result.ListArticles.map((article: any) => {
            // Extract categories from article_category_pivot
            const categories: CategoryArticle[] =
              article.article_category_pivot
                ?.filter((pivot: any) => pivot.article_categories)
                .map((pivot: any) => ({
                  id: pivot.article_categories.id,
                  name: pivot.article_categories.name,
                  slug: pivot.article_categories.slug,
                  created_at: pivot.article_categories.created_at,
                  updated_at: pivot.article_categories.updated_at,
                  deleted_at: pivot.article_categories.deleted_at,
                })) || []

            // Extract tags from article_tag_pivot
            const tags: TagArticle[] =
              article.article_tag_pivot
                ?.filter((pivot: any) => pivot.article_tags)
                .map((pivot: any) => ({
                  id: pivot.article_tags.id,
                  name: pivot.article_tags.name,
                  slug: pivot.article_tags.slug,
                  created_at: pivot.article_tags.created_at,
                  updated_at: pivot.article_tags.updated_at,
                  deleted_at: pivot.article_tags.deleted_at,
                })) || []

            return {
              id: article.id,
              writer_id: article.writer_id,
              title: article.title,
              slug: article.slug,
              content: article.content,
              thumbnail: article.thumbnail,
              created_at: article.created_at,
              updated_at: article.updated_at,
              deleted_at: article.deleted_at,
              categories,
              tags,
              writer: article.writers
                ? {
                    id: article.writers.id,
                    name: article.writers.name,
                    email: article.writers.email,
                    bio: article.writers.bio,
                    avatar: article.writers.avatar,
                  }
                : undefined,
            }
          })

          setArticles(formattedArticles)
        }
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])
  const PageHeader = ({ title }: { title: string }) => (
    <div className="bg-gradient-to-r from-[#5596DF] to-[#6ba5e7] text-white py-32 px-6 mt-10 min-h-[300px] flex items-center relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-[-100px] left-[-20px] w-80 h-80 bg-white/5 rounded-full blur-xl animate-pulse delay-700"></div>
      
      {/* Floating shapes */}
      <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-white/20 rounded-lg rotate-12 animate-bounce delay-300"></div>
      <div className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-white/15 rounded-full animate-ping opacity-70 delay-1000"></div>
      <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-white/10 rotate-45 animate-bounce delay-700"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 md:ml-5 animate-fade-in-up">
          {title.split('').map((char, index) => (
            <span 
              key={index} 
              className="inline-block animate-fade-in-up" 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <div className="flex items-center gap-2 text-[#e6f0fc] md:ml-5 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <Link href="/" className="hover:text-white transition-colors duration-300">
            Home
          </Link>
          <span>›</span>
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen">
      {/* Header */}
     <PageHeader title="Artikel" />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <ListArtikel articles={articles} isLoading={isLoading} />
      </div>
    </div>
  )
}

