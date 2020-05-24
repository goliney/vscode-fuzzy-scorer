"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.map");

require("core-js/modules/es.promise");

require("core-js/modules/es.promise.finally");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isThenable = isThenable;
exports.createCancelablePromise = createCancelablePromise;
exports.raceCancellation = raceCancellation;
exports.raceTimeout = raceTimeout;
exports.asPromise = asPromise;
exports.timeout = timeout;
exports.disposableTimeout = disposableTimeout;
exports.ignoreErrors = ignoreErrors;
exports.sequence = sequence;
exports.first = first;
exports.retry = retry;
exports.TaskSequentializer = exports.IdleValue = exports.runWhenIdle = exports.RunOnceWorker = exports.RunOnceScheduler = exports.IntervalTimer = exports.TimeoutTimer = exports.ResourceQueue = exports.Queue = exports.Limiter = exports.Barrier = exports.ThrottledDelayer = exports.Delayer = exports.Sequencer = exports.Throttler = void 0;

var _cancellation = require("./cancellation");

var errors = _interopRequireWildcard(require("./errors"));

var _event = require("./event");

var _lifecycle = require("./lifecycle");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function isThenable(obj) {
  return obj && typeof obj.then === 'function';
}

function createCancelablePromise(callback) {
  const source = new _cancellation.CancellationTokenSource();
  const thenable = callback(source.token);
  const promise = new Promise((resolve, reject) => {
    source.token.onCancellationRequested(() => {
      reject(errors.canceled());
    });
    Promise.resolve(thenable).then(value => {
      source.dispose();
      resolve(value);
    }, err => {
      source.dispose();
      reject(err);
    });
  });
  return new class {
    cancel() {
      source.cancel();
    }

    then(resolve, reject) {
      return promise.then(resolve, reject);
    }

    catch(reject) {
      return this.then(undefined, reject);
    }

    finally(onfinally) {
      return promise.finally(onfinally);
    }

  }();
}

function raceCancellation(promise, token, defaultValue) {
  return Promise.race([promise, new Promise(resolve => token.onCancellationRequested(() => resolve(defaultValue)))]);
}

function raceTimeout(promise, timeout, onTimeout) {
  let promiseResolve = undefined;
  const timer = setTimeout(() => {
    var _promiseResolve;

    (_promiseResolve = promiseResolve) === null || _promiseResolve === void 0 ? void 0 : _promiseResolve();
    onTimeout === null || onTimeout === void 0 ? void 0 : onTimeout();
  }, timeout);
  return Promise.race([promise.finally(() => clearTimeout(timer)), new Promise(resolve => promiseResolve = resolve)]);
}

function asPromise(callback) {
  return new Promise((resolve, reject) => {
    const item = callback();

    if (isThenable(item)) {
      item.then(resolve, reject);
    } else {
      resolve(item);
    }
  });
}

/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 * 		const throttler = new Throttler();
 * 		const letters = [];
 *
 * 		function deliver() {
 * 			const lettersToDeliver = letters;
 * 			letters = [];
 * 			return makeTheTrip(lettersToDeliver);
 * 		}
 *
 * 		function onLetterReceived(l) {
 * 			letters.push(l);
 * 			throttler.queue(deliver);
 * 		}
 */
class Throttler {
  constructor() {
    this.activePromise = null;
    this.queuedPromise = null;
    this.queuedPromiseFactory = null;
  }

  queue(promiseFactory) {
    if (this.activePromise) {
      this.queuedPromiseFactory = promiseFactory;

      if (!this.queuedPromise) {
        const onComplete = () => {
          this.queuedPromise = null;
          const result = this.queue(this.queuedPromiseFactory);
          this.queuedPromiseFactory = null;
          return result;
        };

        this.queuedPromise = new Promise(c => {
          this.activePromise.then(onComplete, onComplete).then(c);
        });
      }

      return new Promise((c, e) => {
        this.queuedPromise.then(c, e);
      });
    }

    this.activePromise = promiseFactory();
    return new Promise((c, e) => {
      this.activePromise.then(result => {
        this.activePromise = null;
        c(result);
      }, err => {
        this.activePromise = null;
        e(err);
      });
    });
  }

}

exports.Throttler = Throttler;

class Sequencer {
  current = Promise.resolve(null);

