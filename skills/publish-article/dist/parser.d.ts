/**
 * HTML Parser - Extract metadata from article HTML files
 */
import type { ArticleMetadata, ArticleCategory } from './types.js';
/**
 * Extract article title from HTML content
 * Priority: <title> → <h1> → og:title → filename fallback
 */
export declare function extractArticleTitle(htmlContent: string, fallbackFileName: string): string;
/**
 * Extract article date from HTML content
 * Priority: meta date → title pattern → current date
 */
export declare function extractArticleDate(htmlContent: string): string;
/**
 * Detect article category from HTML content
 * Priority: meta category → keyword detection → null
 */
export declare function detectArticleCategory(htmlContent: string): ArticleCategory | null;
/**
 * Extract all metadata from HTML content
 */
export declare function extractMetadata(htmlContent: string, filename: string): ArticleMetadata;
/**
 * Validate HTML content appears to be a valid HTML document
 */
export declare function isValidHtml(htmlContent: string): boolean;
//# sourceMappingURL=parser.d.ts.map