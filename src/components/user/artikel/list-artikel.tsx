'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ListArticle } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { extractExcerpt, formatDate, calculateReadingTime } from '@/lib/utils';

interface ListArtikelProps {
  articles?: ListArticle[];
  isLoading?: boolean;
}

// Generate a consistent color based on string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#4CAF50', // green
    '#2196F3', // blue
    '#9C27B0', // purple
    '#F44336', // red
    '#FF9800', // orange
    '#795548', // brown
    '#607D8B', // blue-grey
    '#E91E63', // pink
    '#673AB7', // deep purple
    '#3F51B5', // indigo
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Format date to MMM 'YY format
const formatShortDate = (date: Date | string | null) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const month = dateObj.toLocaleString('id-ID', { month: 'short' }).toUpperCase();
  const year = dateObj.getFullYear().toString().slice(2);

  return `${month} '${year}`;
};

export default function ListArtikel({ articles = [], isLoading = false }: ListArtikelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<ListArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; count: number }[]>([]);

  const articlesPerPage = 8;

  // Extract categories and tags
  useEffect(() => {
    if (articles.length > 0) {
      // Extract categories
      const categoryMap = new Map<string, { id: string; name: string; count: number }>();

      // Extract tags
      const tagMap = new Map<string, { id: string; name: string; count: number }>();

      articles.forEach((article) => {
        // Process categories
        article.categories?.forEach((category) => {
          if (categoryMap.has(category.id)) {
            const existing = categoryMap.get(category.id)!;
            categoryMap.set(category.id, { ...existing, count: existing.count + 1 });
          } else {
            categoryMap.set(category.id, { id: category.id, name: category.name, count: 1 });
          }
        });

        // Process tags
        article.tags?.forEach((tag) => {
          if (tagMap.has(tag.id)) {
            const existing = tagMap.get(tag.id)!;
            tagMap.set(tag.id, { ...existing, count: existing.count + 1 });
          } else {
            tagMap.set(tag.id, { id: tag.id, name: tag.name, count: 1 });
          }
        });
      });

      setCategories(Array.from(categoryMap.values()));
      setTags(Array.from(tagMap.values()));
    }
  }, [articles]);

  // Filter articles based on search, category, and tag
  useEffect(() => {
    let result = [...articles];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((article) => article.title.toLowerCase().includes(query) || extractExcerpt(article.content).toLowerCase().includes(query));
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((article) => article.categories?.some((category) => category.id === selectedCategory));
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter((article) => article.tags?.some((tag) => tag.id === selectedTag));
    }

    setFilteredArticles(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [articles, searchQuery, selectedCategory, selectedTag]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  // Handle pagination
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="w-1/2 h-10 bg-gray-200 rounded"></div>
          <div className="w-1/3 h-10 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main content - Article list */}
      <div className="md:col-span-2">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-700 mb-2">Tidak ada artikel ditemukan</h3>
            <p className="text-gray-500 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
            >
              Reset Filter
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentArticles.map((article) => (
                <div key={article.id} className="flex border-b pb-6 group">
                  <div>
                    <img
                      src={typeof article.thumbnail === 'string' && article.thumbnail ? article.thumbnail : '/placeholder.svg'}
                      alt={article.title}
                      className="w-auto h-16 flex-shrink-0 mr-4 object-cover rounded"
                      onError={(e) => {
                        console.error('Error loading article thumbnail:', article.thumbnail);
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />

                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">{formatShortDate(article.created_at)}</div>
                  </div>

                  <div className="flex-1">
                    <Link href={`/artikel/${article.slug}`}>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{extractExcerpt(article.content, 150)}</p>

                    <div className="flex items-center text-xs text-gray-500">
                      {article.categories && article.categories[0] && (
                        <span className="mr-3 cursor-pointer hover:text-blue-600" onClick={() => setSelectedCategory(article.categories![0].id)}>
                          {article.categories[0].name}
                        </span>
                      )}

                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(article.created_at)}
                      </span>

                      <span className="mx-2">•</span>

                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {calculateReadingTime(article.content)} min read
                      </span>
                    </div>

                    {/* Display article tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-gray-100 text-[#5596DF] hover:bg-gray-200 cursor-pointer transition-colors"
                            onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" size="icon" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="mr-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && <span className="px-3 py-2">...</span>}
                      <Button variant={currentPage === page ? 'default' : 'outline'} size="icon" onClick={() => paginate(page)} className="mx-1">
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}

                <Button variant="outline" size="icon" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="ml-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <div className="md:col-span-1">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Input type="text" placeholder="Cari Artikel" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Kategori</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex justify-between items-center p-2 rounded cursor-pointer ${selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <span className="flex items-center">
                  <ChevronRight className={`h-4 w-4 mr-1 ${selectedCategory === category.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {category.name}
                </span>
                <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">{category.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-lg font-bold mb-3">Tag</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${selectedTag === tag.id ? 'bg-[#5596DF] text-white' : 'bg-gray-100 text-[#5596DF] hover:bg-gray-200'}`}
                style={{
                  backgroundColor: selectedTag === tag.id ? '#5596DF' : undefined,
                }}
              >
                <span>#{tag.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ml-1 ${selectedTag === tag.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>{tag.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
