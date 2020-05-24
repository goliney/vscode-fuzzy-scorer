"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.string.match");

require("core-js/modules/es.string.trim");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeybindingParser = void 0;

var _keyCodes = require("./keyCodes");

var _scanCode = require("./scanCode");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

class KeybindingParser {
  static _readModifiers(input) {
    input = input.toLowerCase().trim();
    let ctrl = false;
    let shift = false;
    let alt = false;
    let meta = false;
    let matchedModifier;

    do {
      matchedModifier = false;

      if (/^ctrl(\+|\-)/.test(input)) {
        ctrl = true;
        input = input.substr('ctrl-'.length);
        matchedModifier = true;
      }

      if (/^shift(\+|\-)/.test(input)) {
        shift = true;
        input = input.substr('shift-'.length);
        matchedModifier = true;
      }

      if (/^alt(\+|\-)/.test(input)) {
        alt = true;
        input = input.substr('alt-'.length);
        matchedModifier = true;
      }

      if (/^meta(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr('meta-'.length);
        matchedModifier = true;
      }

      if (/^win(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr('win-'.length);
        matchedModifier = true;
      }

      if (/^cmd(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr('cmd-'.length);
        matchedModifier = true;
      }
    } while (matchedModifier);

    let key;
    const firstSpaceIdx = input.indexOf(' ');

    if (firstSpaceIdx > 0) {
      key = input.substring(0, firstSpaceIdx);
      input = input.substring(firstSpaceIdx);
    } else {
      key = input;
      input = '';
    }

    return {
      remains: input,
      ctrl,
      shift,
      alt,
      meta,
      key
    };
  }

  static parseSimpleKeybinding(input) {
    const mods = this._readModifiers(input);

    const keyCode = _keyCodes.KeyCodeUtils.fromUserSettings(mods.key);

    return [new _keyCodes.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
  }

  static parseKeybinding(input, OS) {
    if (!input) {
      return null;
    }

    const parts = [];
    let part;

    do {
      var _this$parseSimpleKeyb = this.parseSimpleKeybinding(input);

      var _this$parseSimpleKeyb2 = _slicedToArray(_this$parseSimpleKeyb, 2);

      part = _this$parseSimpleKeyb2[0];
      input = _this$parseSimpleKeyb2[1];
      parts.push(part);
    } while (input.length > 0);

    return new _keyCodes.ChordKeybinding(parts);
  }

  static parseSimpleUserBinding(input) {
    const mods = this._readModifiers(input);

    const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);

    if (scanCodeMatch) {
      const strScanCode = scanCodeMatch[1];

      const scanCode = _scanCode.ScanCodeUtils.lowerCaseToEnum(strScanCode);

      return [new _scanCode.ScanCodeBinding(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
    }

    const keyCode = _keyCodes.KeyCodeUtils.fromUserSettings(mods.key);

    return [new _keyCodes.SimpleKeybinding(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
  }

  static parseUserBinding(input) {
    if (!input) {
      return [];
    }

    const parts = [];
    let part;

    while (input.length > 0) {
      var _this$parseSimpleUser = this.parseSimpleUserBinding(input);

      var _this$parseSimpleUser2 = _slicedToArray(_this$parseSimpleUser, 2);

      part = _this$parseSimpleUser2[0];
      input = _this$parseSimpleUser2[1];
      parts.push(part);
    }

    return parts;
  }

}

exports.KeybindingParser = KeybindingParser;