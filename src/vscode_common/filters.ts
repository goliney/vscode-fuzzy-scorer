/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See vscode.licence.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { CharCode } from './charCode';
import * as strings from './strings';

export interface IFilter {
  // Returns null if word doesn't match.
  (word: string, wordToMatchAgainst: string): IMatch[] | null;
}

export interface IMatch {
  start: number;
  end: number;
}

// Combined filters

/**
 * @returns A filter which combines the provided set
 * of filters with an or. The *first* filters that
 * matches defined the return value of the returned
 * filter.
 */
export function or(...filter: IFilter[]): IFilter {
  return function (word: string, wordToMatchAgainst: string): IMatch[] | null {
    for (let i = 0, len = filter.length; i < len; i++) {
      const match = filter[i](word, wordToMatchAgainst);
      if (match) {
        return match;
      }
    }
    return null;
  };
}

// Prefix

export const matchesStrictPrefix: IFilter = _matchesPrefix.bind(undefined, false);
export const matchesPrefix: IFilter = _matchesPrefix.bind(undefined, true);

function _matchesPrefix(
  ignoreCase: boolean,
  word: string,
  wordToMatchAgainst: string
): IMatch[] | null {
  if (!wordToMatchAgainst || wordToMatchAgainst.length < word.length) {
    return null;
  }

  let matches: boolean;
  if (ignoreCase) {
    matches = strings.startsWithIgnoreCase(wordToMatchAgainst, word);
  } else {
    matches = wordToMatchAgainst.indexOf(word) === 0;
  }

  if (!matches) {
    return null;
  }

  return word.length > 0 ? [{ start: 0, end: word.length }] : [];
}

// CamelCase

function isLower(code: number): boolean {
  return CharCode.a <= code && code <= CharCode.z;
}

export function isUpper(code: number): boolean {
  return CharCode.A <= code && code <= CharCode.Z;
}

function isNumber(code: number): boolean {
  return CharCode.Digit0 <= code && code <= CharCode.Digit9;
}

function isWhitespace(code: number): boolean {
  return (
    code === CharCode.Space ||
    code === CharCode.Tab ||
    code === CharCode.LineFeed ||
    code === CharCode.CarriageReturn
  );
}

const wordSeparators = new Set<number>();
'`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?'.split('').forEach(s => wordSeparators.add(s.charCodeAt(0)));

function isAlphanumeric(code: number): boolean {
  return isLower(code) || isUpper(code) || isNumber(code);
}

function join(head: IMatch, tail: IMatch[]): IMatch[] {
  if (tail.length === 0) {
    tail = [head];
  } else if (head.end === tail[0].start) {
    tail[0].start = head.start;
  } else {
    tail.unshift(head);
  }
  return tail;
}

function nextAnchor(camelCaseWord: string, start: number): number {
  for (let i = start; i < camelCaseWord.length; i++) {
    const c = camelCaseWord.charCodeAt(i);
    if (isUpper(c) || isNumber(c) || (i > 0 && !isAlphanumeric(camelCaseWord.charCodeAt(i - 1)))) {
      return i;
    }
  }
  return camelCaseWord.length;
}

function _matchesCamelCase(
  word: string,
  camelCaseWord: string,
  i: number,
  j: number
): IMatch[] | null {
  if (i === word.length) {
    return [];
  } else if (j === camelCaseWord.length) {
    return null;
  } else if (word[i] !== camelCaseWord[j].toLowerCase()) {
    return null;
  } else {
    let result: IMatch[] | null = null;
    let nextUpperIndex = j + 1;
    result = _matchesCamelCase(word, camelCaseWord, i + 1, j + 1);
    while (
      !result &&
      (nextUpperIndex = nextAnchor(camelCaseWord, nextUpperIndex)) < camelCaseWord.length
    ) {
      result = _matchesCamelCase(word, camelCaseWord, i + 1, nextUpperIndex);
      nextUpperIndex++;
    }
    return result === null ? null : join({ start: j, end: j + 1 }, result);
  }
}

interface ICamelCaseAnalysis {
  upperPercent: number;
  lowerPercent: number;
  alphaPercent: number;
  numericPercent: number;
}

