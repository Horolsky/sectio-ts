
/** RatioMap jsonized data */
type rm_data = {
    ratios: Ratio[],
    limit: number,
    range: number,
    primes: number[]
};

type plimit = 2 | 3 | 5 | 7 | 11 | 13 | 17;

type Ratio = {
  /** fraction numerator */
  num: number;
  /** fraction denominator */
  den: number;
  /** float representation */
  flt: number;
  /** log2 representation */
  euler: number;
  /** prime factors */
  primes: number[];
  /** prime factor powers */
  powers: number[];
};
