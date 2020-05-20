"use strict";

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.string.includes");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fuzzyPathSearch;

function fuzzyPathSearch(paths, query) {
  return paths.filter(path => path.includes(query));
}