// Heuristic to avoid computing camel case matcher for words that don't
// look like camelCaseWords.
function analyzeCamelCaseWord(word: string): ICamelCaseAnalysis {
  let upper = 0,
    lower = 0,
    alpha = 0,
    numeric = 0,
    code = 0;

  for (let i = 0; i < word.length; i++) {
    code = word.charCodeAt(i);

    if (isUpper(code)) {
      upper++;
    }
    if (isLower(code)) {
      lower++;
    }
    if (isAlphanumeric(code)) {
      alpha++;
    }
    if (isNumber(code)) {
      numeric++;
    }
  }

  const upperPercent = upper / word.length;
  const lowerPercent = lower / word.length;
  const alphaPercent = alpha / word.length;
  const numericPercent = numeric / word.length;

  return { upperPercent, lowerPercent, alphaPercent, numericPercent };
}

function isUpperCaseWord(analysis: ICamelCaseAnalysis): boolean {
  const { upperPercent, lowerPercent } = analysis;
  return lowerPercent === 0 && upperPercent > 0.6;
}

function isCamelCaseWord(analysis: ICamelCaseAnalysis): boolean {
  const { upperPercent, lowerPercent, alphaPercent, numericPercent } = analysis;
  return lowerPercent > 0.2 && upperPercent < 0.8 && alphaPercent > 0.6 && numericPercent < 0.2;
}

// Heuristic to avoid computing camel case matcher for words that don't
// look like camel case patterns.
function isCamelCasePattern(word: string): boolean {
  let upper = 0,
    lower = 0,
    code = 0,
    whitespace = 0;

  for (let i = 0; i < word.length; i++) {
    code = word.charCodeAt(i);

    if (isUpper(code)) {
      upper++;
    }
    if (isLower(code)) {
      lower++;
    }
    if (isWhitespace(code)) {
      whitespace++;
    }
  }

  if ((upper === 0 || lower === 0) && whitespace === 0) {
    return word.length <= 30;
  } else {
    return upper <= 5;
  }
}

export function matchesCamelCase(word: string, camelCaseWord: string): IMatch[] | null {
  if (!camelCaseWord) {
    return null;
  }

  camelCaseWord = camelCaseWord.trim();

  if (camelCaseWord.length === 0) {
    return null;
  }

  if (!isCamelCasePattern(word)) {
    return null;
  }

  if (camelCaseWord.length > 60) {
    return null;
  }

  const analysis = analyzeCamelCaseWord(camelCaseWord);

  if (!isCamelCaseWord(analysis)) {
    if (!isUpperCaseWord(analysis)) {
      return null;
    }

    camelCaseWord = camelCaseWord.toLowerCase();
  }

  let result: IMatch[] | null = null;
  let i = 0;

  word = word.toLowerCase();
  while (
    i < camelCaseWord.length &&
    (result = _matchesCamelCase(word, camelCaseWord, 0, i)) === null
  ) {
    i = nextAnchor(camelCaseWord, i + 1);
  }

  return result;
}

// Fuzzy

//#region --- fuzzyScore ---

export function createMatches(score: undefined | FuzzyScore): IMatch[] {
  if (typeof score === 'undefined') {
    return [];
  }

  const matches = score[1].toString(2);
  const wordStart = score[2];
  const res: IMatch[] = [];

  for (let pos = wordStart; pos < _maxLen; pos++) {
    if (matches[matches.length - (pos + 1)] === '1') {
      const last = res[res.length - 1];
      if (last && last.end === pos) {
        last.end = pos + 1;
      } else {
        res.push({ start: pos, end: pos + 1 });
      }
    }
  }
  return res;
}

const _maxLen = 128;

function initTable() {
  const table: number[][] = [];
  const row: number[] = [0];
  for (let i = 1; i <= _maxLen; i++) {
    row.push(-i);
  }
  for (let i = 0; i <= _maxLen; i++) {
    const thisRow = row.slice(0);
    thisRow[0] = -i;
    table.push(thisRow);
  }
  return table;
}

const _table = initTable();
const _scores = initTable();
const _arrows = <Arrow[][]>initTable();
const _debug = false;

function printTable(
  table: number[][],
  pattern: string,
  patternLen: number,
  word: string,
  wordLen: number
): string {
  function pad(s: string, n: number, pad = ' ') {
    while (s.length < n) {
      s = pad + s;
    }
    return s;
  }
  let ret = ` |   |${word
    .split('')
    .map(c => pad(c, 3))
    .join('|')}\n`;

  for (let i = 0; i <= patternLen; i++) {
    if (i === 0) {
      ret += ' |';
    } else {
      ret += `${pattern[i - 1]}|`;
    }
    ret +=
      table[i]
        .slice(0, wordLen + 1)
        .map(n => pad(n.toString(), 3))
        .join('|') + '\n';
  }
  return ret;
}

