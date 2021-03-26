
/** RatioMap jsonized data */
type rm_data = {
    ratios: Ratio[],
    limit: number,
    range: number,
    primes: number[]
};
/** 
 * approximaton prime limit
 * if undefined, will use fast approximation algo
 */
type plimit = 2 | 3 | 5 | 7 | 11 | 13 | 17;

/** 
 * prime factorisation 
 * key: prime, value: power
*/
type factorisation = {
  [key: string]: number
}

type ratio = {
  /** fraction numerator */
  readonly num: number;
  /** fraction denominator */
  readonly den: number;
  /** log2 representation */
  readonly euler: number;
  /** prime factorisation */
  readonly fact: factorisation
};
/**
 * extends Ratio class with temperament parameter
 */
type RationalApproximation = {
  /** log2 representation */
  readonly euler: number,
  readonly approximation: Ratio,
  /** difference between actual value and approximation in log2 */
  readonly temperament: number,
  readonly limit: plimit,
  readonly range: number
};