/**
 * Tests for HTML Parser
 */

import { describe, it, expect } from 'vitest';
import { extractArticleTitle, extractArticleDate, detectArticleCategory, extractMetadata } from '../src/parser.js';

describe('extractArticleTitle', () => {
  it('should extract title from <title> tag', () => {
    const html = '<html><head><title>Test Article</title></head><body></body></html>';
    expect(extractArticleTitle(html, 'fallback.html')).toBe('Test Article');
  });

  it('should extract title from <h1> tag when <title> is empty', () => {
    const html = '<html><head><title></title></head><body><h1>Main Heading</h1></body></html>';
    expect(extractArticleTitle(html, 'fallback.html')).toBe('Main Heading');
  });

  it('should extract title from og:title meta', () => {
    const html = '<html><head><meta property="og:title" content="OG Title"></head></html>';
    expect(extractArticleTitle(html, 'fallback.html')).toBe('OG Title');
  });

  it('should use filename as fallback', () => {
    const html = '<html><head></head><body></body></html>';
    expect(extractArticleTitle(html, 'my-article.html')).toBe('my-article');
  });

  it('should handle nested HTML in <title>', () => {
    const html = '<html><head><title><span>Test</span> Article</title></head></html>';
    expect(extractArticleTitle(html, 'fallback.html')).toBe('<span>Test</span> Article');
  });

  it('should trim whitespace from title', () => {
    const html = '<html><head><title>  Test Article  </title></head></html>';
    expect(extractArticleTitle(html, 'fallback.html')).toBe('Test Article');
  });
});

describe('extractArticleDate', () => {
  it('should extract date from meta tag', () => {
    const html = '<html><head><meta name="date" content="2026-06-25"></head></html>';
    expect(extractArticleDate(html)).toBe('2026-06-25');
  });

  it('should extract Chinese date from title', () => {
    const html = '<html><head><title>AI日报 · 2026年06月25日</title></head></html>';
    expect(extractArticleDate(html)).toBe('2026-06-25');
  });

  it('should pad single digit month and day', () => {
    const html = '<html><head><title>文章 · 2026年1月5日</title></head></html>';
    expect(extractArticleDate(html)).toBe('2026-01-05');
  });

  it('should use current date as fallback', () => {
    const html = '<html><head></head></html>';
    const result = extractArticleDate(html);
    const expected = new Date().toISOString().split('T')[0];
    expect(result).toBe(expected);
  });
});

describe('detectArticleCategory', () => {
  it('should detect AI-daily from keywords', () => {
    const html = '<html><head><title>AI HOT 日报</title></head></html>';
    expect(detectArticleCategory(html)).toBe('AI-daily');
  });

  it('should detect market-analysis from keywords', () => {
    const html = '<html><head><title>市场分析报告</title></head></html>';
    expect(detectArticleCategory(html)).toBe('market-analysis');
  });

  it('should detect industry-research from keywords', () => {
    const html = '<html><head><title>产业链深度研究</title></head></html>';
    expect(detectArticleCategory(html)).toBe('industry-research');
  });

  it('should detect company-reports from keywords', () => {
    const html = '<html><head><title>公司财报分析</title></head></html>';
    expect(detectArticleCategory(html)).toBe('company-reports');
  });

  it('should extract category from meta tag', () => {
    const html = '<html><head><meta name="category" content="market-analysis"></head></html>';
    expect(detectArticleCategory(html)).toBe('market-analysis');
  });

  it('should return null when no category detected', () => {
    const html = '<html><head><title>Random Article</title></head></html>';
    expect(detectArticleCategory(html)).toBeNull();
  });
});

describe('extractMetadata', () => {
  it('should extract all metadata from HTML', () => {
    const html = `
      <html>
        <head>
          <title>Test Article</title>
          <meta name="date" content="2026-06-25">
          <meta name="category" content="market-analysis">
        </head>
      </html>
    `;
    const result = extractMetadata(html, 'test.html');

    expect(result.title).toBe('Test Article');
    expect(result.date).toBe('2026-06-25');
    expect(result.category).toBe('market-analysis');
    expect(result.originalFilename).toBe('test.html');
  });
});

describe('isValidHtml', () => {
  it('should return true for valid HTML with <html> tag', () => {
    const html = '<html><head></head><body></body></html>';
    // Import and test isValidHtml function
    // Note: This function needs to be exported from parser.ts first
  });

  it('should return true for HTML with doctype', () => {
    const html = '<!DOCTYPE html><html></html>';
  });

  it('should return false for non-HTML content', () => {
    const html = 'Just some text';
  });
});
