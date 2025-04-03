import { getListArticleBySlug, getListArticles, getRelatedArticles, getArticleCategories } from '@/lib/list-artikel';
import ArticleDetailClient from '@/components/user/artikel/article-detail-client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractExcerpt } from '@/lib/utils';

export interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // ✅ Await params sebelum mengakses propertinya
  const { slug } = await params;

  try {
    const articleData = await getListArticleBySlug(slug);

    if (articleData.error || !articleData.listArticle) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found',
      };
    }

    const article = articleData.listArticle;
    const excerpt = extractExcerpt(article.content, 160);

    return {
      title: article.title,
      description: excerpt,
      openGraph: {
        title: article.title,
        description: excerpt,
        type: 'article',
        publishedTime: article.created_at ? new Date(article.created_at).toISOString() : undefined,
        authors: article.writer ? [article.writer.name] : undefined,
        images: article.thumbnail ? [article.thumbnail] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: excerpt,
        images: article.thumbnail ? [article.thumbnail] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Article',
      description: 'Article detail page',
    };
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // ✅ Await params sebelum mengakses propertinya
  const { slug } = await params;

  try {
    // Fetch current article
    const articleData = await getListArticleBySlug(slug);

    if (articleData.error || !articleData.listArticle) {
      return notFound();
    }

    const article = articleData.listArticle;

    // Get category IDs from the current article
    const categoryIds = article.categories?.map((cat: any) => cat.id) || [];

    // Fetch related articles based on categories
    const relatedArticlesData = await getRelatedArticles(String(article.id), categoryIds, 3);
    const relatedArticles = relatedArticlesData.relatedArticles || [];

    // Fetch all categories for the sidebar
    const categoriesData = await getArticleCategories();
    const categories = categoriesData.categories || [];

    // Fetch all articles to count articles per category and tag
    const allArticlesData = await getListArticles();
    const allArticles = allArticlesData.ListArticles || [];

    // Prepare categories with count
    const categoriesWithCount = categories.map((category: any) => ({
      ...category,
      count: allArticles.filter((article: any) => article.categories?.some((cat: any) => String(cat.id) === String(category.id))).length,
    }));

    // Get all unique tags from all articles
    const allTags = Array.from(new Set(allArticles.flatMap((article: any) => article.tag || []).map((tag: any) => JSON.stringify(tag || {})))).map((tagStr: any) => JSON.parse(tagStr));

    // Prepare tags with count
    const tagsWithCount = allTags.map((tag) => ({
      ...tag,
      count: allArticles.filter((article: any) => article.tag?.some((t: any) => t.id === tag.id)).length,
    }));

    return <ArticleDetailClient article={article} relatedArticles={relatedArticles} categories={categoriesWithCount} tags={tagsWithCount} />;
  } catch (error) {
    console.error('Error fetching article:', error);
    return notFound();
  }
}
