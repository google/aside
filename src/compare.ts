/**
 * Copyright 2023 Google LLC
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
/**
 * Small wrapper for lazily producing values.
 * @template T the value type.
 */
class Lazy<T> {
  private calculatedValue?: T;
  private hasCalculatedValue: boolean = false;

  /**
   * Returns the value or calculates it if none has yet been calculated.
   * @returns {T} the value.
   */
  get value(): T {
    if (!this.hasCalculatedValue) {
      this.calculatedValue = this.calculate();
      this.hasCalculatedValue = true;
    }
    return <T>this.calculatedValue;
  }

  /**
   * Creates a new cached value wrapper.
   * @param {function(): T} calculate the function to produce the value.
   */
  constructor(private readonly calculate: () => T) {}
}

/**
 * A comparision entry holding an element and the element's set membership.
 * @template T the element type.
 */
interface ComparisonEntry<T> {
  /**
   * The comparison element.
   * @type {T}
   * */
  readonly element: T;
  /**
   * A boolean indicating whether the element is in the left set.
   * @type {boolean}
   */
  readonly left: boolean;
  /**
   * A boolean indicating whether the element is in the right set.
   * @type {boolean}
   */
  readonly right: boolean;
}

/**
 * The result of a set comparison of two inputs.
 * @template T the element type.
 */
class SetComparison<T> {
  /**
   * All entries from the left and right inputs.
   * @type {ComparisonEntry[]}
   */
  readonly entries: ComparisonEntry<T>[];

  private cachedLeft = new Lazy<T[]>(() =>
    this.entries
      .filter(entry => entry.left && !entry.right)
      .map(entry => entry.element)
  );
  private cachedRight = new Lazy<T[]>(() =>
    this.entries
      .filter(entry => entry.right && !entry.left)
      .map(entry => entry.element)
  );
  private cachedBoth = new Lazy<T[]>(() =>
    this.entries
      .filter(entry => entry.left && entry.right)
      .map(entry => entry.element)
  );

  /**
   * The elements that are only in the left input.
   * @type {T}
   */
  get left() {
    return this.cachedLeft.value;
  }
  /**
   * The elements that are only in the right input.
   * @type {T}
   */
  get right() {
    return this.cachedRight.value;
  }
  /**
   * The set intersection of the inputs.
   * @type {T}
   */
  get both() {
    return this.cachedBoth.value;
  }

  /**
   * Adds an element and it's set membership to this comparison.
   * @param {T} element the element.
   * @param {boolean} left whether this element belongs to the left input.
   * @param {boolean} right whether this element belongs to the right input.
   */
  private addElement(element: T, left: boolean, right: boolean) {
    this.addEntry({ element, left, right });
  }

  /**
   * Adds a comparision entry to this comparison.
   * @param {ComparisonEntry<T>} entry the entry.
   */
  private addEntry(entry: ComparisonEntry<T>) {
    this.entries.push(entry);
  }

  /**
   * Creates a new comparison object.
   * @param {Iterable<ComparisonEntry<T>>} [entries] an optional initialization
   *  iterable of comparison entries.
   */
  constructor(entries: Iterable<ComparisonEntry<T>> = []) {
    this.entries = [...entries];
  }

  /**
   * Creates a comparison of two input iterables.
   * @template T the element type of the inputs.
   * @param {Iterable<T>} left the first input iterable.
   * @param {Iterable<T>} right the second input iterable.
   * @returns {SetComparison<T>} the comparison.
   */
  static create<T>(left: Iterable<T>, right: Iterable<T>) {
    const leftSet = new Set(left);
    const rightSet = new Set(right);
    const union = new Set<T>([...leftSet, ...rightSet]);
    const comparison = new SetComparison<T>();
    for (const element of union) {
      comparison.addElement(
        element,
        leftSet.has(element),
        rightSet.has(element)
      );
    }
    return comparison;
  }
}

/**
 * Creates a comparison of two input iterables.
 * @template T the element type of the inputs.
 * @param {Iterable<T>} left the first input iterable.
 * @param {Iterable<T>} right the second input iterable.
 * @returns {SetComparison<T>} the comparison.
 */
export function compare<T>(left: Iterable<T>, right: Iterable<T>) {
  return SetComparison.create(left, right);
}
