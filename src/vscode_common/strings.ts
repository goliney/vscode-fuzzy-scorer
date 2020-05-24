/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See vscode.licence.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { CharCode } from './charCode';

export function stripWildcards(pattern: string): string {
  return pattern.replace(/\*/g, '');
}

export function isLowerAsciiLetter(code: number): boolean {
  return code >= CharCode.a && code <= CharCode.z;
}

export function isUpperAsciiLetter(code: number): boolean {
  return code >= CharCode.A && code <= CharCode.Z;
}

function isAsciiLetter(code: number): boolean {
  return isLowerAsciiLetter(code) || isUpperAsciiLetter(code);
}

export function equalsIgnoreCase(a: string, b: string): boolean {
  return a.length === b.length && doEqualsIgnoreCase(a, b);
}

function doEqualsIgnoreCase(a: string, b: string, stopAt = a.length): boolean {
  for (let i = 0; i < stopAt; i++) {
    const codeA = a.charCodeAt(i);
    const codeB = b.charCodeAt(i);

    if (codeA === codeB) {
      continue;
    }

    // a-z A-Z
    if (isAsciiLetter(codeA) && isAsciiLetter(codeB)) {
      const diff = Math.abs(codeA - codeB);
      if (diff !== 0 && diff !== 32) {
        return false;
      }
    }

    // Any other charcode
    else {
      if (String.fromCharCode(codeA).toLowerCase() !== String.fromCharCode(codeB).toLowerCase()) {
        return false;
      }
    }
  }

  return true;
}

export function startsWithIgnoreCase(str: string, candidate: string): boolean {
  const candidateLength = candidate.length;
  if (candidate.length > str.length) {
    return false;
  }

  return doEqualsIgnoreCase(str, candidate, candidateLength);
}