  queue(promiseTask) {
    return this.current = this.current.then(() => promiseTask());
  }

}
/**
 * A helper to delay execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 * 		const delayer = new Delayer(WAITING_PERIOD);
 * 		const letters = [];
 *
 * 		function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */


exports.Sequencer = Sequencer;

class Delayer {
  constructor(defaultDelay) {
    this.defaultDelay = defaultDelay;
    this.timeout = null;
    this.completionPromise = null;
    this.doResolve = null;
    this.doReject = null;
    this.task = null;
  }

  trigger(task, delay = this.defaultDelay) {
    this.task = task;
    this.cancelTimeout();

    if (!this.completionPromise) {
      this.completionPromise = new Promise((c, e) => {
        this.doResolve = c;
        this.doReject = e;
      }).then(() => {
        this.completionPromise = null;
        this.doResolve = null;

        if (this.task) {
          const task = this.task;
          this.task = null;
          return task();
        }

        return undefined;
      });
    }

    this.timeout = setTimeout(() => {
      this.timeout = null;

      if (this.doResolve) {
        this.doResolve(null);
      }
    }, delay);
    return this.completionPromise;
  }

  isTriggered() {
    return this.timeout !== null;
  }

  cancel() {
    this.cancelTimeout();

    if (this.completionPromise) {
      if (this.doReject) {
        this.doReject(errors.canceled());
      }

      this.completionPromise = null;
    }
  }

  cancelTimeout() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  dispose() {
    this.cancelTimeout();
  }

}
/**
 * A helper to delay execution of a task that is being requested often, while
 * preventing accumulation of consecutive executions, while the task runs.
 *
 * The mail man is clever and waits for a certain amount of time, before going
 * out to deliver letters. While the mail man is going out, more letters arrive
 * and can only be delivered once he is back. Once he is back the mail man will
 * do one more trip to deliver the letters that have accumulated while he was out.
 */


exports.Delayer = Delayer;

class ThrottledDelayer {
  constructor(defaultDelay) {
    this.delayer = new Delayer(defaultDelay);
    this.throttler = new Throttler();
  }

  trigger(promiseFactory, delay) {
    return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
  }

  isTriggered() {
    return this.delayer.isTriggered();
  }

  cancel() {
    this.delayer.cancel();
  }

  dispose() {
    this.delayer.dispose();
  }

}
/**
 * A barrier that is initially closed and then becomes opened permanently.
 */


exports.ThrottledDelayer = ThrottledDelayer;

class Barrier {
  constructor() {
    this._isOpen = false;
    this._promise = new Promise((c, e) => {
      this._completePromise = c;
    });
  }

  isOpen() {
    return this._isOpen;
  }

  open() {
    this._isOpen = true;

    this._completePromise(true);
  }

  wait() {
    return this._promise;
  }

}

exports.Barrier = Barrier;

function timeout(millis, token) {
  if (!token) {
    return createCancelablePromise(token => timeout(millis, token));
  }

  return new Promise((resolve, reject) => {
    const handle = setTimeout(resolve, millis);
    token.onCancellationRequested(() => {
      clearTimeout(handle);
      reject(errors.canceled());
    });
  });
}

function disposableTimeout(handler, timeout = 0) {
  const timer = setTimeout(handler, timeout);
  return (0, _lifecycle.toDisposable)(() => clearTimeout(timer));
}

function ignoreErrors(promise) {
  return promise.then(undefined, _ => undefined);
}
/**
 * Runs the provided list of promise factories in sequential order. The returned
 * promise will complete to an array of results from each promise.
 */


function sequence(promiseFactories) {
  const results = [];
  let index = 0;
  const len = promiseFactories.length;

  function next() {
    return index < len ? promiseFactories[index++]() : null;
  }

  function thenHandler(result) {
    if (result !== undefined && result !== null) {
      results.push(result);
    }

    const n = next();

    if (n) {
      return n.then(thenHandler);
    }

    return Promise.resolve(results);
  }

  return Promise.resolve(null).then(thenHandler);
}

function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
  let index = 0;
  const len = promiseFactories.length;

  const loop = () => {
    if (index >= len) {
      return Promise.resolve(defaultValue);
    }

    const factory = promiseFactories[index++];
    const promise = Promise.resolve(factory());
    return promise.then(result => {
      if (shouldStop(result)) {
        return Promise.resolve(result);
      }

      return loop();
    });
  };

  return loop();
}

