"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.splice");

require("core-js/modules/es.map");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.promise");

require("core-js/modules/es.string.split");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setGlobalLeakWarningThreshold = setGlobalLeakWarningThreshold;
exports.Relay = exports.EventBufferer = exports.EventMultiplexer = exports.AsyncEmitter = exports.PauseableEmitter = exports.Emitter = exports.Event = void 0;

var _errors = require("./errors");

var _functional = require("./functional");

var _lifecycle = require("./lifecycle");

var _linkedList = require("./linkedList");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (_e2) { function e(_x) { return _e2.apply(this, arguments); } e.toString = function () { return _e2.toString(); }; return e; }(function (e) { throw e; }), f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function (_e3) { function e(_x2) { return _e3.apply(this, arguments); } e.toString = function () { return _e3.toString(); }; return e; }(function (e) { didErr = true; err = e; }), f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

let Event;
exports.Event = Event;

(function (_Event) {
  const None = _Event.None = () => _lifecycle.Disposable.None;

  function once(event) {
    return (listener, thisArgs = null, disposables) => {
      // we need this, in case the event fires during the listener call
      let didFire = false;
      let result;
      result = event(e => {
        if (didFire) {
          return;
        } else if (result) {
          result.dispose();
        } else {
          didFire = true;
        }

        return listener.call(thisArgs, e);
      }, null, disposables);

      if (didFire) {
        result.dispose();
      }

      return result;
    };
  }

  _Event.once = once;

  function map(event, map) {
    return snapshot((listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables));
  }

  _Event.map = map;

  function forEach(event, each) {
    return snapshot((listener, thisArgs = null, disposables) => event(i => {
      each(i);
      listener.call(thisArgs, i);
    }, null, disposables));
  }

  _Event.forEach = forEach;

  function filter(event, filter) {
    return snapshot((listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables));
  }

  _Event.filter = filter;

  function signal(event) {
    return event;
  }

  _Event.signal = signal;

  function any(...events) {
    return (listener, thisArgs = null, disposables) => (0, _lifecycle.combinedDisposable)(...events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
  }

  _Event.any = any;

  function reduce(event, merge, initial) {
    let output = initial;
    return map(event, e => {
      output = merge(output, e);
      return output;
    });
  }

  _Event.reduce = reduce;

  function snapshot(event) {
    let listener;
    const emitter = new Emitter({
      onFirstListenerAdd() {
        listener = event(emitter.fire, emitter);
      },

      onLastListenerRemove() {
        listener.dispose();
      }

    });
    return emitter.event;
  }

  _Event.snapshot = snapshot;

  function debounce(event, merge, delay = 100, leading = false, leakWarningThreshold) {
    let subscription;
    let output = undefined;
    let handle = undefined;
    let numDebouncedCalls = 0;
    const emitter = new Emitter({
      leakWarningThreshold,

      onFirstListenerAdd() {
        subscription = event(cur => {
          numDebouncedCalls++;
          output = merge(output, cur);

          if (leading && !handle) {
            emitter.fire(output);
            output = undefined;
          }

          clearTimeout(handle);
          handle = setTimeout(() => {
            const _output = output;
            output = undefined;
            handle = undefined;

            if (!leading || numDebouncedCalls > 1) {
              emitter.fire(_output);
            }

            numDebouncedCalls = 0;
          }, delay);
        });
      },

      onLastListenerRemove() {
        subscription.dispose();
      }

    });
    return emitter.event;
  }

  _Event.debounce = debounce;

  function stopwatch(event) {
    const start = new Date().getTime();
    return map(once(event), _ => new Date().getTime() - start);
  }

  _Event.stopwatch = stopwatch;

  function latch(event) {
    let firstCall = true;
    let cache;
    return filter(event, value => {
      const shouldEmit = firstCall || value !== cache;
      firstCall = false;
      cache = value;
      return shouldEmit;
    });
  }

  _Event.latch = latch;

  function buffer(event, nextTick = false, _buffer = []) {
    let buffer = _buffer.slice();

    let listener = event(e => {
      if (buffer) {
        buffer.push(e);
      } else {
        emitter.fire(e);
      }
    });

    const flush = () => {
      if (buffer) {
        buffer.forEach(e => emitter.fire(e));
      }

      buffer = null;
    };

    const emitter = new Emitter({
      onFirstListenerAdd() {
        if (!listener) {
          listener = event(e => emitter.fire(e));
        }
      },

      onFirstListenerDidAdd() {
        if (buffer) {
          if (nextTick) {
            setTimeout(flush);
          } else {
            flush();
          }
        }
      },

      onLastListenerRemove() {
        if (listener) {
          listener.dispose();
        }

        listener = null;
      }

    });
    return emitter.event;
  }

  _Event.buffer = buffer;

  class ChainableEvent {
    constructor(event) {
      this.event = event;
    }

    map(fn) {
      return new ChainableEvent(map(this.event, fn));
    }

    forEach(fn) {
      return new ChainableEvent(forEach(this.event, fn));
    }

    filter(fn) {
      return new ChainableEvent(filter(this.event, fn));
    }

    reduce(merge, initial) {
      return new ChainableEvent(reduce(this.event, merge, initial));
    }

    latch() {
      return new ChainableEvent(latch(this.event));
    }

    debounce(merge, delay = 100, leading = false, leakWarningThreshold) {
      return new ChainableEvent(debounce(this.event, merge, delay, leading, leakWarningThreshold));
    }

    on(listener, thisArgs, disposables) {
      return this.event(listener, thisArgs, disposables);
    }

    once(listener, thisArgs, disposables) {
      return once(this.event)(listener, thisArgs, disposables);
    }

  }

  function chain(event) {
    return new ChainableEvent(event);
  }

  _Event.chain = chain;

  function fromNodeEventEmitter(emitter, eventName, map = id => id) {
    const fn = (...args) => result.fire(map(...args));

    const onFirstListenerAdd = () => emitter.on(eventName, fn);

    const onLastListenerRemove = () => emitter.removeListener(eventName, fn);

    const result = new Emitter({
      onFirstListenerAdd,
      onLastListenerRemove
    });
    return result.event;
  }

  _Event.fromNodeEventEmitter = fromNodeEventEmitter;

  function fromDOMEventEmitter(emitter, eventName, map = id => id) {
    const fn = (...args) => result.fire(map(...args));

    const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);

    const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);

    const result = new Emitter({
      onFirstListenerAdd,
      onLastListenerRemove
    });
    return result.event;
  }

  _Event.fromDOMEventEmitter = fromDOMEventEmitter;

  function fromPromise(promise) {
    const emitter = new Emitter();
    let shouldEmit = false;
    promise.then(undefined, () => null).then(() => {
      if (!shouldEmit) {
        setTimeout(() => emitter.fire(undefined), 0);
      } else {
        emitter.fire(undefined);
      }
    });
    shouldEmit = true;
    return emitter.event;
  }

  _Event.fromPromise = fromPromise;

  function toPromise(event) {
    return new Promise(c => once(event)(c));
  }

  _Event.toPromise = toPromise;
})(Event || (exports.Event = Event = {}));

