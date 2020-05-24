"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.last-index-of");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.map");

require("core-js/modules/es.string.split");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.originalFSPath = originalFSPath;
exports.getComparisonKey = getComparisonKey;
exports.isEqual = isEqual;
exports.isEqualOrParent = isEqualOrParent;
exports.basenameOrAuthority = basenameOrAuthority;
exports.isEqualAuthority = isEqualAuthority;
exports.basename = basename;
exports.extname = extname;
exports.dirname = dirname;
exports.joinPath = joinPath;
exports.normalizePath = normalizePath;
exports.isAbsolutePath = isAbsolutePath;
exports.hasTrailingPathSeparator = hasTrailingPathSeparator;
exports.removeTrailingPathSeparator = removeTrailingPathSeparator;
exports.addTrailingPathSeparator = addTrailingPathSeparator;
exports.relativePath = relativePath;
exports.resolvePath = resolvePath;
exports.distinctParents = distinctParents;
exports.toLocalResource = toLocalResource;
exports.ResourceGlobMatcher = exports.DataUri = exports.exturi = exports.ExtUri = void 0;

var extpath = _interopRequireWildcard(require("./extpath"));

var paths = _interopRequireWildcard(require("./path"));

var _uri = require("./uri");

var _strings = require("./strings");

var _network = require("./network");

var _platform = require("./platform");

var _charCode = require("./charCode");

var _glob = require("./glob");

var _map = require("./map");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

class ExtUri {
  constructor(_ignorePathCasing) {
    this._ignorePathCasing = _ignorePathCasing;
  }

  compare(uri1, uri2, ignoreFragment = false) {
    // scheme
    let ret = (0, _strings.compare)(uri1.scheme, uri2.scheme);

    if (ret === 0) {
      // authority
      ret = (0, _strings.compareIgnoreCase)(uri1.authority, uri2.authority);

      if (ret === 0) {
        // path
        ret = this._ignorePathCasing(uri1) ? (0, _strings.compareIgnoreCase)(uri1.path, uri2.path) : (0, _strings.compare)(uri1.path, uri2.path); // query

        if (ret === 0) {
          ret = (0, _strings.compare)(uri1.query, uri2.query); // fragment

          if (ret === 0 && !ignoreFragment) {
            ret = (0, _strings.compare)(uri1.fragment, uri2.fragment);
          }
        }
      }
    }

    return ret;
  }

  getComparisonKey(uri, ignoreFragment = false) {
    return getComparisonKey(uri, this._ignorePathCasing(uri), ignoreFragment);
  }

  isEqual(uri1, uri2, ignoreFragment = false) {
    return isEqual(uri1, uri2, this._ignorePathCasing(uri1), ignoreFragment);
  }

}
/**
 * Unbiased utility that takes uris "as they are". This means it can be interchanged with
 * uri#toString() usages. The following is true
 * ```
 * assertEqual(aUri.toString() === bUri.toString(), exturi.isEqual(aUri, bUri))
 * ```
 */


exports.ExtUri = ExtUri;
const exturi = new ExtUri(() => false); //#endregion

exports.exturi = exturi;

function originalFSPath(uri) {
  return (0, _uri.uriToFsPath)(uri, true);
} // DO NOT EXPORT, DO NOT USE


function _ignorePathCasingGuess(resource) {
  // A file scheme resource is in the same platform as code, so ignore case for non linux platforms
  // Resource can be from another platform. Lowering the case as an hack. Should come from File system provider
  return resource && resource.scheme === _network.Schemas.file ? !_platform.isLinux : true;
}
/**
 * Creates a key from a resource URI to be used to resource comparison and for resource maps.
 *
 * @param resource Uri
 * @param ignorePathCasing Ignore casing when comparing path component (defaults mostly to `true`)
 * @param ignoreFragment Ignore the fragment (defaults to `false`)
 */


function getComparisonKey(resource, ignorePathCasing = _ignorePathCasingGuess(resource), ignoreFragment = false) {
  return resource.with({
    path: ignorePathCasing ? resource.path.toLowerCase() : undefined,
    fragment: ignoreFragment ? null : undefined
  }).toString();
}
/**
 * Tests whether two uris are equal
 *
 * @param first Uri
 * @param second Uri
 * @param ignorePathCasing Ignore casing when comparing path component (defaults mostly to `true`)
 * @param ignoreFragment Ignore the fragment (defaults to `false`)
 */


function isEqual(first, second, ignorePathCasing = _ignorePathCasingGuess(first), ignoreFragment = false) {
  if (first === second) {
    return true;
  }

  if (!first || !second) {
    return false;
  }

  if (first.scheme !== second.scheme || !isEqualAuthority(first.authority, second.authority)) {
    return false;
  }

  const p1 = first.path,
        p2 = second.path;
  return (p1 === p2 || ignorePathCasing && (0, _strings.equalsIgnoreCase)(p1, p2)) && first.query === second.query && (ignoreFragment || first.fragment === second.fragment);
}
/**
 * Tests whether a `candidate` URI is a parent or equal of a given `base` URI.
 *
 * @param base A uri which is "longer"
 * @param parentCandidate A uri which is "shorter" then `base`
 * @param ignorePathCasing Ignore casing when comparing path component (defaults mostly to `true`)
 * @param ignoreFragment Ignore the fragment (defaults to `false`)
 */


