"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fuzzyScorer = require("./vscode_common/fuzzyScorer");

Object.keys(_fuzzyScorer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _fuzzyScorer[key];
    }
  });
});