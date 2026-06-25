/**
 * Integrator - Integration with fin-reports build system
 */
import type { BuildOptions, DeployOptions } from './types.js';
/**
 * Detect fin-reports project path
 * Searches common locations for project with src/build.js
 */
export declare function detectProjectPath(): string;
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
//# sourceMappingURL=integrator.d.ts.map