let _globalLeakWarningThreshold = -1;

function setGlobalLeakWarningThreshold(n) {
  const oldValue = _globalLeakWarningThreshold;
  _globalLeakWarningThreshold = n;
  return {
    dispose() {
      _globalLeakWarningThreshold = oldValue;
    }

  };
}

class LeakageMonitor {
  _warnCountdown = 0;

  constructor(customThreshold, name = Math.random().toString(18).slice(2, 5)) {
    this.customThreshold = customThreshold;
    this.name = name;
  }

  dispose() {
    if (this._stacks) {
      this._stacks.clear();
    }
  }

  check(listenerCount) {
    let threshold = _globalLeakWarningThreshold;

    if (typeof this.customThreshold === 'number') {
      threshold = this.customThreshold;
    }

    if (threshold <= 0 || listenerCount < threshold) {
      return undefined;
    }

    if (!this._stacks) {
      this._stacks = new Map();
    }

    const stack = new Error().stack.split('\n').slice(3).join('\n');
    const count = this._stacks.get(stack) || 0;

    this._stacks.set(stack, count + 1);

    this._warnCountdown -= 1;

    if (this._warnCountdown <= 0) {
      // only warn on first exceed and then every time the limit
      // is exceeded by 50% again
      this._warnCountdown = threshold * 0.5; // find most frequent listener and print warning

      let topStack;
      let topCount = 0;

      this._stacks.forEach((count, stack) => {
        if (!topStack || topCount < count) {
          topStack = stack;
          topCount = count;
        }
      });

      console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
      console.warn(topStack);
    }

    return () => {
      const count = this._stacks.get(stack) || 0;

      this._stacks.set(stack, count - 1);
    };
  }

}
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
	class Document {

		private readonly _onDidChange = new Emitter<(value:string)=>any>();

		public onDidChange = this._onDidChange.event;

		// getter-style
		// get onDidChange(): Event<(value:string)=>any> {
		// 	return this._onDidChange.event;
		// }

		private _doIt() {
			//...
			this._onDidChange.fire(value);
		}
	}
 */


