/**
 * Main Entry Point - Orchestrate the article publishing workflow
 */
import type { PublishArticleInput, PublishResultType } from './types.js';
/**
 * Main function to publish an article
 */
export declare function publishArticle(input: PublishArticleInput): Promise<PublishResultType>;
/**
 * Export for CLI use
 */
export { publishArticle as main } from './index.js';
//# sourceMappingURL=index.d.ts.map