/**
 * A helper to queue N promises and run them all with a max degree of parallelism. The helper
 * ensures that at any time no more than M promises are running at the same time.
 */
class Limiter {
  _size = 0;

  constructor(maxDegreeOfParalellism) {
    this.maxDegreeOfParalellism = maxDegreeOfParalellism;
    this.outstandingPromises = [];
    this.runningPromises = 0;
    this._onFinished = new _event.Emitter();
  }

  get onFinished() {
    return this._onFinished.event;
  }

  get size() {
    return this._size; // return this.runningPromises + this.outstandingPromises.length;
  }

  queue(factory) {
    this._size++;
    return new Promise((c, e) => {
      this.outstandingPromises.push({
        factory,
        c,
        e
      });
      this.consume();
    });
  }

  consume() {
    while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
      const iLimitedTask = this.outstandingPromises.shift();
      this.runningPromises++;
      const promise = iLimitedTask.factory();
      promise.then(iLimitedTask.c, iLimitedTask.e);
      promise.then(() => this.consumed(), () => this.consumed());
    }
  }

  consumed() {
    this._size--;
    this.runningPromises--;

    if (this.outstandingPromises.length > 0) {
      this.consume();
    } else {
      this._onFinished.fire();
    }
  }

  dispose() {
    this._onFinished.dispose();
  }

}
/**
 * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
 */


exports.Limiter = Limiter;

class Queue extends Limiter {
  constructor() {
    super(1);
  }

}
/**
 * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
 * by disposing them once the queue is empty.
 */


exports.Queue = Queue;

class ResourceQueue {
  queues = new Map();

  queueFor(resource) {
    const key = resource.toString();

    if (!this.queues.has(key)) {
      const queue = new Queue();
      queue.onFinished(() => {
        queue.dispose();
        this.queues.delete(key);
      });
      this.queues.set(key, queue);
    }

    return this.queues.get(key);
  }

  dispose() {
    this.queues.forEach(queue => queue.dispose());
    this.queues.clear();
  }

}

exports.ResourceQueue = ResourceQueue;

class TimeoutTimer {
  constructor(runner, timeout) {
    this._token = -1;

    if (typeof runner === 'function' && typeof timeout === 'number') {
      this.setIfNotSet(runner, timeout);
    }
  }

  dispose() {
    this.cancel();
  }

  cancel() {
    if (this._token !== -1) {
      clearTimeout(this._token);
      this._token = -1;
    }
  }

  cancelAndSet(runner, timeout) {
    this.cancel();
    this._token = setTimeout(() => {
      this._token = -1;
      runner();
    }, timeout);
  }

  setIfNotSet(runner, timeout) {
    if (this._token !== -1) {
      // timer is already set
      return;
    }

    this._token = setTimeout(() => {
      this._token = -1;
      runner();
    }, timeout);
  }

}

exports.TimeoutTimer = TimeoutTimer;

class IntervalTimer {
  constructor() {
    this._token = -1;
  }

  dispose() {
    this.cancel();
  }

  cancel() {
    if (this._token !== -1) {
      clearInterval(this._token);
      this._token = -1;
    }
  }

  cancelAndSet(runner, interval) {
    this.cancel();
    this._token = setInterval(() => {
      runner();
    }, interval);
  }

}

exports.IntervalTimer = IntervalTimer;

class RunOnceScheduler {
  constructor(runner, timeout) {
    this.timeoutToken = -1;
    this.runner = runner;
    this.timeout = timeout;
    this.timeoutHandler = this.onTimeout.bind(this);
  }
  /**
   * Dispose RunOnceScheduler
   */


  dispose() {
    this.cancel();
    this.runner = null;
  }
  /**
   * Cancel current scheduled runner (if any).
   */


  cancel() {
    if (this.isScheduled()) {
      clearTimeout(this.timeoutToken);
      this.timeoutToken = -1;
    }
  }
  /**
   * Cancel previous runner (if any) & schedule a new runner.
   */


  schedule(delay = this.timeout) {
    this.cancel();
    this.timeoutToken = setTimeout(this.timeoutHandler, delay);
  }
  /**
   * Returns true if scheduled.
   */


  isScheduled() {
    return this.timeoutToken !== -1;
  }

