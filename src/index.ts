import { basename, dirname } from './vscode_common/path';
import {
  compareItemsByFuzzyScore,
  scoreItemFuzzy,
  prepareQuery,
  IItemAccessor,
  IItemScore,
  IPreparedQuery,
  FuzzyScorerCache,
} from './vscode_common/fuzzyScorer';

export * from './vscode_common/fuzzyScorer';
export { basename, dirname } from './vscode_common/path';

export const filePathAccessor = {
  getItemLabel(fsPath: string) {
    return basename(fsPath);
  },

  getItemDescription(fsPath: string) {
    return dirname(fsPath);
  },

  getItemPath(fsPath: string) {
    return fsPath;
  },
};

export function compareFilePathsByFuzzyScore({
  pathA,
  pathB,
  query,
  accessor = filePathAccessor,
  cache = {},
}: {
  pathA: string;
  pathB: string;
  query: string | IPreparedQuery;
  accessor?: IItemAccessor<string>;
  cache?: FuzzyScorerCache;
}): number {
  const preparedQuery = typeof query === 'string' ? prepareQuery(query) : query;
  return compareItemsByFuzzyScore(pathA, pathB, preparedQuery, true, accessor, cache);
}

export function scoreFilePathFuzzy({
  path,
  query,
  accessor = filePathAccessor,
  cache = {},
}: {
  path: string;
  query: string | IPreparedQuery;
  accessor?: IItemAccessor<string>;
  cache?: FuzzyScorerCache;
}): IItemScore {
  const preparedQuery = typeof query === 'string' ? prepareQuery(query) : query;
  return scoreItemFuzzy(path, preparedQuery, true, accessor, cache);
}