class Emitter {
  static _noop = function () {};
  _disposed = false;

  constructor(options) {
    this._options = options;
    this._leakageMon = _globalLeakWarningThreshold > 0 ? new LeakageMonitor(this._options && this._options.leakWarningThreshold) : undefined;
  }
  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */


  get event() {
    if (!this._event) {
      this._event = (listener, thisArgs, disposables) => {
        if (!this._listeners) {
          this._listeners = new _linkedList.LinkedList();
        }

        const firstListener = this._listeners.isEmpty();

        if (firstListener && this._options && this._options.onFirstListenerAdd) {
          this._options.onFirstListenerAdd(this);
        }

        const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);

        if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
          this._options.onFirstListenerDidAdd(this);
        }

        if (this._options && this._options.onListenerDidAdd) {
          this._options.onListenerDidAdd(this, listener, thisArgs);
        } // check and record this emitter for potential leakage


        let removeMonitor;

        if (this._leakageMon) {
          removeMonitor = this._leakageMon.check(this._listeners.size);
        }

        let result;
        result = {
          dispose: () => {
            if (removeMonitor) {
              removeMonitor();
            }

            result.dispose = Emitter._noop;

            if (!this._disposed) {
              remove();

              if (this._options && this._options.onLastListenerRemove) {
                const hasListeners = this._listeners && !this._listeners.isEmpty();

                if (!hasListeners) {
                  this._options.onLastListenerRemove(this);
                }
              }
            }
          }
        };

        if (disposables instanceof _lifecycle.DisposableStore) {
          disposables.add(result);
        } else if (Array.isArray(disposables)) {
          disposables.push(result);
        }

        return result;
      };
    }

    return this._event;
  }
  /**
   * To be kept private to fire an event to
   * subscribers
   */


  fire(event) {
    if (this._listeners) {
      // put all [listener,event]-pairs into delivery queue
      // then emit all event. an inner/nested event might be
      // the driver of this
      if (!this._deliveryQueue) {
        this._deliveryQueue = new _linkedList.LinkedList();
      }

      var _iterator = _createForOfIteratorHelper(this._listeners),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          let listener = _step.value;

          this._deliveryQueue.push([listener, event]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      while (this._deliveryQueue.size > 0) {
        const _ref = this._deliveryQueue.shift(),
              _ref2 = _slicedToArray(_ref, 2),
              listener = _ref2[0],
              event = _ref2[1];

        try {
          if (typeof listener === 'function') {
            listener.call(undefined, event);
          } else {
            listener[0].call(listener[1], event);
          }
        } catch (e) {
          (0, _errors.onUnexpectedError)(e);
        }
      }
    }
  }

  dispose() {
    if (this._listeners) {
      this._listeners.clear();
    }

    if (this._deliveryQueue) {
      this._deliveryQueue.clear();
    }

    if (this._leakageMon) {
      this._leakageMon.dispose();
    }

    this._disposed = true;
  }

}

exports.Emitter = Emitter;

class PauseableEmitter extends Emitter {
  _isPaused = 0;
  _eventQueue = new _linkedList.LinkedList();

  constructor(options) {
    super(options);
    this._mergeFn = options && options.merge;
  }

  pause() {
    this._isPaused++;
  }

  resume() {
    if (this._isPaused !== 0 && --this._isPaused === 0) {
      if (this._mergeFn) {
        // use the merge function to create a single composite
        // event. make a copy in case firing pauses this emitter
        const events = this._eventQueue.toArray();

        this._eventQueue.clear();

        super.fire(this._mergeFn(events));
      } else {
        // no merging, fire each event individually and test
        // that this emitter isn't paused halfway through
        while (!this._isPaused && this._eventQueue.size !== 0) {
          super.fire(this._eventQueue.shift());
        }
      }
    }
  }

  fire(event) {
    if (this._listeners) {
      if (this._isPaused !== 0) {
        this._eventQueue.push(event);
      } else {
        super.fire(event);
      }
    }
  }

}

