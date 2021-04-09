/** logarithmic calculation precision */
export const PREC = 6e-13;
//tested on difference of exact log2 values with toFixed(12)
//min for comma division: 5e-14, min 64-bit: 3.552713678800501e-15
/** log2 of syntonic comma (81/80) */
export const S_COMMA = Math.log2(81/80);
/** log2 of pythagorean comma (531441/524288) */
export const P_COMMA = Math.log2(531441/524288);
/** range for comma fraction approximation */
export const COMMA_RANGE = 100;
/** canonic approximation primes */
export const APPROX_PRIMES = [2, 3, 5, 7, 11, 13, 17];
/**
 * log2 values of primes from 2 to 17
 */
export const PRIMES_LOG2: map_numeric = {
    2: 1,
    3: Math.log2(3),
    5: Math.log2(5),
    7: Math.log2(7),
    11: Math.log2(11),
    13: Math.log2(13),
    17: Math.log2(17)
}

export default {
    PREC,
    S_COMMA,
    P_COMMA,
    APPROX_PRIMES
}