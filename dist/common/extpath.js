"use strict";

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.string.ends-with");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.trim");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPathSeparator = isPathSeparator;
exports.toSlashes = toSlashes;
exports.getRoot = getRoot;
exports.isUNC = isUNC;
exports.isValidBasename = isValidBasename;
exports.isEqual = isEqual;
exports.isEqualOrParent = isEqualOrParent;
exports.isWindowsDriveLetter = isWindowsDriveLetter;
exports.sanitizeFilePath = sanitizeFilePath;
exports.isRootOrDriveLetter = isRootOrDriveLetter;
exports.indexOfPath = indexOfPath;

var _platform = require("./platform");

var _strings = require("./strings");

var _charCode = require("./charCode");

var _path = require("./path");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function isPathSeparator(code) {
  return code === _charCode.CharCode.Slash || code === _charCode.CharCode.Backslash;
}
/**
 * Takes a Windows OS path and changes backward slashes to forward slashes.
 * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
 * Using it on a Linux or MaxOS path might change it.
 */


function toSlashes(osPath) {
  return osPath.replace(/[\\/]/g, _path.posix.sep);
}
/**
 * Computes the _root_ this path, like `getRoot('c:\files') === c:\`,
 * `getRoot('files:///files/path') === files:///`,
 * or `getRoot('\\server\shares\path') === \\server\shares\`
 */


function getRoot(path, sep = _path.posix.sep) {
  if (!path) {
    return '';
  }

  const len = path.length;
  const firstLetter = path.charCodeAt(0);

  if (isPathSeparator(firstLetter)) {
    if (isPathSeparator(path.charCodeAt(1))) {
      // UNC candidate \\localhost\shares\ddd
      //               ^^^^^^^^^^^^^^^^^^^
      if (!isPathSeparator(path.charCodeAt(2))) {
        let pos = 3;
        const start = pos;

        for (; pos < len; pos++) {
          if (isPathSeparator(path.charCodeAt(pos))) {
            break;
          }
        }

        if (start !== pos && !isPathSeparator(path.charCodeAt(pos + 1))) {
          pos += 1;

          for (; pos < len; pos++) {
            if (isPathSeparator(path.charCodeAt(pos))) {
              return path.slice(0, pos + 1) // consume this separator
              .replace(/[\\/]/g, sep);
            }
          }
        }
      }
    } // /user/far
    // ^


    return sep;
  } else if (isWindowsDriveLetter(firstLetter)) {
    // check for windows drive letter c:\ or c:
    if (path.charCodeAt(1) === _charCode.CharCode.Colon) {
      if (isPathSeparator(path.charCodeAt(2))) {
        // C:\fff
        // ^^^
        return path.slice(0, 2) + sep;
      } else {
        // C:
        // ^^
        return path.slice(0, 2);
      }
    }
  } // check for URI
  // scheme://authority/path
  // ^^^^^^^^^^^^^^^^^^^


  let pos = path.indexOf('://');

  if (pos !== -1) {
    pos += 3; // 3 -> "://".length

    for (; pos < len; pos++) {
      if (isPathSeparator(path.charCodeAt(pos))) {
        return path.slice(0, pos + 1); // consume this separator
      }
    }
  }

  return '';
}
/**
 * Check if the path follows this pattern: `\\hostname\sharename`.
 *
 * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
 * @return A boolean indication if the path is a UNC path, on none-windows
 * always false.
 */


function isUNC(path) {
  if (!_platform.isWindows) {
    // UNC is a windows concept
    return false;
  }

  if (!path || path.length < 5) {
    // at least \\a\b
    return false;
  }

  let code = path.charCodeAt(0);

  if (code !== _charCode.CharCode.Backslash) {
    return false;
  }

  code = path.charCodeAt(1);

  if (code !== _charCode.CharCode.Backslash) {
    return false;
  }

  let pos = 2;
  const start = pos;

  for (; pos < path.length; pos++) {
    code = path.charCodeAt(pos);

    if (code === _charCode.CharCode.Backslash) {
      break;
    }
  }

  if (start === pos) {
    return false;
  }

  code = path.charCodeAt(pos + 1);

  if (isNaN(code) || code === _charCode.CharCode.Backslash) {
    return false;
  }

  return true;
} // Reference: https://en.wikipedia.org/wiki/Filename


const WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g;
const UNIX_INVALID_FILE_CHARS = /[\\/]/g;
const WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])$/i;

function isValidBasename(name, isWindowsOS = _platform.isWindows) {
  const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS;

  if (!name || name.length === 0 || /^\s+$/.test(name)) {
    return false; // require a name that is not just whitespace
  }

  invalidFileChars.lastIndex = 0; // the holy grail of software development

  if (invalidFileChars.test(name)) {
    return false; // check for certain invalid file characters
  }

  if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name)) {
    return false; // check for certain invalid file names
  }

  if (name === '.' || name === '..') {
    return false; // check for reserved values
  }

  if (isWindowsOS && name[name.length - 1] === '.') {
    return false; // Windows: file cannot end with a "."
  }

  if (isWindowsOS && name.length !== name.trim().length) {
    return false; // Windows: file cannot end with a whitespace
  }

  if (name.length > 255) {
    return false; // most file systems do not allow files > 255 length
  }

  return true;
}

function isEqual(pathA, pathB, ignoreCase) {
  const identityEquals = pathA === pathB;

  if (!ignoreCase || identityEquals) {
    return identityEquals;
  }

  if (!pathA || !pathB) {
    return false;
  }

  return (0, _strings.equalsIgnoreCase)(pathA, pathB);
}

function isEqualOrParent(path, candidate, ignoreCase, separator = _path.sep) {
  if (path === candidate) {
    return true;
  }

  if (!path || !candidate) {
    return false;
  }

  if (candidate.length > path.length) {
    return false;
  }

  if (ignoreCase) {
    const beginsWith = (0, _strings.startsWithIgnoreCase)(path, candidate);

    if (!beginsWith) {
      return false;
    }

    if (candidate.length === path.length) {
      return true; // same path, different casing
    }

    let sepOffset = candidate.length;

    if (candidate.charAt(candidate.length - 1) === separator) {
      sepOffset--; // adjust the expected sep offset in case our candidate already ends in separator character
    }

    return path.charAt(sepOffset) === separator;
  }

  if (candidate.charAt(candidate.length - 1) !== separator) {
    candidate += separator;
  }

  return path.indexOf(candidate) === 0;
}

function isWindowsDriveLetter(char0) {
  return char0 >= _charCode.CharCode.A && char0 <= _charCode.CharCode.Z || char0 >= _charCode.CharCode.a && char0 <= _charCode.CharCode.z;
}

function sanitizeFilePath(candidate, cwd) {
  // Special case: allow to open a drive letter without trailing backslash
  if (_platform.isWindows && candidate.endsWith(':')) {
    candidate += _path.sep;
  } // Ensure absolute


  if (!(0, _path.isAbsolute)(candidate)) {
    candidate = (0, _path.join)(cwd, candidate);
  } // Ensure normalized


  candidate = (0, _path.normalize)(candidate); // Ensure no trailing slash/backslash

  if (_platform.isWindows) {
    candidate = (0, _strings.rtrim)(candidate, _path.sep); // Special case: allow to open drive root ('C:\')

    if (candidate.endsWith(':')) {
      candidate += _path.sep;
    }
  } else {
    candidate = (0, _strings.rtrim)(candidate, _path.sep); // Special case: allow to open root ('/')

    if (!candidate) {
      candidate = _path.sep;
    }
  }

  return candidate;
}

function isRootOrDriveLetter(path) {
  const pathNormalized = (0, _path.normalize)(path);

  if (_platform.isWindows) {
    if (path.length > 3) {
      return false;
    }

    return isWindowsDriveLetter(pathNormalized.charCodeAt(0)) && pathNormalized.charCodeAt(1) === _charCode.CharCode.Colon && (path.length === 2 || pathNormalized.charCodeAt(2) === _charCode.CharCode.Backslash);
  }

  return pathNormalized === _path.posix.sep;
}

function indexOfPath(path, candidate, ignoreCase) {
  if (candidate.length > path.length) {
    return -1;
  }

  if (path === candidate) {
    return 0;
  }

  if (ignoreCase) {
    path = path.toLowerCase();
    candidate = candidate.toLowerCase();
  }

  return path.indexOf(candidate);
}