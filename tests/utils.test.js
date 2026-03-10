import { describe, test, expect } from 'vitest';
import { binarySearch, divide, isInteger } from '../src/utils.js';
import { checkIsInt, checkArrayType } from '../src/preconditions.js';

describe('Utils', () => {
  test('binarySearch', () => {
    function testBinarySearch(a, key, expected) {
      const result = binarySearch(a, key);
      expect(result).toBe(expected);
    }
    const array = [1, 2, 3];

    testBinarySearch(array, 0, -1);
    testBinarySearch(array, 1, 0);
    testBinarySearch(array, 2, 1);
    testBinarySearch(array, 3, 2);
    testBinarySearch(array, 4, 2);

    const array2 = [0, 10, 20, 30];

    testBinarySearch(array2, 0, 0);
    testBinarySearch(array2, 5, 0);
    testBinarySearch(array2, 10, 1);
    testBinarySearch(array2, 15, 1);
    testBinarySearch(array2, 20, 2);
    testBinarySearch(array2, 25, 2);
    testBinarySearch(array2, 30, 3);
    testBinarySearch(array2, 35, 3);

    const array3 = [10, 20, 120, 220, 320, 420, 440, 460, 560, 660, 760];
    testBinarySearch(array3, 675.9780231211334, 9);
  });

  test('divide', () => {
    function testDivide(dividend, divisor, expectedQuotient, expectedRest) {
      const result = divide(dividend, divisor);
      expect(result.quotient).toBe(expectedQuotient);
      expect(result.rest).toBe(expectedRest);
    }
    testDivide(2.5, 2, 1, 0.5);
    testDivide(2, 2, 1, 0);
    testDivide(3.5, 5, 0, 3.5);
    testDivide(0, 5, 0, 0);
  });

  test('Preconditions.checkIsInt', () => {
    expect(checkIsInt(1)).toBe(1);
    expect(checkIsInt(0)).toBe(0);
    expect(checkIsInt(-1)).toBe(-1);
    expect(() => checkIsInt(1.5)).toThrow();
    expect(() => checkIsInt(null)).toThrow();
  });

  test('Preconditions.checkArrayType', () => {
    class CustomClass {}
    checkArrayType([new CustomClass(), new CustomClass()], CustomClass);
    expect(() => checkArrayType([new CustomClass(), 'string'], CustomClass)).toThrow();
    expect(() => checkArrayType(new CustomClass(), CustomClass)).toThrow();
  });

  test('isInteger', () => {
    expect(isInteger('1')).toBeTruthy();
    expect(isInteger('-1')).toBeTruthy();
    expect(isInteger('0')).toBeTruthy();
    expect(isInteger('101')).toBeTruthy();
    expect(isInteger('+1')).toBeTruthy();
    expect(isInteger('a')).toBeFalsy();
    expect(isInteger('1.1')).toBeFalsy();
    expect(isInteger('o')).toBeFalsy();
  });
});
