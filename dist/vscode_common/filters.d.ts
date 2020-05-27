export interface IFilter {
    (word: string, wordToMatchAgainst: string): IMatch[] | null;
}
export interface IMatch {
    start: number;
    end: number;
}
/**
 * @returns A filter which combines the provided set
 * of filters with an or. The *first* filters that
 * matches defined the return value of the returned
 * filter.
 */
export declare function or(...filter: IFilter[]): IFilter;
export declare const matchesStrictPrefix: IFilter;
export declare const matchesPrefix: IFilter;
export declare function isUpper(code: number): boolean;
export declare function matchesCamelCase(word: string, camelCaseWord: string): IMatch[] | null;
export declare function createMatches(score: undefined | FuzzyScore): IMatch[];
export declare function isPatternInWord(patternLow: string, patternPos: number, patternLen: number, wordLow: string, wordPos: number, wordLen: number): boolean;
/**
 * A tuple of three values.
 * 0. the score
 * 1. the matches encoded as bitmask (2^53)
 * 2. the offset at which matching started
 */
export declare type FuzzyScore = [number, number, number];
export declare namespace FuzzyScore {
    /**
     * No matches and value `-100`
     */
    const Default: [-100, 0, 0];
    function isDefault(score?: FuzzyScore): score is [-100, 0, 0];
}
export declare function fuzzyScore(pattern: string, patternLow: string, patternStart: number, word: string, wordLow: string, wordStart: number, firstMatchCanBeWeak: boolean): FuzzyScore | undefined;
