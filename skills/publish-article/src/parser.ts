/**
 * HTML Parser - Extract metadata from article HTML files
 */

import type { ArticleMetadata, ArticleCategory } from './types.js';

/**
 * Extract article title from HTML content
 * Priority: <title> → <h1> → og:title → filename fallback
 */
export function extractArticleTitle(htmlContent: string, fallbackFileName: string): string {
  // Priority 1: <title> tag
  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/is);
  if (titleMatch?.[1]?.trim()) {
    return titleMatch[1].trim();
  }

  // Priority 2: <h1> tag (clean nested HTML)
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/is);
  if (h1Match?.[1]?.trim()) {
    return h1Match[1].replace(/<[^>]+>/g, '').trim();
  }

  // Priority 3: og:title meta
  const ogTitleMatch = htmlContent.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/is);
  if (ogTitleMatch?.[1]?.trim()) {
    return ogTitleMatch[1].trim();
  }

  // Fallback: filename
  return fallbackFileName.replace(/\.html$/i, '');
}

/**
 * Extract article date from HTML content
 * Priority: meta date → title pattern → current date
 */
export function extractArticleDate(htmlContent: string): string {
  // Priority 1: <meta name="date">
  const dateMatch = htmlContent.match(/<meta\s+name=["']date["']\s+content=["'](\d{4}-\d{2}-\d{2})["']/is);
  if (dateMatch?.[1]) {
    return dateMatch[1];
  }

  // Priority 2: Chinese date pattern in title (2026年06月25日)
  const titleDateMatch = htmlContent.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (titleDateMatch) {
    const year = titleDateMatch[1];
    const month = titleDateMatch[2].padStart(2, '0');
    const day = titleDateMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback: current date
  return new Date().toISOString().split('T')[0];
}

/**
 * Detect article category from HTML content
 * Priority: meta category → keyword detection → null
 */
export function detectArticleCategory(htmlContent: string): ArticleCategory | null {
  // Priority 1: <meta name="category">
  const categoryMatch = htmlContent.match(/<meta\s+name=["']category["']\s+content=["']([^"']+)["']/is);
  if (categoryMatch?.[1]?.trim()) {
    return categoryMatch[1].trim() as ArticleCategory;
  }

  // Priority 2: Keyword detection
  const lowerContent = htmlContent.toLowerCase();

  if (lowerContent.includes('ai日报') || lowerContent.includes('ai hot') || lowerContent.includes('ai-daily')) {
    return 'AI-daily';
  }
  if (lowerContent.includes('市场分析') || lowerContent.includes('market')) {
    return 'market-analysis';
  }
  if (lowerContent.includes('产业链') || lowerContent.includes('行业')) {
    return 'industry-research';
  }
  if (lowerContent.includes('公司') || lowerContent.includes('财报')) {
    return 'company-reports';
  }

  return null;
}

/**
 * Extract all metadata from HTML content
 */
export function extractMetadata(htmlContent: string, filename: string): ArticleMetadata {
  return {
    title: extractArticleTitle(htmlContent, filename),
    date: extractArticleDate(htmlContent),
    category: detectArticleCategory(htmlContent) || undefined,
    originalFilename: filename,
  };
}

/**
 * Validate HTML content appears to be a valid HTML document
 */
export function isValidHtml(htmlContent: string): boolean {
  const trimmed = htmlContent.trim().toLowerCase();
  return trimmed.includes('<html') || trimmed.includes('<!doctype');
}
