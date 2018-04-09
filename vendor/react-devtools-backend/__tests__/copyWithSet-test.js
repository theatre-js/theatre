/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
'use strict';

var copyWithSet = require('../copyWithSet');

describe('copyWithSet', function() {
  it('adds a property', function() {
    var res = copyWithSet({c: 2, d: 4}, ['a'], 'b');
    expect(res).toEqual({a: 'b', c: 2, d: 4});
  });

  it('modifies a property', function() {
    var res = copyWithSet({c: 2, d: 4}, ['c'], '10');
    expect(res).toEqual({c: '10', d: 4});
  });

  it('preserves deep objects', function() {
    var res = copyWithSet({a: {b: {c: 3}, d: 2}, e: 1}, ['a', 'b', 'c'], 10);
    expect(res).toEqual({a: {b: {c: 10}, d: 2}, e: 1});
  });

  it('modifies an array', function() {
    var res = copyWithSet(['a', 'b', 'x'], [2], 'c');
    expect(res).toEqual(['a', 'b', 'c']);
  });

  it('works with complexity', function() {
    var res = copyWithSet([0, 1, {2: {3: [4, 5, {6: {7: 8}}, 9], 10: 11}}, 12], [2, '2', '3', 2, '6', '7'], 'moose');
    expect(res).toEqual([0, 1, {2: {3: [4, 5, {6: {7: 'moose'}}, 9], 10: 11}}, 12]);
  });
});
