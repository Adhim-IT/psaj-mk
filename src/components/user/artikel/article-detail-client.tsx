'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { CalendarIcon, MessageSquareIcon, UserIcon, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArtikelComment } from '@/components/user/artikel/artikel-comment';
import { getApprovedCommentsByArticleId } from '@/lib/article-comments-admin';
import { RichTextContent } from '@/components/rich-text-content';

interface ArticleDetailClientProps {
  article: any; // Using any temporarily to accommodate the structure from the API
  relatedArticles?: any[];
  categories?: { id: string; name: string; slug: string; count: number }[];
  tags?: { id: string; name: string; count: number }[];
}

export default function ArticleDetailClient({ article, relatedArticles = [], categories = [], tags = [] }: ArticleDetailClientProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [relativeTime, setRelativeTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [commentCount, setCommentCount] = useState<number>(0);

  useEffect(() => {
    // Format date
    if (article.created_at) {
      setFormattedDate(formatDate(article.created_at));
      setRelativeTime(formatRelativeTime(article.created_at));
    }

    // Fetch comment count
    const fetchCommentCount = async () => {
      try {
        const { comments } = await getApprovedCommentsByArticleId(article.id);
        if (comments) {
          // Count main comments and all replies from other_article_comments
          let totalCount = comments.length;
          comments.forEach((comment) => {
            if (comment.other_article_comments && Array.isArray(comment.other_article_comments)) {
              totalCount += comment.other_article_comments.length;
            }
          });
          setCommentCount(totalCount);
        }
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };

    fetchCommentCount();
  }, [article]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
    console.log('Searching for:', searchQuery);
  };

  // Function to update comment count when new comments are added
  const handleCommentCountUpdate = (newCount: number) => {
    setCommentCount(newCount);
  };

  // Helper function to safely get writer name
  const getWriterName = () => {
    if (!article.writer) return null;

    // If writer is an object with a name property
    if (typeof article.writer === 'object' && article.writer.name) {
      return article.writer.name;
    }

    // If writer is a string
    if (typeof article.writer === 'string') {
      return article.writer;
    }

    return null;
  };

  const writerName = getWriterName();

  // Pre-process content if it's a string to handle markdown
  const processedContent = typeof article.content === 'string' ? article.content : article.content;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-25">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Main Content - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          {/* Article Thumbnail */}
          <div className="mb-6 relative h-[600px] w-full bg-gray-200 rounded-md overflow-hidden">
            <Image
              src={typeof article.thumbnail === 'string' && article.thumbnail ? article.thumbnail : '/placeholder.svg?height=1080&width=1920'}
              alt={article.title}
              fill
              className="object-cover"
              onError={(e) => {
                console.error('Error loading article thumbnail:', article.thumbnail);
                (e.target as HTMLImageElement).src = '/placeholder.svg?height=1080&width=1920';
              }}
              unoptimized={true}
            />
          </div>

          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4" />
              <span className="uppercase">{relativeTime}</span>
            </div>

            {writerName && (
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4" />
                <span className="uppercase">{writerName}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <MessageSquareIcon className="h-4 w-4" />
              <span className="uppercase">{commentCount} COMMENTS</span>
            </div>
          </div>

          {/* Article Title and Content */}
          <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

          {article.subtitle && <h2 className="text-xl text-[#5596DF] mb-4">{article.subtitle}</h2>}

          <div className="prose prose-lg max-w-none mb-8">
            {typeof article.content === 'string' ? <RichTextContent content={article.content} /> : article.content && typeof article.content === 'object' ? <RichTextContent content={article.content} /> : <p>No content available</p>}
          </div>

          {/* Tags */}
          {article.tag && article.tag.length > 0 && (
            <div className="mb-8">
              <span className="font-semibold mr-2">Post Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {article.tag.map((tag: any) => (
                  <Link key={tag.id} href={`/artikel/tag/${tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-')}`} className="bg-gray-100 text-[#5596DF] uppercase px-3 py-1 text-xs hover:bg-gray-200 transition">
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-12">
            <ArtikelComment articleId={article.id} onCommentCountUpdate={handleCommentCountUpdate} />
          </div>
        </div>

        {/* Sidebar - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          {/* Search Box */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex">
              <Input placeholder="Cari Artikel" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-r-none" />
              <Button type="submit" className="rounded-l-none bg-[#5596DF] hover:bg-blue-700">
                <SearchIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Kategori</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/artikel/kategori/${category.slug}`} className="flex items-center justify-between hover:text-[#5596DF] transition">
                    <span className="flex items-center">
                      <span className="mr-2">›</span>
                      {category.name}
                    </span>
                    <span className="text-gray-500">{category.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Artikel Terkait</h3>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={`/artikel/${relatedArticle.slug}`} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-gray-200 relative flex-shrink-0">
                      <Image
                        src={typeof relatedArticle.thumbnail === 'string' && relatedArticle.thumbnail ? relatedArticle.thumbnail : '/placeholder.svg?height=100&width=100'}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          console.error('Error loading related article thumbnail:', relatedArticle.thumbnail);
                          (e.target as HTMLImageElement).src = '/placeholder.svg?height=100&width=100';
                        }}
                        unoptimized={true}
                      />
                    </div>
                    <div>
                      {relatedArticle.created_at && <p className="text-xs text-gray-600 uppercase">{formatRelativeTime(relatedArticle.created_at)}</p>}
                      <h4 className="font-semibold group-hover:text-[#5596DF] transition">{relatedArticle.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tag</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/artikel/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`} className="bg-gray-100 text-[#5596DF] uppercase px-3 py-1 text-xs hover:bg-gray-200 transition">
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
