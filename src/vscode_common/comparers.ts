/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IdleValue } from './async';

// When comparing large numbers of strings, such as in sorting large arrays, is better for
// performance to create an Intl.Collator object and use the function provided by its compare
// property than it is to use String.prototype.localeCompare()

// A collator with numeric sorting enabled, and no sensitivity to case or to accents
const intlFileNameCollatorBaseNumeric: IdleValue<{
  collator: Intl.Collator;
  collatorIsNumeric: boolean;
}> = new IdleValue(() => {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  return {
    collator: collator,
    collatorIsNumeric: collator.resolvedOptions().numeric,
  };
});

export function compareFileNames(
  one: string | null,
  other: string | null,
  caseSensitive = false
): number {
  const a = one || '';
  const b = other || '';
  const result = intlFileNameCollatorBaseNumeric.value.collator.compare(a, b);

  // Using the numeric option in the collator will
  // make compare(`foo1`, `foo01`) === 0. We must disambiguate.
  if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && a !== b) {
    return a < b ? -1 : 1;
  }

  return result;
}

export function compareAnything(one: string, other: string, lookFor: string): number {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase();

  // Sort prefix matches over non prefix matches
  const prefixCompare = compareByPrefix(one, other, lookFor);
  if (prefixCompare) {
    return prefixCompare;
  }

  // Sort suffix matches over non suffix matches
  const elementASuffixMatch = elementAName.endsWith(lookFor);
  const elementBSuffixMatch = elementBName.endsWith(lookFor);
  if (elementASuffixMatch !== elementBSuffixMatch) {
    return elementASuffixMatch ? -1 : 1;
  }

  // Understand file names
  const r = compareFileNames(elementAName, elementBName);
  if (r !== 0) {
    return r;
  }

  // Compare by name
  return elementAName.localeCompare(elementBName);
}

export function compareByPrefix(one: string, other: string, lookFor: string): number {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase();

  // Sort prefix matches over non prefix matches
  const elementAPrefixMatch = elementAName.startsWith(lookFor);
  const elementBPrefixMatch = elementBName.startsWith(lookFor);
  if (elementAPrefixMatch !== elementBPrefixMatch) {
    return elementAPrefixMatch ? -1 : 1;
  }

  // Same prefix: Sort shorter matches to the top to have those on top that match more precisely
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