  onTimeout() {
    this.timeoutToken = -1;

    if (this.runner) {
      this.doRun();
    }
  }

  doRun() {
    if (this.runner) {
      this.runner();
    }
  }

}

exports.RunOnceScheduler = RunOnceScheduler;

class RunOnceWorker extends RunOnceScheduler {
  units = [];

  constructor(runner, timeout) {
    super(runner, timeout);
  }

  work(unit) {
    this.units.push(unit);

    if (!this.isScheduled()) {
      this.schedule();
    }
  }

  doRun() {
    const units = this.units;
    this.units = [];

    if (this.runner) {
      this.runner(units);
    }
  }

  dispose() {
    this.units = [];
    super.dispose();
  }

} //#region -- run on idle tricks ------------


exports.RunOnceWorker = RunOnceWorker;

/**
 * Execute the callback the next time the browser is idle
 */
let runWhenIdle;
exports.runWhenIdle = runWhenIdle;

(function () {
  if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
    const dummyIdle = Object.freeze({
      didTimeout: true,

      timeRemaining() {
        return 15;
      }

    });

    exports.runWhenIdle = runWhenIdle = runner => {
      const handle = setTimeout(() => runner(dummyIdle));
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }

          disposed = true;
          clearTimeout(handle);
        }

      };
    };
  } else {
    exports.runWhenIdle = runWhenIdle = (runner, timeout) => {
      const handle = requestIdleCallback(runner, typeof timeout === 'number' ? {
        timeout
      } : undefined);
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }

          disposed = true;
          cancelIdleCallback(handle);
        }

      };
    };
  }
})();
/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */


class IdleValue {
  _didRun = false;

  constructor(executor) {
    this._executor = () => {
      try {
        this._value = executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._didRun = true;
      }
    };

    this._handle = runWhenIdle(() => this._executor());
  }

  dispose() {
    this._handle.dispose();
  }

  get value() {
    if (!this._didRun) {
      this._handle.dispose();

      this._executor();
    }

    if (this._error) {
      throw this._error;
    }

    return this._value;
  }

} //#endregion


exports.IdleValue = IdleValue;

function retry(_x, _x2, _x3) {
  return _retry.apply(this, arguments);
} //#region Task Sequentializer


function _retry() {
  _retry = _asyncToGenerator(function* (task, delay, retries) {
    let lastError;

    for (let i = 0; i < retries; i++) {
      try {
        return yield task();
      } catch (error) {
        lastError = error;
        yield timeout(delay);
      }
    }

    throw lastError;
  });
  return _retry.apply(this, arguments);
}

class TaskSequentializer {
  hasPending(taskId) {
    if (!this._pending) {
      return false;
    }

    if (typeof taskId === 'number') {
      return this._pending.taskId === taskId;
    }

    return !!this._pending;
  }

  get pending() {
    return this._pending ? this._pending.promise : undefined;
  }

  cancelPending() {
    var _this$_pending;

    (_this$_pending = this._pending) === null || _this$_pending === void 0 ? void 0 : _this$_pending.cancel();
  }

  setPending(taskId, promise, onCancel) {
    this._pending = {
      taskId: taskId,
      cancel: () => onCancel === null || onCancel === void 0 ? void 0 : onCancel(),
      promise
    };
    promise.then(() => this.donePending(taskId), () => this.donePending(taskId));
    return promise;
  }

  donePending(taskId) {
    if (this._pending && taskId === this._pending.taskId) {
      // only set pending to done if the promise finished that is associated with that taskId
      this._pending = undefined; // schedule the next task now that we are free if we have any

      this.triggerNext();
    }
  }

  triggerNext() {
    if (this._next) {
      const next = this._next;
      this._next = undefined; // Run next task and complete on the associated promise

      next.run().then(next.promiseResolve, next.promiseReject);
    }
  }

  setNext(run) {
    // this is our first next task, so we create associated promise with it
    // so that we can return a promise that completes when the task has
    // completed.
    if (!this._next) {
      let promiseResolve;
      let promiseReject;
      const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
      });
      this._next = {
        run,
        promise,
        promiseResolve: promiseResolve,
        promiseReject: promiseReject
      };
    } // we have a previous next task, just overwrite it
    else {
        this._next.run = run;
      }

    return this._next.promise;
  }

} //#endregion


exports.TaskSequentializer = TaskSequentializer;