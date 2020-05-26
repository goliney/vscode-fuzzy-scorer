import assert from 'assert';
import { compareFilePathsByFuzzyScore, scoreFilePathFuzzy, prepareQuery } from '../src';

describe('Main', () => {
  test('compareFilePathsByFuzzyScore', function () {
    const resourceA = '/some/path/fileA.txt';
    const resourceB = '/some/path/other/fileB.txt';
    const resourceC = '/unrelated/some/path/other/fileC.txt';

    const query = prepareQuery('path fileB');

    let res = [resourceA, resourceB, resourceC].sort((r1, r2) =>
      compareFilePathsByFuzzyScore({ pathA: r1, pathB: r2, query })
    );
    assert.equal(res[0], resourceB);
    assert.equal(res[1], resourceA);
    assert.equal(res[2], resourceC);

    res = [resourceC, resourceB, resourceA].sort((r1, r2) =>
      compareFilePathsByFuzzyScore({ pathA: r1, pathB: r2, query })
    );
    assert.equal(res[0], resourceB);
    assert.equal(res[1], resourceA);
    assert.equal(res[2], resourceC);
  });

  test('scoreFilePathFuzzy', function () {
    const path = '/xyz/some/path/someFile123.txt';

    const res1 = scoreFilePathFuzzy({ path, query: 'xyz some' });
    assert.ok(res1.score);
    assert.equal(res1.labelMatch?.length, 1);
    assert.equal(res1.labelMatch![0].start, 0);
    assert.equal(res1.labelMatch![0].end, 4);
    assert.equal(res1.descriptionMatch?.length, 1);
    assert.equal(res1.descriptionMatch![0].start, 1);
    assert.equal(res1.descriptionMatch![0].end, 4);

    const res2 = scoreFilePathFuzzy({ path, query: 'some xyz' });
    assert.ok(res2.score);
    assert.equal(res1.score, res2.score);
    assert.equal(res2.labelMatch?.length, 1);
    assert.equal(res2.labelMatch![0].start, 0);
    assert.equal(res2.labelMatch![0].end, 4);
    assert.equal(res2.descriptionMatch?.length, 1);
    assert.equal(res2.descriptionMatch![0].start, 1);
    assert.equal(res2.descriptionMatch![0].end, 4);

    const res3 = scoreFilePathFuzzy({ path, query: 'some xyz file file123' });
    assert.ok(res3.score);
    assert.ok(res3.score > res2.score);
    assert.equal(res3.labelMatch?.length, 1);
    assert.equal(res3.labelMatch![0].start, 0);
    assert.equal(res3.labelMatch![0].end, 11);
    assert.equal(res3.descriptionMatch?.length, 1);
    assert.equal(res3.descriptionMatch![0].start, 1);
    assert.equal(res3.descriptionMatch![0].end, 4);

    const res4 = scoreFilePathFuzzy({ path, query: 'path z y' });
    assert.ok(res4.score);
    assert.ok(res4.score < res2.score);
    assert.equal(res4.labelMatch?.length, 0);
    assert.equal(res4.descriptionMatch?.length, 2);
    assert.equal(res4.descriptionMatch![0].start, 2);
    assert.equal(res4.descriptionMatch![0].end, 4);
    assert.equal(res4.descriptionMatch![1].start, 10);
    assert.equal(res4.descriptionMatch![1].end, 14);
  });
});
