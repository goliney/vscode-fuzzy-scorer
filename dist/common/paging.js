"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.promise");

require("core-js/modules/es.set");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.singlePagePager = singlePagePager;
exports.mapPager = mapPager;
exports.mergePagers = mergePagers;
exports.DelayedPagedModel = exports.PagedModel = void 0;

var _types = require("./types");

var _cancellation = require("./cancellation");

var _errors = require("./errors");

var _arrays = require("./arrays");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function createPage(elements) {
  return {
    isResolved: !!elements,
    promise: null,
    cts: null,
    promiseIndexes: new Set(),
    elements: elements || []
  };
}
/**
 * A PagedModel is a stateful model over an abstracted paged collection.
 */


function singlePagePager(elements) {
  return {
    firstPage: elements,
    total: elements.length,
    pageSize: elements.length,
    getPage: (pageIndex, cancellationToken) => {
      return Promise.resolve(elements);
    }
  };
}

class PagedModel {
  pages = [];

  get length() {
    return this.pager.total;
  }

  constructor(arg) {
    this.pager = (0, _types.isArray)(arg) ? singlePagePager(arg) : arg;
    const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
    this.pages = [createPage(this.pager.firstPage.slice()), ...(0, _arrays.range)(totalPages - 1).map(() => createPage())];
  }

  isResolved(index) {
    const pageIndex = Math.floor(index / this.pager.pageSize);
    const page = this.pages[pageIndex];
    return !!page.isResolved;
  }

  get(index) {
    const pageIndex = Math.floor(index / this.pager.pageSize);
    const indexInPage = index % this.pager.pageSize;
    const page = this.pages[pageIndex];
    return page.elements[indexInPage];
  }

  resolve(index, cancellationToken) {
    if (cancellationToken.isCancellationRequested) {
      return Promise.reject((0, _errors.canceled)());
    }

    const pageIndex = Math.floor(index / this.pager.pageSize);
    const indexInPage = index % this.pager.pageSize;
    const page = this.pages[pageIndex];

    if (page.isResolved) {
      return Promise.resolve(page.elements[indexInPage]);
    }

    if (!page.promise) {
      page.cts = new _cancellation.CancellationTokenSource();
      page.promise = this.pager.getPage(pageIndex, page.cts.token).then(elements => {
        page.elements = elements;
        page.isResolved = true;
        page.promise = null;
        page.cts = null;
      }, err => {
        page.isResolved = false;
        page.promise = null;
        page.cts = null;
        return Promise.reject(err);
      });
    }

    cancellationToken.onCancellationRequested(() => {
      if (!page.cts) {
        return;
      }

      page.promiseIndexes.delete(index);

      if (page.promiseIndexes.size === 0) {
        page.cts.cancel();
      }
    });
    page.promiseIndexes.add(index);
    return page.promise.then(() => page.elements[indexInPage]);
  }

}

exports.PagedModel = PagedModel;

class DelayedPagedModel {
  get length() {
    return this.model.length;
  }

  constructor(model, timeout = 500) {
    this.model = model;
    this.timeout = timeout;
  }

  isResolved(index) {
    return this.model.isResolved(index);
  }

  get(index) {
    return this.model.get(index);
  }

  resolve(index, cancellationToken) {
    return new Promise((c, e) => {
      if (cancellationToken.isCancellationRequested) {
        return e((0, _errors.canceled)());
      }

      const timer = setTimeout(() => {
        if (cancellationToken.isCancellationRequested) {
          return e((0, _errors.canceled)());
        }

        timeoutCancellation.dispose();
        this.model.resolve(index, cancellationToken).then(c, e);
      }, this.timeout);
      const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
        clearTimeout(timer);
        timeoutCancellation.dispose();
        e((0, _errors.canceled)());
      });
    });
  }

}
/**
 * Similar to array.map, `mapPager` lets you map the elements of an
 * abstract paged collection to another type.
 */


exports.DelayedPagedModel = DelayedPagedModel;

function mapPager(pager, fn) {
  return {
    firstPage: pager.firstPage.map(fn),
    total: pager.total,
    pageSize: pager.pageSize,
    getPage: (pageIndex, token) => pager.getPage(pageIndex, token).then(r => r.map(fn))
  };
}
/**
 * Merges two pagers.
 */


function mergePagers(one, other) {
  return {
    firstPage: [...one.firstPage, ...other.firstPage],
    total: one.total + other.total,
    pageSize: one.pageSize + other.pageSize,

    getPage(pageIndex, token) {
      return Promise.all([one.getPage(pageIndex, token), other.getPage(pageIndex, token)]).then(([onePage, otherPage]) => [...onePage, ...otherPage]);
    }

  };
}