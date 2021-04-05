import { expect, test } from '@jest/globals';
import { PREC, PRIMES_LOG2 } from '../constants';
import Ratio from '../ratio';

test("creating Ratio inst from fraction 15:14", () => {
    const x = new Ratio(15,14);
    //{2:-1,3:1,5:1,7:-1}
    const exact = PRIMES_LOG2[3]+PRIMES_LOG2[5]-PRIMES_LOG2[7]-PRIMES_LOG2[2];
    expect(Math.abs(x.exact_euler - exact) < PREC).toBe(true);
})

test("Ratio addition: 3/4 * 7/5 = 21/20", () => {
    const x = new Ratio([3,4] as fraction);
    const y = new Ratio({5:-1,7:1} as pfv);
    const exact = Math.log2(21)-Math.log2(20);
    expect(Math.abs(x.add(y).exact_euler - exact) < PREC).toBe(true);
})

test("Ratio substraction: 3/2 - 4/3 = 9/8", () => {
    const x = new Ratio([3,2] as fraction);
    const y = new Ratio({2:2,3:-1} as pfv);
    const exact = Math.log2(9)-3;
    expect(Math.abs(x.sub(y).exact_euler - exact) < PREC).toBe(true);
})

test("copying Ratio", () => {
    const x = new Ratio(15,14);
    expect(x.exact_euler ===  x.copy().exact_euler).toBe(true);
})