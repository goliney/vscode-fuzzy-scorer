"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.string.ends-with");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.starts-with");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPathLabel = getPathLabel;
exports.getBaseLabel = getBaseLabel;
exports.normalizeDriveLetter = normalizeDriveLetter;
exports.tildify = tildify;
exports.untildify = untildify;
exports.shorten = shorten;
exports.template = template;
exports.mnemonicMenuLabel = mnemonicMenuLabel;
exports.mnemonicButtonLabel = mnemonicButtonLabel;
exports.unmnemonicLabel = unmnemonicLabel;
exports.splitName = splitName;

var _uri = require("./uri");

var _path = require("./path");

var _strings = require("./strings");

var _network = require("./network");

var _platform = require("./platform");

var _resources = require("./resources");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/**
 * @deprecated use LabelService instead
 */
function getPathLabel(resource, userHomeProvider, rootProvider) {
  if (typeof resource === 'string') {
    resource = _uri.URI.file(resource);
  } // return early if we can resolve a relative path label from the root


  if (rootProvider) {
    const baseResource = rootProvider.getWorkspaceFolder(resource);

    if (baseResource) {
      const hasMultipleRoots = rootProvider.getWorkspace().folders.length > 1;
      let pathLabel;

      if ((0, _resources.isEqual)(baseResource.uri, resource)) {
        pathLabel = ''; // no label if paths are identical
      } else {
        pathLabel = (0, _resources.relativePath)(baseResource.uri, resource);
      }

      if (hasMultipleRoots) {
        const rootName = baseResource.name ? baseResource.name : (0, _resources.basename)(baseResource.uri);
        pathLabel = pathLabel ? rootName + ' • ' + pathLabel : rootName; // always show root basename if there are multiple
      }

      return pathLabel;
    }
  } // return if the resource is neither file:// nor untitled:// and no baseResource was provided


  if (resource.scheme !== _network.Schemas.file && resource.scheme !== _network.Schemas.untitled) {
    return resource.with({
      query: null,
      fragment: null
    }).toString(true);
  } // convert c:\something => C:\something


  if (hasDriveLetter(resource.fsPath)) {
    return (0, _path.normalize)(normalizeDriveLetter(resource.fsPath));
  } // normalize and tildify (macOS, Linux only)


  let res = (0, _path.normalize)(resource.fsPath);

  if (!_platform.isWindows && (userHomeProvider === null || userHomeProvider === void 0 ? void 0 : userHomeProvider.userHome)) {
    res = tildify(res, userHomeProvider.userHome.fsPath);
  }

  return res;
}

function getBaseLabel(resource) {
  if (!resource) {
    return undefined;
  }

  if (typeof resource === 'string') {
    resource = _uri.URI.file(resource);
  }

  const base = (0, _resources.basename)(resource) || (resource.scheme === _network.Schemas.file ? resource.fsPath : resource.path);
  /* can be empty string if '/' is passed in */
  // convert c: => C:

  if (hasDriveLetter(base)) {
    return normalizeDriveLetter(base);
  }

  return base;
}

function hasDriveLetter(path) {
  return !!(_platform.isWindows && path && path[1] === ':');
}

function normalizeDriveLetter(path) {
  if (hasDriveLetter(path)) {
    return path.charAt(0).toUpperCase() + path.slice(1);
  }

  return path;
}

let normalizedUserHomeCached = Object.create(null);

function tildify(path, userHome) {
  if (_platform.isWindows || !path || !userHome) {
    return path; // unsupported
  } // Keep a normalized user home path as cache to prevent accumulated string creation


  let normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : undefined;

  if (!normalizedUserHome) {
    normalizedUserHome = `${(0, _strings.rtrim)(userHome, _path.posix.sep)}${_path.posix.sep}`;
    normalizedUserHomeCached = {
      original: userHome,
      normalized: normalizedUserHome
    };
  } // Linux: case sensitive, macOS: case insensitive


  if (_platform.isLinux ? path.startsWith(normalizedUserHome) : (0, _strings.startsWithIgnoreCase)(path, normalizedUserHome)) {
    path = `~/${path.substr(normalizedUserHome.length)}`;
  }

  return path;
}

