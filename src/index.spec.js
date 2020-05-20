import fuzzyPathSearch from './index';

const source = [
  'my/long/directory/structure/index.js',
  'my/long/directory/structure2/index.js',
  'my/long/directory-structure/index.js',
  'my/long/directory/structuren/index.js',
  'my/long/directory/index.js',
  'their/long/directory2/index.js',
  'their/long/directory/index.js',
  'their/long/index.js',
  'their/long/structure/index.js',
];

describe('Fuzzy Path Search', () => {
  test('filter paths', () => {
    const result = fuzzyPathSearch(source, 'dir str');
    expect(result.length).toBe(4);

    const [result1, result2, result3, result4] = result;

    expect(result1.path).toBe('my/long/directory-structure/index.js');
    expect(result2.path).toBe('my/long/directory/structure/index.js');
    expect(result3.path).toBe('my/long/directory/structure2/index.js');
    expect(result4.path).toBe('my/long/directory/structuren/index.js');

    expect(result1.tokens).toEqual([
      { text: 'my/long/', isHighlighted: false },
      { text: 'dir', isHighlighted: true },
      { text: 'ectory-', isHighlighted: false },
      { text: 'str', isHighlighted: true },
      { text: 'ucture/index.js', isHighlighted: false },
    ]);

    expect(result2.tokens).toEqual([
      { text: 'my/long/', isHighlighted: false },
      { text: 'dir', isHighlighted: true },
      { text: 'ectory/', isHighlighted: false },
      { text: 'str', isHighlighted: true },
      { text: 'ucture/index.js', isHighlighted: false },
    ]);

    expect(result3.tokens).toEqual([
      { text: 'my/long/', isHighlighted: false },
      { text: 'dir', isHighlighted: true },
      { text: 'ectory/', isHighlighted: false },
      { text: 'str', isHighlighted: true },
      { text: 'ucture2/index.js', isHighlighted: false },
    ]);

    expect(result4.tokens).toEqual([
      { text: 'my/long/', isHighlighted: false },
      { text: 'dir', isHighlighted: true },
      { text: 'ectory/', isHighlighted: false },
      { text: 'str', isHighlighted: true },
      { text: 'ucturen/index.js', isHighlighted: false },
    ]);
  });
});
