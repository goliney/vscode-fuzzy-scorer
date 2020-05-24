"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Range = void 0;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
let Range;
exports.Range = Range;

(function (_Range) {
  function intersect(one, other) {
    if (one.start >= other.end || other.start >= one.end) {
      return {
        start: 0,
        end: 0
      };
    }

    const start = Math.max(one.start, other.start);
    const end = Math.min(one.end, other.end);

    if (end - start <= 0) {
      return {
        start: 0,
        end: 0
      };
    }

    return {
      start,
      end
    };
  }

  _Range.intersect = intersect;

  function isEmpty(range) {
    return range.end - range.start <= 0;
  }

  _Range.isEmpty = isEmpty;

  function intersects(one, other) {
    return !isEmpty(intersect(one, other));
  }

  _Range.intersects = intersects;

  function relativeComplement(one, other) {
    const result = [];
    const first = {
      start: one.start,
      end: Math.min(other.start, one.end)
    };
    const second = {
      start: Math.max(other.end, one.start),
      end: one.end
    };

    if (!isEmpty(first)) {
      result.push(first);
    }

    if (!isEmpty(second)) {
      result.push(second);
    }

    return result;
  }

  _Range.relativeComplement = relativeComplement;
})(Range || (exports.Range = Range = {}));