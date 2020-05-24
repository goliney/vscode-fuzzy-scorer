"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.map");

require("core-js/modules/es.set");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isDisposable = isDisposable;
exports.dispose = _dispose;
exports.combinedDisposable = combinedDisposable;
exports.toDisposable = toDisposable;
exports.ImmortalReference = exports.ReferenceCollection = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = void 0;

var _functional = require("./functional");

var _iterator2 = require("./iterator");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
 */
const TRACK_DISPOSABLES = false;
const __is_disposable_tracked__ = '__is_disposable_tracked__';

function markTracked(x) {
  if (!TRACK_DISPOSABLES) {
    return;
  }

  if (x && x !== Disposable.None) {
    try {
      x[__is_disposable_tracked__] = true;
    } catch (_unused) {// noop
    }
  }
}

function trackDisposable(x) {
  if (!TRACK_DISPOSABLES) {
    return x;
  }

  const stack = new Error('Potentially leaked disposable').stack;
  setTimeout(() => {
    if (!x[__is_disposable_tracked__]) {
      console.log(stack);
    }
  }, 3000);
  return x;
}

function isDisposable(thing) {
  return typeof thing.dispose === 'function' && thing.dispose.length === 0;
}

function _dispose(arg) {
  if (_iterator2.Iterable.is(arg)) {
    var _iterator = _createForOfIteratorHelper(arg),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        let d = _step.value;

        if (d) {
          markTracked(d);
          d.dispose();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return arg;
  } else if (arg) {
    markTracked(arg);
    arg.dispose();
    return arg;
  }
}

function combinedDisposable(...disposables) {
  disposables.forEach(markTracked);
  return trackDisposable({
    dispose: () => _dispose(disposables)
  });
}

function toDisposable(fn) {
  const self = trackDisposable({
    dispose: () => {
      markTracked(self);
      fn();
    }
  });
  return self;
}

class DisposableStore {
  static DISABLE_DISPOSED_WARNING = false;
  _toDispose = new Set();
  _isDisposed = false;
  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */

  dispose() {
    if (this._isDisposed) {
      return;
    }

    markTracked(this);
    this._isDisposed = true;
    this.clear();
  }
  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */


  clear() {
    this._toDispose.forEach(item => item.dispose());

    this._toDispose.clear();
  }

  add(t) {
    if (!t) {
      return t;
    }

    if (t === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    markTracked(t);

    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
      }
    } else {
      this._toDispose.add(t);
    }

    return t;
  }

}

exports.DisposableStore = DisposableStore;

class Disposable {
  static None = Object.freeze({
    dispose() {}

  });
  _store = new DisposableStore();

  constructor() {
    trackDisposable(this);
  }

  dispose() {
    markTracked(this);

    this._store.dispose();
  }

  _register(t) {
    if (t === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    return this._store.add(t);
  }

}
/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */


exports.Disposable = Disposable;

class MutableDisposable {
  _isDisposed = false;

  constructor() {
    trackDisposable(this);
  }

  get value() {
    return this._isDisposed ? undefined : this._value;
  }

  set value(value) {
    if (this._isDisposed || value === this._value) {
      return;
    }

    if (this._value) {
      this._value.dispose();
    }

    if (value) {
      markTracked(value);
    }

    this._value = value;
  }

  clear() {
    this.value = undefined;
  }

  dispose() {
    this._isDisposed = true;
    markTracked(this);

    if (this._value) {
      this._value.dispose();
    }

    this._value = undefined;
  }

}

exports.MutableDisposable = MutableDisposable;

class ReferenceCollection {
  references = new Map();

  acquire(key) {
    let reference = this.references.get(key);

    if (!reference) {
      reference = {
        counter: 0,
        object: this.createReferencedObject(key)
      };
      this.references.set(key, reference);
    }

    const _reference = reference,
          object = _reference.object;
    const dispose = (0, _functional.once)(() => {
      if (--reference.counter === 0) {
        this.destroyReferencedObject(key, reference.object);
        this.references.delete(key);
      }
    });
    reference.counter++;
    return {
      object,
      dispose
    };
  }

}

exports.ReferenceCollection = ReferenceCollection;

class ImmortalReference {
  constructor(object) {
    this.object = object;
  }

  dispose() {
    /* noop */
  }

}

exports.ImmortalReference = ImmortalReference;