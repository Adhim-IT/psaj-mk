"use client"

import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getListArticleBySlug, getRelatedArticles } from "@/lib/list-artikel"
import { ArtikelComment } from "@/components/user/artikel/artikel-comment"
import { Bookmark, Calendar, Clock, Share2 } from "lucide-react"
import { formatDate, calculateReadingTime } from "@/lib/utils"

export default async function ArticleDetailClient({ params }: { params: { slug: string } }) {
  const { listArticle, error } = await getListArticleBySlug(params.slug)

  if (error || !listArticle) {
    notFound()
  }

  // Get related articles based on categories
  const categoryIds = listArticle.categories.map((cat) => cat.id)
  const { relatedArticles } = await getRelatedArticles(listArticle.id, categoryIds, 3)

  const readingTime = calculateReadingTime(listArticle.content)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors duration-300">
              Home
            </Link>
            <span>›</span>
            <Link href="/artikel" className="hover:text-primary transition-colors duration-300">
              Artikel
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{listArticle.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Article Header */}
              <div className="relative h-[300px] md:h-[400px] w-full">
                <Image
                  src={listArticle.thumbnail || "/placeholder.svg"}
                  alt={listArticle.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-6 md:p-8">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {listArticle.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/artikel?category=${category.slug || category.id}`}
                      className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{listArticle.title}</h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {/* <span>{formatDate(listArticle.created_at)}</span> */}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} menit membaca</span>
                  </div>
                </div>

                {/* Author */}
                {listArticle.writer && (
                  <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={listArticle.writer.profile_picture || "/placeholder.svg?height=48&width=48"}
                        alt={listArticle.writer.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{listArticle.writer.name}</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: listArticle.content }} />

                {/* Tags */}
                {listArticle.tag && listArticle.tag.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {listArticle.tag.map((tag) => (
                        <span key={tag.id} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share & Bookmark */}
                <div className="mt-8 pt-6 border-t flex justify-between">
                  <button
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    onClick={() => {}}
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Bagikan</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    onClick={() => {}}
                  >
                    <Bookmark className="w-5 h-5" />
                    <span>Simpan</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Comments */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Komentar</h2>
              <Suspense fallback={<div className="p-8 bg-white rounded-xl shadow-sm">Memuat komentar...</div>}>
                <ArtikelComment articleId={listArticle.id} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Articles */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Artikel Terkait</h3>

              {relatedArticles && relatedArticles.length > 0 ? (
                <div className="space-y-6">
                  {relatedArticles.map((article) => (
                    <div key={article.id} className="group">
                      <Link href={`/artikel/${article.slug}`} className="block">
                        <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
                          <Image
                            src={article.thumbnail || "/placeholder.svg"}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        {/* <p className="text-sm text-gray-600 mt-1">{formatDate(article.created_at)}</p> */}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Tidak ada artikel terkait.</p>
              )}

              <div className="mt-6 pt-4 border-t">
                <Link href="/artikel" className="text-primary font-medium hover:underline">
                  Lihat semua artikel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

