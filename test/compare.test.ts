/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { compare } from '../src/compare';

describe('compare', () => {
  it('calculates the set differences of both input sets', () => {
    const comparison = compare([1, 2, 3, 4], [0, 1, 2, 3]);
    expect(comparison.left).toEqual([4]);
    expect(comparison.right).toEqual([0]);
  });
  it('calculates the set intersection', () => {
    const comparison = compare([1, 2, 3, 4], [0, 1, 2, 3]);
    expect(comparison.both).toEqual([1, 2, 3]);
  });
  it('provides the set union list of items with their set memberships', () => {
    const comparison = compare(['abc', 'def'], ['def', 'ghi']);
    expect(comparison.entries).toContainEqual({
      element: 'abc',
      left: true,
      right: false,
    });
    expect(comparison.entries).toContainEqual({
      element: 'def',
      left: true,
      right: true,
    });
    expect(comparison.entries).toContainEqual({
      element: 'ghi',
      left: false,
      right: true,
    });
  });
});