function isEqualOrParent(base, parentCandidate, ignorePathCasing = _ignorePathCasingGuess(base), ignoreFragment = false) {
  if (base.scheme === parentCandidate.scheme) {
    if (base.scheme === _network.Schemas.file) {
      return extpath.isEqualOrParent(originalFSPath(base), originalFSPath(parentCandidate), ignorePathCasing) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
    }

    if (isEqualAuthority(base.authority, parentCandidate.authority)) {
      return extpath.isEqualOrParent(base.path, parentCandidate.path, ignorePathCasing, '/') && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
    }
  }

  return false;
}

function basenameOrAuthority(resource) {
  return basename(resource) || resource.authority;
}
/**
 * Tests whether the two authorities are the same
 */


function isEqualAuthority(a1, a2) {
  return a1 === a2 || (0, _strings.equalsIgnoreCase)(a1, a2);
}

function basename(resource) {
  return paths.posix.basename(resource.path);
}

function extname(resource) {
  return paths.posix.extname(resource.path);
}
/**
 * Return a URI representing the directory of a URI path.
 *
 * @param resource The input URI.
 * @returns The URI representing the directory of the input URI.
 */


function dirname(resource) {
  if (resource.path.length === 0) {
    return resource;
  }

  let dirname;

  if (resource.scheme === _network.Schemas.file) {
    dirname = _uri.URI.file(paths.dirname(originalFSPath(resource))).path;
  } else {
    dirname = paths.posix.dirname(resource.path);

    if (resource.authority && dirname.length && dirname.charCodeAt(0) !== _charCode.CharCode.Slash) {
      console.error(`dirname("${resource.toString})) resulted in a relative path`);
      dirname = '/'; // If a URI contains an authority component, then the path component must either be empty or begin with a CharCode.Slash ("/") character
    }
  }

  return resource.with({
    path: dirname
  });
}
/**
 * Join a URI path with path fragments and normalizes the resulting path.
 *
 * @param resource The input URI.
 * @param pathFragment The path fragment to add to the URI path.
 * @returns The resulting URI.
 */


function joinPath(resource, ...pathFragment) {
  let joinedPath;

  if (resource.scheme === 'file') {
    joinedPath = _uri.URI.file(paths.join(originalFSPath(resource), ...pathFragment)).path;
  } else {
    joinedPath = paths.posix.join(resource.path || '/', ...pathFragment);
  }

  return resource.with({
    path: joinedPath
  });
}
/**
 * Normalizes the path part of a URI: Resolves `.` and `..` elements with directory names.
 *
 * @param resource The URI to normalize the path.
 * @returns The URI with the normalized path.
 */


function normalizePath(resource) {
  if (!resource.path.length) {
    return resource;
  }

  let normalizedPath;

  if (resource.scheme === _network.Schemas.file) {
    normalizedPath = _uri.URI.file(paths.normalize(originalFSPath(resource))).path;
  } else {
    normalizedPath = paths.posix.normalize(resource.path);
  }

  return resource.with({
    path: normalizedPath
  });
}
/**
 * Returns true if the URI path is absolute.
 */


function isAbsolutePath(resource) {
  return !!resource.path && resource.path[0] === '/';
}
/**
 * Returns true if the URI path has a trailing path separator
 */


function hasTrailingPathSeparator(resource, sep = paths.sep) {
  if (resource.scheme === _network.Schemas.file) {
    const fsp = originalFSPath(resource);
    return fsp.length > extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
  } else {
    const p = resource.path;
    return p.length > 1 && p.charCodeAt(p.length - 1) === _charCode.CharCode.Slash && !/^[a-zA-Z]:(\/$|\\$)/.test(resource.fsPath); // ignore the slash at offset 0
  }
}
/**
 * Removes a trailing path separator, if there's one.
 * Important: Doesn't remove the first slash, it would make the URI invalid
 */


function removeTrailingPathSeparator(resource, sep = paths.sep) {
  // Make sure that the path isn't a drive letter. A trailing separator there is not removable.
  if (hasTrailingPathSeparator(resource, sep)) {
    return resource.with({
      path: resource.path.substr(0, resource.path.length - 1)
    });
  }

  return resource;
}
/**
 * Adds a trailing path separator to the URI if there isn't one already.
 * For example, c:\ would be unchanged, but c:\users would become c:\users\
 */


