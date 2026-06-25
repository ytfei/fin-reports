/**
 * Tests for File Namer
 */

import { describe, it, expect } from 'vitest';
import { sanitizeFilename, generateFilename, generateArticleUrl } from '../src/namer.js';

describe('sanitizeFilename', () => {
  it('should keep Chinese characters', () => {
    expect(sanitizeFilename('AI HOT 日报')).toBe('ai-hot-日报');
  });

  it('should replace spaces with hyphens', () => {
    expect(sanitizeFilename('Test Article Title')).toBe('test-article-title');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('Test@#$%Article')).toBe('testarticle');
  });

  it('should keep hyphens and underscores', () => {
    expect(sanitizeFilename('test_article-title')).toBe('test_article-title');
  });

  it('should trim leading hyphens', () => {
    expect(sanitizeFilename('--test--')).toBe('test');
  });

  it('should decode HTML entities', () => {
    expect(sanitizeFilename('Test &amp; Article')).toBe('test-article');
  });

  it('should limit length to 50 characters', () => {
    const longTitle = 'a'.repeat(100);
    expect(sanitizeFilename(longTitle).length).toBeLessThanOrEqual(50);
  });

  it('should return "article" for empty result', () => {
    expect(sanitizeFilename('!@#$%')).toBe('article');
  });

  it('should handle mixed Chinese and English', () => {
    expect(sanitizeFilename('AI日报2026年6月25日')).toBe('ai日报2026年6月25日');
  });

  it('should convert to lowercase', () => {
    expect(sanitizeFilename('TEST ARTICLE')).toBe('test-article');
  });
});

describe('generateFilename', () => {
  it('should generate filename with date prefix', () => {
    expect(generateFilename('2026-06-25', 'Test Article')).toBe('2026-06-25-test-article.html');
  });

  it('should handle empty title with fallback', () => {
    // Empty title falls back to 'article'
    expect(generateFilename('2026-06-25', '')).toBe('2026-06-25-article.html');
  });

  it('should handle title with special characters', () => {
    expect(generateFilename('2026-06-25', 'Test@#$Article')).toBe('2026-06-25-testarticle.html');
  });

  it('should preserve date format', () => {
    const filename = generateFilename('2026-01-05', 'Test');
    expect(filename).toMatch(/^2026-01-05-/);
  });
});

describe('generateArticleUrl', () => {
  it('should generate correct URL structure', () => {
    expect(generateArticleUrl('market-analysis', '2026-06-25-test.html'))
      .toBe('https://fin.a11.world/articles/market-analysis/2026-06-25-test.html');
  });

  it('should handle AI-daily category', () => {
    expect(generateArticleUrl('AI-daily', '2026-06-25-ai-hot.html'))
      .toBe('https://fin.a11.world/articles/AI-daily/2026-06-25-ai-hot.html');
  });
});
