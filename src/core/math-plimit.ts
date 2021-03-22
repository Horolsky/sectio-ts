/**
 * immutable class for natural numbers combinations
 * creates a series of real numbers in a mixed-radix numeral system
 * and maps it to a given bounds inclusively
 */
export class PositionalCombos extends Array {
  /** upper inclusive position bounds */
  readonly upper_bounds: number[];
  /** lower inclusive position bounds */
  readonly lower_bounds: number[];
  /** radices (bound amplitudes) */
  readonly radices: number[];
  /** place values for positional numeral system */
  readonly place_values: number[];
  /**
   * each upper and lower bounds that give negat amplitude would be swapped
   * e. g. ([-1, 2], [3, -4]) => ([3, -1], [2, -4])
   * @param upper_bounds
   * @param lower_bounds zeros by default
   * @returns series of combos as a stepwise series of real numbers in a given bounds
   */
  constructor(
    upper_bounds: number[],
    lower_bounds: number[] = new Array(upper_bounds.length).fill(0)
  ) {
    if (upper_bounds.length != lower_bounds.length)
      throw new Error("unequal length of args");
    const W = upper_bounds.length;
    if (W === 0) throw Error("bounds must be non-empty");
    //normalizing bounds
    for (let i = 0; i < W; i++) {
      let swap: number;
      if (upper_bounds[i] < lower_bounds[i]) {
        swap = upper_bounds[i];
        upper_bounds[i] = lower_bounds[i];
        lower_bounds[i] = swap;
      }
    }
    const radices = upper_bounds.map((up, i) =>
      Math.abs(up - lower_bounds[i] + 1)
    );
    super(radices.reduce((a, b) => a * b, 1));
    this.upper_bounds = upper_bounds;
    this.lower_bounds = lower_bounds;
    this.radices = radices;
    //place_values
    this.place_values = new Array(W);
    this.place_values[W - 1] = radices[W - 1];
    for (let i = W - 2; i >= 0; i--)
      this.place_values[i] = radices[i] * this.place_values[i + 1];
    //first combo
    this[0] = lower_bounds.slice();
    //rightmost column
    for (let combo = 1; combo < this.length; combo++) {
      this[combo] = new Array<number>(W);
      this[combo][W - 1] = (combo % radices[W - 1]) + lower_bounds[W - 1];
    }
    //filling combos by position
    for (let position = W - 2; position >= 0; position--) {
      for (let combo = 1; combo < this.length; combo++) {
        const cycle = Math.floor(combo / this.place_values[position + 1]);
        this[combo][position] =
          (cycle % radices[position]) + lower_bounds[position];
      }
    }
    //freezing data
    for (let combo = 0; combo < this.length; combo++)
      Object.freeze(this[combo]);
    Object.freeze(this.upper_bounds);
    Object.freeze(this.lower_bounds);
    Object.freeze(this.radices);
    Object.freeze(this.place_values);
    Object.freeze(this);
  }
  get width() {
    return this.upper_bounds.length;
  }
}
/**
 * immutable class for p-limit approximation of tuning systems
 * creates a map of ratios in a given params, reduced to one octave
 */
export class RatioMap extends Array {
  /** allowed primes/p-limits */
  static readonly allowed_primes = [2, 3, 5, 7, 11, 13, 17];
  /** max ranges corresponding to p-limit */
  static readonly max_ranges = [1e7, 1e7, 1e6, 6e5, 2e4, 5e3, 1e3];
  /** p-limit: max prime factor in system */
  readonly limit: number;
  /** max value for numerator or denominator, affects precision */
  readonly range: number;
  /** prime factors of current system */
  readonly primes: number[];
  /**
   * create an immutable instance of RatioMap
   * @param limit max prime factor in system
   * @param range max value for numerator or denominator
   */
  constructor(limit: plimit, range:number);
  /**
   * create an immutable instance of RatioMap
   * @param data jsonized data
   */
  constructor(data: rm_data);
  
  constructor(payload: any, range?: number) {
    if (<rm_data>payload.ratios != undefined) {
      super(payload.ratios.length);
      for (let i = 0; i < this.length; i++) this[i] = payload.ratios[i];
      this.limit = payload.limit;
      this.range = payload.range;
      this.primes = payload.primes;
    } else if (<plimit>payload != undefined && range != undefined) {
      super();
      const limit = payload;
      /** p-limit index */
      const p_index = RatioMap.allowed_primes.indexOf(limit);
      /** limited prime factors */
      const l_primes = RatioMap.allowed_primes.slice(0, p_index + 1);
      //range normalization
      if (range > RatioMap.max_ranges[p_index])
        range = RatioMap.max_ranges[p_index];
      //prime powers
      const upper_bounds = l_primes.map((p) =>
        Math.floor(Math.log(range!) / Math.log(p))
      );
      const lower_bounds = upper_bounds.map((el) => el * -1);
      const prime_powers = new PositionalCombos(upper_bounds, lower_bounds);

      this.limit = limit;
      this.range = range;
      this.primes = l_primes;

      for (let row = 0; row < prime_powers.length; row++) {
        const combo = prime_powers[row];
        let num = 1,
          den = 1;
        for (let i = 0; i < combo.length; i++) {
          combo[i] >= 0
            ? (num *= l_primes[i] ** combo[i])
            : (den *= l_primes[i] ** -combo[i]);
        }
        if (num < den || num > range || den > range) continue;
        const euler = Math.log2(num) - Math.log2(den);
        if (euler < 1) {
          const record: Ratio = {
            num,
            den,
            flt: num / den,
            euler,
            primes: this.primes,
            powers: combo.slice(),
          };
          Object.freeze(record);
          Object.freeze(record.powers);
          this.push(record);
        }
      }
      Object.freeze(this);
    }
    else throw new Error("not enough data");
    
  }

  to_json() {
    return JSON.stringify({
      ratios: this,
      limit: this.limit,
      range: this.range,
      primes: this.primes,
    });
  }

}

export default {
  PositionalCombos,
  RatioMap,
};