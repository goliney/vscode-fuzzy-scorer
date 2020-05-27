import { IItemAccessor, IItemScore, IPreparedQuery, FuzzyScorerCache } from './vscode_common/fuzzyScorer';
export * from './vscode_common/fuzzyScorer';
export { basename, dirname } from './vscode_common/path';
export declare const filePathAccessor: {
    getItemLabel(fsPath: string): string;
    getItemDescription(fsPath: string): string;
    getItemPath(fsPath: string): string;
};
export declare function compareFilePathsByFuzzyScore({ pathA, pathB, query, accessor, cache, }: {
    pathA: string;
    pathB: string;
    query: string | IPreparedQuery;
    accessor?: IItemAccessor<string>;
    cache?: FuzzyScorerCache;
}): number;
export declare function scoreFilePathFuzzy({ path, query, accessor, cache, }: {
    path: string;
    query: string | IPreparedQuery;
    accessor?: IItemAccessor<string>;
    cache?: FuzzyScorerCache;
}): IItemScore;
