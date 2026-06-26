/**
 * Integrator - Integration with fin-reports build system
 */
import type { BuildOptions, DeployOptions } from './types.js';
/**
 * Detect fin-reports project path
 * Priority:
 * 1. Explicitly provided path parameter
 * 2. Environment variable FIN_REPORTS_PATH
 * 3. Config file ~/.fin-reports/config.json
 * 4. Search common locations for project with src/build.js
 */
export declare function detectProjectPath(providedPath?: string): string;
/**
 * Run build command
 */
export declare function buildProject(options?: BuildOptions): {
    success: boolean;
    outputDir: string;
    articleCount: number;
    categoryCounts: Record<string, number>;
};
/**
 * Run deploy command
 */
export declare function deployProject(options?: DeployOptions): {
    success: boolean;
    url: string;
    deploymentId?: string;
};
/**
 * Confirm deployment with user
 */
export declare function confirmDeploy(): Promise<boolean>;
/**
 * Git add file
 */
export declare function gitAdd(filePath: string, projectPath: string): void;
/**
 * Git commit with message
 */
export declare function gitCommit(message: string, projectPath: string): string;
/**
 * Git push to remote
 */
export declare function gitPush(projectPath: string): void;
//# sourceMappingURL=integrator.d.ts.map