exports.PauseableEmitter = PauseableEmitter;

class AsyncEmitter extends Emitter {
  fireAsync(data, token, promiseJoin) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!_this._listeners) {
        return;
      }

      if (!_this._asyncDeliveryQueue) {
        _this._asyncDeliveryQueue = new _linkedList.LinkedList();
      }

      var _iterator2 = _createForOfIteratorHelper(_this._listeners),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          const listener = _step2.value;

          _this._asyncDeliveryQueue.push([listener, data]);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      while (_this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
        const _ref3 = _this._asyncDeliveryQueue.shift(),
              _ref4 = _slicedToArray(_ref3, 2),
              listener = _ref4[0],
              data = _ref4[1];

        const thenables = [];

        const event = _objectSpread(_objectSpread({}, data), {}, {
          waitUntil: p => {
            if (Object.isFrozen(thenables)) {
              throw new Error('waitUntil can NOT be called asynchronous');
            }

            if (promiseJoin) {
              p = promiseJoin(p, typeof listener === 'function' ? listener : listener[0]);
            }

            thenables.push(p);
          }
        });

        try {
          if (typeof listener === 'function') {
            listener.call(undefined, event);
          } else {
            listener[0].call(listener[1], event);
          }
        } catch (e) {
          (0, _errors.onUnexpectedError)(e);
          continue;
        } // freeze thenables-collection to enforce sync-calls to
        // wait until and then wait for all thenables to resolve


        Object.freeze(thenables);
        yield Promise.all(thenables).catch(e => (0, _errors.onUnexpectedError)(e));
      }
    })();
  }

}

exports.AsyncEmitter = AsyncEmitter;

class EventMultiplexer {
  hasListeners = false;
  events = [];

  constructor() {
    this.emitter = new Emitter({
      onFirstListenerAdd: () => this.onFirstListenerAdd(),
      onLastListenerRemove: () => this.onLastListenerRemove()
    });
  }

  get event() {
    return this.emitter.event;
  }

  add(event) {
    const e = {
      event: event,
      listener: null
    };
    this.events.push(e);

    if (this.hasListeners) {
      this.hook(e);
    }

    const dispose = () => {
      if (this.hasListeners) {
        this.unhook(e);
      }

      const idx = this.events.indexOf(e);
      this.events.splice(idx, 1);
    };

    return (0, _lifecycle.toDisposable)((0, _functional.once)(dispose));
  }

  onFirstListenerAdd() {
    this.hasListeners = true;
    this.events.forEach(e => this.hook(e));
  }

  onLastListenerRemove() {
    this.hasListeners = false;
    this.events.forEach(e => this.unhook(e));
  }

  hook(e) {
    e.listener = e.event(r => this.emitter.fire(r));
  }

  unhook(e) {
    if (e.listener) {
      e.listener.dispose();
    }

    e.listener = null;
  }

  dispose() {
    this.emitter.dispose();
  }

}
/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */


exports.EventMultiplexer = EventMultiplexer;

class EventBufferer {
  buffers = [];

  wrapEvent(event) {
    return (listener, thisArgs, disposables) => {
      return event(i => {
        const buffer = this.buffers[this.buffers.length - 1];

        if (buffer) {
          buffer.push(() => listener.call(thisArgs, i));
        } else {
          listener.call(thisArgs, i);
        }
      }, undefined, disposables);
    };
  }

  bufferEvents(fn) {
    const buffer = [];
    this.buffers.push(buffer);
    const r = fn();
    this.buffers.pop();
    buffer.forEach(flush => flush());
    return r;
  }

}
/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */


exports.EventBufferer = EventBufferer;

class Relay {
  listening = false;
  inputEvent = Event.None;
  inputEventListener = _lifecycle.Disposable.None;
  emitter = new Emitter({
    onFirstListenerDidAdd: () => {
      this.listening = true;
      this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
    },
    onLastListenerRemove: () => {
      this.listening = false;
      this.inputEventListener.dispose();
    }
  });
  event = this.emitter.event;

  set input(event) {
    this.inputEvent = event;

    if (this.listening) {
      this.inputEventListener.dispose();
      this.inputEventListener = event(this.emitter.fire, this.emitter);
    }
  }

  dispose() {
    this.inputEventListener.dispose();
    this.emitter.dispose();
  }

}

exports.Relay = Relay;