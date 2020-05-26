"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  filePathAccessor: true,
  compareFilePathsByFuzzyScore: true,
  scoreFilePathFuzzy: true,
  basename: true,
  dirname: true
};
exports.compareFilePathsByFuzzyScore = compareFilePathsByFuzzyScore;
exports.scoreFilePathFuzzy = scoreFilePathFuzzy;
Object.defineProperty(exports, "basename", {
  enumerable: true,
  get: function get() {
    return _path.basename;
  }
});
Object.defineProperty(exports, "dirname", {
  enumerable: true,
  get: function get() {
    return _path.dirname;
  }
});
exports.filePathAccessor = void 0;

var _path = require("./vscode_common/path");

var _fuzzyScorer = require("./vscode_common/fuzzyScorer");

Object.keys(_fuzzyScorer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _fuzzyScorer[key];
    }
  });
});
const filePathAccessor = {
  getItemLabel(fsPath) {
    return (0, _path.basename)(fsPath);
  },

  getItemDescription(fsPath) {
    return (0, _path.dirname)(fsPath);
  },

  getItemPath(fsPath) {
    return fsPath;
  }

};
exports.filePathAccessor = filePathAccessor;

function compareFilePathsByFuzzyScore({
  pathA,
  pathB,
  query,
  accessor = filePathAccessor,
  cache = {}
}) {
  const preparedQuery = typeof query === 'string' ? (0, _fuzzyScorer.prepareQuery)(query) : query;
  return (0, _fuzzyScorer.compareItemsByFuzzyScore)(pathA, pathB, preparedQuery, true, accessor, cache);
}

function scoreFilePathFuzzy({
  path,
  query,
  accessor = filePathAccessor,
  cache = {}
}) {
  const preparedQuery = typeof query === 'string' ? (0, _fuzzyScorer.prepareQuery)(query) : query;
  return (0, _fuzzyScorer.scoreItemFuzzy)(path, preparedQuery, true, accessor, cache);
}