function untildify(path, userHome) {
  return path.replace(/^~($|\/|\\)/, `${userHome}$1`);
}
/**
 * Shortens the paths but keeps them easy to distinguish.
 * Replaces not important parts with ellipsis.
 * Every shorten path matches only one original path and vice versa.
 *
 * Algorithm for shortening paths is as follows:
 * 1. For every path in list, find unique substring of that path.
 * 2. Unique substring along with ellipsis is shortened path of that path.
 * 3. To find unique substring of path, consider every segment of length from 1 to path.length of path from end of string
 *    and if present segment is not substring to any other paths then present segment is unique path,
 *    else check if it is not present as suffix of any other path and present segment is suffix of path itself,
 *    if it is true take present segment as unique path.
 * 4. Apply ellipsis to unique segment according to whether segment is present at start/in-between/end of path.
 *
 * Example 1
 * 1. consider 2 paths i.e. ['a\\b\\c\\d', 'a\\f\\b\\c\\d']
 * 2. find unique path of first path,
 * 	a. 'd' is present in path2 and is suffix of path2, hence not unique of present path.
 * 	b. 'c' is present in path2 and 'c' is not suffix of present path, similarly for 'b' and 'a' also.
 * 	c. 'd\\c' is suffix of path2.
 *  d. 'b\\c' is not suffix of present path.
 *  e. 'a\\b' is not present in path2, hence unique path is 'a\\b...'.
 * 3. for path2, 'f' is not present in path1 hence unique is '...\\f\\...'.
 *
 * Example 2
 * 1. consider 2 paths i.e. ['a\\b', 'a\\b\\c'].
 * 	a. Even if 'b' is present in path2, as 'b' is suffix of path1 and is not suffix of path2, unique path will be '...\\b'.
 * 2. for path2, 'c' is not present in path1 hence unique path is '..\\c'.
 */


const ellipsis = '\u2026';
const unc = '\\\\';
const home = '~';

function shorten(paths, pathSeparator = _path.sep) {
  const shortenedPaths = new Array(paths.length); // for every path

  let match = false;

  for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
    let path = paths[pathIndex];

    if (path === '') {
      shortenedPaths[pathIndex] = `.${pathSeparator}`;
      continue;
    }

    if (!path) {
      shortenedPaths[pathIndex] = path;
      continue;
    }

    match = true; // trim for now and concatenate unc path (e.g. \\network) or root path (/etc, ~/etc) later

    let prefix = '';

    if (path.indexOf(unc) === 0) {
      prefix = path.substr(0, path.indexOf(unc) + unc.length);
      path = path.substr(path.indexOf(unc) + unc.length);
    } else if (path.indexOf(pathSeparator) === 0) {
      prefix = path.substr(0, path.indexOf(pathSeparator) + pathSeparator.length);
      path = path.substr(path.indexOf(pathSeparator) + pathSeparator.length);
    } else if (path.indexOf(home) === 0) {
      prefix = path.substr(0, path.indexOf(home) + home.length);
      path = path.substr(path.indexOf(home) + home.length);
    } // pick the first shortest subpath found


    const segments = path.split(pathSeparator);

    for (let subpathLength = 1; match && subpathLength <= segments.length; subpathLength++) {
      for (let start = segments.length - subpathLength; match && start >= 0; start--) {
        match = false;
        let subpath = segments.slice(start, start + subpathLength).join(pathSeparator); // that is unique to any other path

        for (let otherPathIndex = 0; !match && otherPathIndex < paths.length; otherPathIndex++) {
          // suffix subpath treated specially as we consider no match 'x' and 'x/...'
          if (otherPathIndex !== pathIndex && paths[otherPathIndex] && paths[otherPathIndex].indexOf(subpath) > -1) {
            const isSubpathEnding = start + subpathLength === segments.length; // Adding separator as prefix for subpath, such that 'endsWith(src, trgt)' considers subpath as directory name instead of plain string.
            // prefix is not added when either subpath is root directory or path[otherPathIndex] does not have multiple directories.

            const subpathWithSep = start > 0 && paths[otherPathIndex].indexOf(pathSeparator) > -1 ? pathSeparator + subpath : subpath;
            const isOtherPathEnding = paths[otherPathIndex].endsWith(subpathWithSep);
            match = !isSubpathEnding || isOtherPathEnding;
          }
        } // found unique subpath


        if (!match) {
          let result = ''; // preserve disk drive or root prefix

          if (segments[0].endsWith(':') || prefix !== '') {
            if (start === 1) {
              // extend subpath to include disk drive prefix
              start = 0;
              subpathLength++;
              subpath = segments[0] + pathSeparator + subpath;
            }

            if (start > 0) {
              result = segments[0] + pathSeparator;
            }

            result = prefix + result;
          } // add ellipsis at the beginning if neeeded


          if (start > 0) {
            result = result + ellipsis + pathSeparator;
          }

          result = result + subpath; // add ellipsis at the end if needed

          if (start + subpathLength < segments.length) {
            result = result + pathSeparator + ellipsis;
          }

          shortenedPaths[pathIndex] = result;
        }
      }
    }

    if (match) {
      shortenedPaths[pathIndex] = path; // use full path if no unique subpaths found
    }
  }

  return shortenedPaths;
}

