"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.string.ends-with");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.starts-with");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compareFileNames = compareFileNames;
exports.compareFileNamesNumeric = compareFileNamesNumeric;
exports.noIntlCompareFileNames = noIntlCompareFileNames;
exports.compareFileExtensions = compareFileExtensions;
exports.compareFileExtensionsNumeric = compareFileExtensionsNumeric;
exports.comparePaths = comparePaths;
exports.compareAnything = compareAnything;
exports.compareByPrefix = compareByPrefix;

var _path = require("./path");

var _async = require("./async");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// When comparing large numbers of strings, such as in sorting large arrays, is better for
// performance to create an Intl.Collator object and use the function provided by its compare
// property than it is to use String.prototype.localeCompare()
// A collator with numeric sorting enabled, and no sensitivity to case or to accents
const intlFileNameCollatorBaseNumeric = new _async.IdleValue(() => {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base'
  });
  return {
    collator: collator,
    collatorIsNumeric: collator.resolvedOptions().numeric
  };
}); // A collator with numeric sorting enabled.

const intlFileNameCollatorNumeric = new _async.IdleValue(() => {
  const collator = new Intl.Collator(undefined, {
    numeric: true
  });
  return {
    collator: collator
  };
}); // A collator with numeric sorting enabled, and sensitivity to accents and diacritics but not case.

const intlFileNameCollatorNumericCaseInsenstive = new _async.IdleValue(() => {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'accent'
  });
  return {
    collator: collator
  };
});

function compareFileNames(one, other, caseSensitive = false) {
  const a = one || '';
  const b = other || '';
  const result = intlFileNameCollatorBaseNumeric.value.collator.compare(a, b); // Using the numeric option in the collator will
  // make compare(`foo1`, `foo01`) === 0. We must disambiguate.

  if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && a !== b) {
    return a < b ? -1 : 1;
  }

  return result;
}
/** Compares filenames by name then extension, sorting numbers numerically instead of alphabetically. */


function compareFileNamesNumeric(one, other) {
  const _extractNameAndExtens = extractNameAndExtension(one, true),
        _extractNameAndExtens2 = _slicedToArray(_extractNameAndExtens, 2),
        oneName = _extractNameAndExtens2[0],
        oneExtension = _extractNameAndExtens2[1];

  const _extractNameAndExtens3 = extractNameAndExtension(other, true),
        _extractNameAndExtens4 = _slicedToArray(_extractNameAndExtens3, 2),
        otherName = _extractNameAndExtens4[0],
        otherExtension = _extractNameAndExtens4[1];

  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsenstive.value.collator;
  let result; // Check for name differences, comparing numbers numerically instead of alphabetically.

  result = compareAndDisambiguateByLength(collatorNumeric, oneName, otherName);

  if (result !== 0) {
    return result;
  } // Check for case insensitive extension differences, comparing numbers numerically instead of alphabetically.


  result = compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension);

  if (result !== 0) {
    return result;
  } // Disambiguate the extension case if needed.


  if (oneExtension !== otherExtension) {
    return collatorNumeric.compare(oneExtension, otherExtension);
  }

  return 0;
}

const FileNameMatch = /^(.*?)(\.([^.]*))?$/;

function noIntlCompareFileNames(one, other, caseSensitive = false) {
  if (!caseSensitive) {
    one = one && one.toLowerCase();
    other = other && other.toLowerCase();
  }

  const _extractNameAndExtens5 = extractNameAndExtension(one),
        _extractNameAndExtens6 = _slicedToArray(_extractNameAndExtens5, 2),
        oneName = _extractNameAndExtens6[0],
        oneExtension = _extractNameAndExtens6[1];

  const _extractNameAndExtens7 = extractNameAndExtension(other),
        _extractNameAndExtens8 = _slicedToArray(_extractNameAndExtens7, 2),
        otherName = _extractNameAndExtens8[0],
        otherExtension = _extractNameAndExtens8[1];

  if (oneName !== otherName) {
    return oneName < otherName ? -1 : 1;
  }

  if (oneExtension === otherExtension) {
    return 0;
  }

  return oneExtension < otherExtension ? -1 : 1;
}

function compareFileExtensions(one, other) {
  const _extractNameAndExtens9 = extractNameAndExtension(one),
        _extractNameAndExtens10 = _slicedToArray(_extractNameAndExtens9, 2),
        oneName = _extractNameAndExtens10[0],
        oneExtension = _extractNameAndExtens10[1];

  const _extractNameAndExtens11 = extractNameAndExtension(other),
        _extractNameAndExtens12 = _slicedToArray(_extractNameAndExtens11, 2),
        otherName = _extractNameAndExtens12[0],
        otherExtension = _extractNameAndExtens12[1];

  let result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneExtension, otherExtension);

  if (result === 0) {
    // Using the numeric option in the collator will
    // make compare(`foo1`, `foo01`) === 0. We must disambiguate.
    if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && oneExtension !== otherExtension) {
      return oneExtension < otherExtension ? -1 : 1;
    } // Extensions are equal, compare filenames


    result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneName, otherName);

    if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && oneName !== otherName) {
      return oneName < otherName ? -1 : 1;
    }
  }

  return result;
}
/** Compares filenames by extenson, then by name. Sorts numbers numerically, not alphabetically. */