function printTables(pattern: string, patternStart: number, word: string, wordStart: number): void {
  pattern = pattern.substr(patternStart);
  word = word.substr(wordStart);
  console.log(printTable(_table, pattern, pattern.length, word, word.length));
  console.log(printTable(_arrows, pattern, pattern.length, word, word.length));
  console.log(printTable(_scores, pattern, pattern.length, word, word.length));
}

function isSeparatorAtPos(value: string, index: number): boolean {
  if (index < 0 || index >= value.length) {
    return false;
  }
  const code = value.charCodeAt(index);
  switch (code) {
    case CharCode.Underline:
    case CharCode.Dash:
    case CharCode.Period:
    case CharCode.Space:
    case CharCode.Slash:
    case CharCode.Backslash:
    case CharCode.SingleQuote:
    case CharCode.DoubleQuote:
    case CharCode.Colon:
    case CharCode.DollarSign:
      return true;
    default:
      return false;
  }
}

function isWhitespaceAtPos(value: string, index: number): boolean {
  if (index < 0 || index >= value.length) {
    return false;
  }
  const code = value.charCodeAt(index);
  switch (code) {
    case CharCode.Space:
    case CharCode.Tab:
      return true;
    default:
      return false;
  }
}

function isUpperCaseAtPos(pos: number, word: string, wordLow: string): boolean {
  return word[pos] !== wordLow[pos];
}

export function isPatternInWord(
  patternLow: string,
  patternPos: number,
  patternLen: number,
  wordLow: string,
  wordPos: number,
  wordLen: number
): boolean {
  while (patternPos < patternLen && wordPos < wordLen) {
    if (patternLow[patternPos] === wordLow[wordPos]) {
      patternPos += 1;
    }
    wordPos += 1;
  }
  return patternPos === patternLen; // pattern must be exhausted
}

enum Arrow {
  Top = 0b1,
  Diag = 0b10,
  Left = 0b100,
}

/**
 * A tuple of three values.
 * 0. the score
 * 1. the matches encoded as bitmask (2^53)
 * 2. the offset at which matching started
 */
export type FuzzyScore = [number, number, number];

export namespace FuzzyScore {
  /**
   * No matches and value `-100`
   */
  export const Default: [-100, 0, 0] = <[-100, 0, 0]>Object.freeze([-100, 0, 0]);

  export function isDefault(score?: FuzzyScore): score is [-100, 0, 0] {
    return !score || (score[0] === -100 && score[1] === 0 && score[2] === 0);
  }
}

export function fuzzyScore(
  pattern: string,
  patternLow: string,
  patternStart: number,
  word: string,
  wordLow: string,
  wordStart: number,
  firstMatchCanBeWeak: boolean
): FuzzyScore | undefined {
  const patternLen = pattern.length > _maxLen ? _maxLen : pattern.length;
  const wordLen = word.length > _maxLen ? _maxLen : word.length;

  if (
    patternStart >= patternLen ||
    wordStart >= wordLen ||
    patternLen - patternStart > wordLen - wordStart
  ) {
    return undefined;
  }

  // Run a simple check if the characters of pattern occur
  // (in order) at all in word. If that isn't the case we
  // stop because no match will be possible
  if (!isPatternInWord(patternLow, patternStart, patternLen, wordLow, wordStart, wordLen)) {
    return undefined;
  }

  let row: number = 1;
  let column: number = 1;
  let patternPos = patternStart;
  let wordPos = wordStart;

  let hasStrongFirstMatch = false;

  // There will be a match, fill in tables
  for (row = 1, patternPos = patternStart; patternPos < patternLen; row++, patternPos++) {
    for (column = 1, wordPos = wordStart; wordPos < wordLen; column++, wordPos++) {
      const score = _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos);

      if (patternPos === patternStart && score > 1) {
        hasStrongFirstMatch = true;
      }

      _scores[row][column] = score;

      const diag = _table[row - 1][column - 1] + (score > 1 ? 1 : score);
      const top = _table[row - 1][column] + -1;
      const left = _table[row][column - 1] + -1;

      if (left >= top) {
        // left or diag
        if (left > diag) {
          _table[row][column] = left;
          _arrows[row][column] = Arrow.Left;
        } else if (left === diag) {
          _table[row][column] = left;
          _arrows[row][column] = Arrow.Left | Arrow.Diag;
        } else {
          _table[row][column] = diag;
          _arrows[row][column] = Arrow.Diag;
        }
      } else {
        // top or diag
        if (top > diag) {
          _table[row][column] = top;
          _arrows[row][column] = Arrow.Top;
        } else if (top === diag) {
          _table[row][column] = top;
          _arrows[row][column] = Arrow.Top | Arrow.Diag;
        } else {
          _table[row][column] = diag;
          _arrows[row][column] = Arrow.Diag;
        }
      }
    }
  }

  if (_debug) {
    printTables(pattern, patternStart, word, wordStart);
  }

  if (!hasStrongFirstMatch && !firstMatchCanBeWeak) {
    return undefined;
  }

  _matchesCount = 0;
  _topScore = -100;
  _wordStart = wordStart;
  _firstMatchCanBeWeak = firstMatchCanBeWeak;

  _findAllMatches2(row - 1, column - 1, patternLen === wordLen ? 1 : 0, 0, false);
  if (_matchesCount === 0) {
    return undefined;
  }

  return [_topScore, _topMatch2, wordStart];
}