function addTrailingPathSeparator(resource, sep = paths.sep) {
  let isRootSep = false;

  if (resource.scheme === _network.Schemas.file) {
    const fsp = originalFSPath(resource);
    isRootSep = fsp !== undefined && fsp.length === extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
  } else {
    sep = '/';
    const p = resource.path;
    isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === _charCode.CharCode.Slash;
  }

  if (!isRootSep && !hasTrailingPathSeparator(resource, sep)) {
    return resource.with({
      path: resource.path + '/'
    });
  }

  return resource;
}
/**
 * Returns a relative path between two URIs. If the URIs don't have the same schema or authority, `undefined` is returned.
 * The returned relative path always uses forward slashes.
 */


function relativePath(from, to, ignorePathCasing = _ignorePathCasingGuess(from)) {
  if (from.scheme !== to.scheme || !isEqualAuthority(from.authority, to.authority)) {
    return undefined;
  }

  if (from.scheme === _network.Schemas.file) {
    const relativePath = paths.relative(originalFSPath(from), originalFSPath(to));
    return _platform.isWindows ? extpath.toSlashes(relativePath) : relativePath;
  }

  let fromPath = from.path || '/',
      toPath = to.path || '/';

  if (ignorePathCasing) {
    // make casing of fromPath match toPath
    let i = 0;

    for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
      if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
        if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
          break;
        }
      }
    }

    fromPath = toPath.substr(0, i) + fromPath.substr(i);
  }

  return paths.posix.relative(fromPath, toPath);
}
/**
 * Resolves an absolute or relative path against a base URI.
 * The path can be relative or absolute posix or a Windows path
 */


function resolvePath(base, path) {
  if (base.scheme === _network.Schemas.file) {
    const newURI = _uri.URI.file(paths.resolve(originalFSPath(base), path));

    return base.with({
      authority: newURI.authority,
      path: newURI.path
    });
  }

  if (path.indexOf('/') === -1) {
    // no slashes? it's likely a Windows path
    path = extpath.toSlashes(path);

    if (/^[a-zA-Z]:(\/|$)/.test(path)) {
      // starts with a drive letter
      path = '/' + path;
    }
  }

  return base.with({
    path: paths.posix.resolve(base.path, path)
  });
}

function distinctParents(items, resourceAccessor) {
  const distinctParents = [];

  for (let i = 0; i < items.length; i++) {
    const candidateResource = resourceAccessor(items[i]);

    if (items.some((otherItem, index) => {
      if (index === i) {
        return false;
      }

      return isEqualOrParent(candidateResource, resourceAccessor(otherItem));
    })) {
      continue;
    }

    distinctParents.push(items[i]);
  }

  return distinctParents;
}
/**
 * Data URI related helpers.
 */


let DataUri;
exports.DataUri = DataUri;

(function (_DataUri) {
  const META_DATA_LABEL = _DataUri.META_DATA_LABEL = 'label';
  const META_DATA_DESCRIPTION = _DataUri.META_DATA_DESCRIPTION = 'description';
  const META_DATA_SIZE = _DataUri.META_DATA_SIZE = 'size';
  const META_DATA_MIME = _DataUri.META_DATA_MIME = 'mime';

  function parseMetaData(dataUri) {
    const metadata = new Map(); // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
    // the metadata is: size:2313;label:SomeLabel;description:SomeDescription

    const meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
    meta.split(';').forEach(property => {
      const _property$split = property.split(':'),
            _property$split2 = _slicedToArray(_property$split, 2),
            key = _property$split2[0],
            value = _property$split2[1];

      if (key && value) {
        metadata.set(key, value);
      }
    }); // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
    // the mime is: image/png

    const mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));

    if (mime) {
      metadata.set(META_DATA_MIME, mime);
    }

    return metadata;
  }

  _DataUri.parseMetaData = parseMetaData;
})(DataUri || (exports.DataUri = DataUri = {}));

class ResourceGlobMatcher {
  expressionsByRoot = _map.TernarySearchTree.forUris();

  constructor(globalExpression, rootExpressions) {
    this.globalExpression = (0, _glob.parse)(globalExpression);

    var _iterator = _createForOfIteratorHelper(rootExpressions),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const expression = _step.value;
        this.expressionsByRoot.set(expression.root, {
          root: expression.root,
          expression: (0, _glob.parse)(expression.expression)
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  matches(resource) {
    const rootExpression = this.expressionsByRoot.findSubstr(resource);

    if (rootExpression) {
      const path = relativePath(rootExpression.root, resource);

      if (path && !!rootExpression.expression(path)) {
        return true;
      }
    }

    return !!this.globalExpression(resource.path);
  }

}

exports.ResourceGlobMatcher = ResourceGlobMatcher;

function toLocalResource(resource, authority) {
  if (authority) {
    let path = resource.path;

    if (path && path[0] !== paths.posix.sep) {
      path = paths.posix.sep + path;
    }

    return resource.with({
      scheme: _network.Schemas.vscodeRemote,
      authority,
      path
    });
  }

  return resource.with({
    scheme: _network.Schemas.file
  });
}