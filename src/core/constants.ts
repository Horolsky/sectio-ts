/** logarithmic calculation precision */
export const PREC = 5e-15 //minimal: 3.552713678800501e-15
/** log2 of syntonic comma (81/80) */
export const S_COMMA = Math.log2(81) - Math.log2(80)
/** log2 of pythagorean comma (531441/524288) */
export const P_COMMA = Math.log2(531441) - Math.log2(524288)
/** canonic approximation primes */
export const APPROX_PRIMES = [2, 3, 5, 7, 11, 13, 17];

export default {
    PREC,
    S_COMMA,
    P_COMMA,
    APPROX_PRIMES
}