function _doScore(
  pattern: string,
  patternLow: string,
  patternPos: number,
  patternStart: number,
  word: string,
  wordLow: string,
  wordPos: number
) {
  if (patternLow[patternPos] !== wordLow[wordPos]) {
    return -1;
  }
  if (wordPos === patternPos - patternStart) {
    // common prefix: `foobar <-> foobaz`
    //                            ^^^^^
    if (pattern[patternPos] === word[wordPos]) {
      return 7;
    } else {
      return 5;
    }
  } else if (
    isUpperCaseAtPos(wordPos, word, wordLow) &&
    (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))
  ) {
    // hitting upper-case: `foo <-> forOthers`
    //                              ^^ ^
    if (pattern[patternPos] === word[wordPos]) {
      return 7;
    } else {
      return 5;
    }
  } else if (
    isSeparatorAtPos(wordLow, wordPos) &&
    (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))
  ) {
    // hitting a separator: `. <-> foo.bar`
    //                                ^
    return 5;
  } else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
    // post separator: `foo <-> bar_foo`
    //                              ^^^
    return 5;
  } else {
    return 1;
  }
}

let _matchesCount: number = 0;
let _topMatch2: number = 0;
let _topScore: number = 0;
let _wordStart: number = 0;
let _firstMatchCanBeWeak: boolean = false;

function _findAllMatches2(
  row: number,
  column: number,
  total: number,
  matches: number,
  lastMatched: boolean
): void {
  if (_matchesCount >= 10 || total < -25) {
    // stop when having already 10 results, or
    // when a potential alignment as already 5 gaps
    return;
  }

  let simpleMatchCount = 0;

  while (row > 0 && column > 0) {
    const score = _scores[row][column];
    const arrow = _arrows[row][column];

    if (arrow === Arrow.Left) {
      // left -> no match, skip a word character
      column -= 1;
      if (lastMatched) {
        total -= 5; // new gap penalty
      } else if (matches !== 0) {
        total -= 1; // gap penalty after first match
      }
      lastMatched = false;
      simpleMatchCount = 0;
    } else if (arrow & Arrow.Diag) {
      if (arrow & Arrow.Left) {
        // left
        _findAllMatches2(
          row,
          column - 1,
          matches !== 0 ? total - 1 : total, // gap penalty after first match
          matches,
          lastMatched
        );
      }

      // diag
      total += score;
      row -= 1;
      column -= 1;
      lastMatched = true;

      // match -> set a 1 at the word pos
      matches += 2 ** (column + _wordStart);

      // count simple matches and boost a row of
      // simple matches when they yield in a
      // strong match.
      if (score === 1) {
        simpleMatchCount += 1;

        if (row === 0 && !_firstMatchCanBeWeak) {
          // when the first match is a weak
          // match we discard it
          return undefined;
        }
      } else {
        // boost
        total += 1 + simpleMatchCount * (score - 1);
        simpleMatchCount = 0;
      }
    } else {
      return undefined;
    }
  }

  total -= column >= 3 ? 9 : column * 3; // late start penalty

  // dynamically keep track of the current top score
  // and insert the current best score at head, the rest at tail
  _matchesCount += 1;
  if (total > _topScore) {
    _topScore = total;
    _topMatch2 = matches;
  }
}

//#endregion
