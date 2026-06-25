/**
 * Type definitions for the publish-article skill
 */

/**
 * Supported article categories in the fin-reports project
 */
export type ArticleCategory =
  | 'market-analysis'    // 市场分析
  | 'industry-research'  // 行业研究
  | 'company-reports'    // 公司报告
  | 'AI-daily'           // AI 日报
  | string;              // 支持自定义分类

/**
 * Input parameters for publishing an article
 */
export interface PublishArticleInput {
  /** Source HTML file path (absolute or relative) */
  sourcePath: string;

  /** Target category directory */
  category?: ArticleCategory;

  /** Publication date (YYYY-MM-DD format), defaults to today */
  date?: string;

  /** Skip deployment confirmation */
  skipDeploy?: boolean;

  /** Target project path (auto-detected if not provided) */
  projectPath?: boolean;

  /** Preview mode without actual changes */
  dryRun?: boolean;

  /** Verbose output */
  verbose?: boolean;
}

/**
 * Metadata extracted from HTML article
 */
export interface ArticleMetadata {
  /** Article title */
  title: string;

  /** Publication date */
  date: string;

  /** Detected category */
  category?: ArticleCategory;

  /** Original filename */
  originalFilename: string;
}

/**
 * Validation error with severity level
 */
export interface ValidationError {
  /** Field being validated */
  field: string;

  /** Error message */
  message: string;

  /** Error severity */
  severity: 'error' | 'warning';
}

/**
 * Result of a successful publish operation
 */
export interface PublishResult {
  success: true;

  article: {
    title: string;
    date: string;
    category: string;
    filename: string;
    path: string;
    url: string;
  };

  build: {
    success: true;
    outputDir: string;
    articleCount: number;
    categoryCounts: Record<string, number>;
  };

  deploy: {
    success: true;
    url: string;
    deploymentId?: string;
  };

  summary: string;
}

/**
 * Result of a failed publish operation
 */
export interface PublishError {
  success: false;

  error: {
    code: string;
    message: string;
    details?: unknown;
  };

  /** Step where the error occurred */
  step: 'validation' | 'parsing' | 'copy' | 'build' | 'deploy';

  rollback?: {
    performed: boolean;
    details: string;
  };
}

/**
 * Combined publish result type
 */
export type PublishResultType = PublishResult | PublishError;

/**
 * Context for rollback operations
 */
export interface PublishContext {
  sourcePath: string;
  targetPath: string;
  backupPath?: string;
  projectPath: string;
  category: ArticleCategory;
  filename: string;
}

/**
 * Options for build operation
 */
export interface BuildOptions {
  verbose?: boolean;
  skipValidation?: boolean;
}

/**
 * Options for deploy operation
 */
export interface DeployOptions {
  dryRun?: boolean;
  branch?: string;
}
