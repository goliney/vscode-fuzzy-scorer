"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.promise");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadioGroup = exports.ActionRunner = exports.Action = void 0;

var _lifecycle = require("./lifecycle");

var _event = require("./event");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class Action extends _lifecycle.Disposable {
  _onDidChange = this._register(new _event.Emitter());
  onDidChange = this._onDidChange.event;
  _enabled = true;
  _checked = false;

  constructor(id, label = '', cssClass = '', enabled = true, actionCallback) {
    super();
    this._id = id;
    this._label = label;
    this._cssClass = cssClass;
    this._enabled = enabled;
    this._actionCallback = actionCallback;
  }

  get id() {
    return this._id;
  }

  get label() {
    return this._label;
  }

  set label(value) {
    this._setLabel(value);
  }

  _setLabel(value) {
    if (this._label !== value) {
      this._label = value;

      this._onDidChange.fire({
        label: value
      });
    }
  }

  get tooltip() {
    return this._tooltip || '';
  }

  set tooltip(value) {
    this._setTooltip(value);
  }

  _setTooltip(value) {
    if (this._tooltip !== value) {
      this._tooltip = value;

      this._onDidChange.fire({
        tooltip: value
      });
    }
  }

  get class() {
    return this._cssClass;
  }

  set class(value) {
    this._setClass(value);
  }

  _setClass(value) {
    if (this._cssClass !== value) {
      this._cssClass = value;

      this._onDidChange.fire({
        class: value
      });
    }
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    this._setEnabled(value);
  }

  _setEnabled(value) {
    if (this._enabled !== value) {
      this._enabled = value;

      this._onDidChange.fire({
        enabled: value
      });
    }
  }

  get checked() {
    return this._checked;
  }

  set checked(value) {
    this._setChecked(value);
  }

  _setChecked(value) {
    if (this._checked !== value) {
      this._checked = value;

      this._onDidChange.fire({
        checked: value
      });
    }
  }

  run(event, _data) {
    if (this._actionCallback) {
      return this._actionCallback(event);
    }

    return Promise.resolve(true);
  }

}

exports.Action = Action;

class ActionRunner extends _lifecycle.Disposable {
  _onDidBeforeRun = this._register(new _event.Emitter());
  onDidBeforeRun = this._onDidBeforeRun.event;
  _onDidRun = this._register(new _event.Emitter());
  onDidRun = this._onDidRun.event;

  run(action, context) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (!action.enabled) {
        return Promise.resolve(null);
      }

      _this._onDidBeforeRun.fire({
        action: action
      });

      try {
        const result = yield _this.runAction(action, context);

        _this._onDidRun.fire({
          action: action,
          result: result
        });
      } catch (error) {
        _this._onDidRun.fire({
          action: action,
          error: error
        });
      }
    })();
  }

  runAction(action, context) {
    const res = context ? action.run(context) : action.run();
    return Promise.resolve(res);
  }

}

exports.ActionRunner = ActionRunner;

class RadioGroup extends _lifecycle.Disposable {
  constructor(actions) {
    super();
    this.actions = actions;

    var _iterator = _createForOfIteratorHelper(actions),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const action = _step.value;

        this._register(action.onDidChange(e => {
          if (e.checked && action.checked) {
            var _iterator2 = _createForOfIteratorHelper(actions),
                _step2;

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                const candidate = _step2.value;

                if (candidate !== action) {
                  candidate.checked = false;
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        }));
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

}

exports.RadioGroup = RadioGroup;