function compareFileExtensionsNumeric(one, other) {
  const _extractNameAndExtens13 = extractNameAndExtension(one, true),
        _extractNameAndExtens14 = _slicedToArray(_extractNameAndExtens13, 2),
        oneName = _extractNameAndExtens14[0],
        oneExtension = _extractNameAndExtens14[1];

  const _extractNameAndExtens15 = extractNameAndExtension(other, true),
        _extractNameAndExtens16 = _slicedToArray(_extractNameAndExtens15, 2),
        otherName = _extractNameAndExtens16[0],
        otherExtension = _extractNameAndExtens16[1];

  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsenstive.value.collator;
  let result; // Check for extension differences, ignoring differences in case and comparing numbers numerically.

  result = compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension);

  if (result !== 0) {
    return result;
  } // Compare names.


  result = compareAndDisambiguateByLength(collatorNumeric, oneName, otherName);

  if (result !== 0) {
    return result;
  } // Disambiguate extension case if needed.


  if (oneExtension !== otherExtension) {
    return collatorNumeric.compare(oneExtension, otherExtension);
  }

  return 0;
}
/** Extracts the name and extension from a full filename, with optional special handling for dotfiles */


function extractNameAndExtension(str, dotfilesAsNames = false) {
  const match = str ? FileNameMatch.exec(str) : [];
  let result = [match && match[1] || '', match && match[3] || '']; // if the dotfilesAsNames option is selected, treat an empty filename with an extension,
  // or a filename that starts with a dot, as a dotfile name

  if (dotfilesAsNames && (!result[0] && result[1] || result[0] && result[0].charAt(0) === '.')) {
    result = [result[0] + '.' + result[1], ''];
  }

  return result;
}

function compareAndDisambiguateByLength(collator, one, other) {
  // Check for differences
  let result = collator.compare(one, other);

  if (result !== 0) {
    return result;
  } // In a numeric comparison, `foo1` and `foo01` will compare as equivalent.
  // Disambiguate by sorting the shorter string first.


  if (one.length !== other.length) {
    return one.length < other.length ? -1 : 1;
  }

  return 0;
}

function comparePathComponents(one, other, caseSensitive = false) {
  if (!caseSensitive) {
    one = one && one.toLowerCase();
    other = other && other.toLowerCase();
  }

  if (one === other) {
    return 0;
  }

  return one < other ? -1 : 1;
}

function comparePaths(one, other, caseSensitive = false) {
  const oneParts = one.split(_path.sep);
  const otherParts = other.split(_path.sep);
  const lastOne = oneParts.length - 1;
  const lastOther = otherParts.length - 1;
  let endOne, endOther;

  for (let i = 0;; i++) {
    endOne = lastOne === i;
    endOther = lastOther === i;

    if (endOne && endOther) {
      return compareFileNames(oneParts[i], otherParts[i], caseSensitive);
    } else if (endOne) {
      return -1;
    } else if (endOther) {
      return 1;
    }

    const result = comparePathComponents(oneParts[i], otherParts[i], caseSensitive);

    if (result !== 0) {
      return result;
    }
  }
}

function compareAnything(one, other, lookFor) {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase(); // Sort prefix matches over non prefix matches

  const prefixCompare = compareByPrefix(one, other, lookFor);

  if (prefixCompare) {
    return prefixCompare;
  } // Sort suffix matches over non suffix matches


  const elementASuffixMatch = elementAName.endsWith(lookFor);
  const elementBSuffixMatch = elementBName.endsWith(lookFor);

  if (elementASuffixMatch !== elementBSuffixMatch) {
    return elementASuffixMatch ? -1 : 1;
  } // Understand file names


  const r = compareFileNames(elementAName, elementBName);

  if (r !== 0) {
    return r;
  } // Compare by name


  return elementAName.localeCompare(elementBName);
}

function compareByPrefix(one, other, lookFor) {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase(); // Sort prefix matches over non prefix matches

  const elementAPrefixMatch = elementAName.startsWith(lookFor);
  const elementBPrefixMatch = elementBName.startsWith(lookFor);

  if (elementAPrefixMatch !== elementBPrefixMatch) {
    return elementAPrefixMatch ? -1 : 1;
  } // Same prefix: Sort shorter matches to the top to have those on top that match more precisely
  else if (elementAPrefixMatch && elementBPrefixMatch) {
      if (elementAName.length < elementBName.length) {
        return -1;
      }

      if (elementAName.length > elementBName.length) {
        return 1;
      }
    }

  return 0;
}