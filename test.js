const scorer = require('./dist/vscode_common/fuzzyScorer');
const path = require('./dist/vscode_common/path');
const uri = require('./dist/vscode_common/uri');

const { basename, dirname } = path;
const { URI } = uri;

const resourceA = URI.file('/some/path/fileA.txt');
const resourceB = URI.file('/some/path/other/fileB.txt');
const resourceC = URI.file('/unrelated/some/path/other/fileC.txt');

function compareItemsByScore(itemA, itemB, query, accessor) {
  return scorer.compareItemsByFuzzyScore(
    itemA,
    itemB,
    scorer.prepareQuery(query),
    true,
    accessor,
    Object.create(null)
  );
}

function doScore(target, query) {
  const preparedQuery = scorer.prepareQuery(query);

  return scorer.scoreFuzzy(
    target,
    preparedQuery.normalized,
    preparedQuery.normalizedLowercase,
    true
  );
}

class ResourceAccessorClass {
  getItemLabel(resource) {
    return basename(resource.fsPath);
  }

  getItemDescription(resource) {
    return dirname(resource.fsPath);
  }

  getItemPath(resource) {
    return resource.fsPath;
  }
}

const ResourceAccessor = new ResourceAccessorClass();

const query = 'pathfileB';

const res = [resourceA, resourceB, resourceC].sort((r1, r2) =>
  compareItemsByScore(r1, r2, query, ResourceAccessor)
);

console.log(res);

console.log(doScore('Hello-World', 'H-Worl'));