var Type;

(function (Type) {
  Type[Type["TEXT"] = 0] = "TEXT";
  Type[Type["VARIABLE"] = 1] = "VARIABLE";
  Type[Type["SEPARATOR"] = 2] = "SEPARATOR";
})(Type || (Type = {}));

/**
 * Helper to insert values for specific template variables into the string. E.g. "this $(is) a $(template)" can be
 * passed to this function together with an object that maps "is" and "template" to strings to have them replaced.
 * @param value string to which templating is applied
 * @param values the values of the templates to use
 */
function template(template, values = Object.create(null)) {
  const segments = [];
  let inVariable = false;
  let curVal = '';

  var _iterator = _createForOfIteratorHelper(template),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const char = _step.value;

      // Beginning of variable
      if (char === '$' || inVariable && char === '{') {
        if (curVal) {
          segments.push({
            value: curVal,
            type: Type.TEXT
          });
        }

        curVal = '';
        inVariable = true;
      } // End of variable
      else if (char === '}' && inVariable) {
          const resolved = values[curVal]; // Variable

          if (typeof resolved === 'string') {
            if (resolved.length) {
              segments.push({
                value: resolved,
                type: Type.VARIABLE
              });
            }
          } // Separator
          else if (resolved) {
              const prevSegment = segments[segments.length - 1];

              if (!prevSegment || prevSegment.type !== Type.SEPARATOR) {
                segments.push({
                  value: resolved.label,
                  type: Type.SEPARATOR
                }); // prevent duplicate separators
              }
            }

          curVal = '';
          inVariable = false;
        } // Text or Variable Name
        else {
            curVal += char;
          }
    } // Tail

  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  if (curVal && !inVariable) {
    segments.push({
      value: curVal,
      type: Type.TEXT
    });
  }

  return segments.filter((segment, index) => {
    // Only keep separator if we have values to the left and right
    if (segment.type === Type.SEPARATOR) {
      const left = segments[index - 1];
      const right = segments[index + 1];
      return [left, right].every(segment => segment && (segment.type === Type.VARIABLE || segment.type === Type.TEXT) && segment.value.length > 0);
    } // accept any TEXT and VARIABLE


    return true;
  }).map(segment => segment.value).join('');
}
/**
 * Handles mnemonics for menu items. Depending on OS:
 * - Windows: Supported via & character (replace && with &)
 * -   Linux: Supported via & character (replace && with &)
 * -   macOS: Unsupported (replace && with empty string)
 */


function mnemonicMenuLabel(label, forceDisableMnemonics) {
  if (_platform.isMacintosh || forceDisableMnemonics) {
    return label.replace(/\(&&\w\)|&&/g, '').replace(/&/g, _platform.isMacintosh ? '&' : '&&');
  }

  return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
}
/**
 * Handles mnemonics for buttons. Depending on OS:
 * - Windows: Supported via & character (replace && with & and & with && for escaping)
 * -   Linux: Supported via _ character (replace && with _)
 * -   macOS: Unsupported (replace && with empty string)
 */


function mnemonicButtonLabel(label, forceDisableMnemonics) {
  if (_platform.isMacintosh || forceDisableMnemonics) {
    return label.replace(/\(&&\w\)|&&/g, '');
  }

  if (_platform.isWindows) {
    return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
  }

  return label.replace(/&&/g, '_');
}

function unmnemonicLabel(label) {
  return label.replace(/&/g, '&&');
}
/**
 * Splits a path in name and parent path, supporting both '/' and '\'
 */


function splitName(fullPath) {
  const p = fullPath.indexOf('/') !== -1 ? _path.posix : _path.win32;
  const name = p.basename(fullPath);
  const parentPath = p.dirname(fullPath);

  if (name.length) {
    return {
      name,
      parentPath
    };
  } // only the root segment


  return {
    name: parentPath,
    parentPath: ''
  };
}