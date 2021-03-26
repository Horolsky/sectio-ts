import { factorize } from "./math";
import { Ratio } from "./ratio";
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
  static readonly max_ranges = [1e7, 1e7, 1e6, 6e5, 6e3, 1e3, 300];
  /** p-limit: max prime factor in system */
  readonly limit: plimit;
  /** max value for numerator or denominator, affects precision */
  readonly range: number;
  /** prime factors of current system */
  readonly primes: number[];
  /**
   * create an immutable instance of RatioMap
   * @param limit max prime factor in system
   * @param range max value for numerator or denominator
   */
  constructor(limit: plimit, range: number);
  /**
   * create an immutable instance of RatioMap
   * @param data jsonized data
   */
  constructor(data: rm_data);

  constructor(payload: any, range?: number) {
    if (
      payload != undefined &&
      payload.ratios != undefined &&
      payload.ratios.length > 0 &&
      payload.limit != undefined &&
      payload.range != undefined &&
      payload.primes != undefined
    ) {
      super(payload.ratios.length);
      for (let i = 0; i < this.length; i++) this[i] = payload.ratios[i];
      this.limit = payload.limit;
      this.range = payload.range;
      this.primes = payload.primes;
    } else if (typeof payload == "number") {
      super();
      const limit = payload as plimit;
      /** p-limit index */
      const p_index = RatioMap.allowed_primes.indexOf(limit);
      if (p_index < 0) throw Error("invalid p-limit parameter");
      /** limited prime factors */
      const l_primes = RatioMap.allowed_primes.slice(
        0,
        p_index + 1
      ) as number[];
      //range normalization
      if (typeof range != "number" || range < 0)
        throw new Error("invalid range parameter");
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
        const fact: factorisation = {};
        let num = 1,
          den = 1;
        this.primes.forEach((p, i) => {
          fact[p] = combo[i];
          combo[i] >= 0 ? (num *= p ** combo[i]) : (den *= p ** -combo[i]);
        });
        if (
          num < den ||
          num > range ||
          den > range ||
          num == den ||
          num > 2 * den
        )
          continue;
        const euler = Math.log2(num) - Math.log2(den);
        const record: ratio = { num, den, euler, fact };
        Object.freeze(record);
        Object.freeze(record.fact);
        this.push(record);
      }

      this.sort((a, b) => a.euler - b.euler);
      Object.freeze(this);
    } else throw new Error("not enough data");
  }
  /** return stringified data */
  to_json() {
    return JSON.stringify({
      ratios: this,
      limit: this.limit,
      range: this.range,
      primes: this.primes,
    });
  }
  /**
   * ratio approximation
   * input value is normalized by mod 1 */
  approximate(euler: number) {
    const norm_eul = Math.abs(euler) % 1;
    //binary approximation search
    let start = 0,
      end = this.length - 1,
      mid: number;
    while (end - start > 1) {
      mid = start + Math.trunc((end - start) / 2);
      norm_eul > this[mid].euler ? (start = mid) : (end = mid);
    }
    const record =
      Math.abs(norm_eul - this[start].euler) <
      Math.abs(norm_eul - this[end].euler)
        ? (this[start] as ratio)
        : (this[end] as ratio);
    return {
      approximation: record,
      euler,
      temperament: euler - record.euler,
      limit: this.limit,
      range: this.range,
    } as RationalApproximation;
  }

  /**
   * exact ratio approximation
   * without periodic normalisation
   */
  approximate_exact(euler: number) {
    const norm_eul = Math.abs(euler) % 1;
    const octaves = Math.trunc(euler);
    const sign = Math.sign(euler);
    //binary approximation search
    let start = 0,
      end = this.length - 1,
      mid: number;
    while (end - start > 1) {
      mid = start + Math.trunc((end - start) / 2);
      norm_eul > this[mid].euler ? (start = mid) : (end = mid);
    }
    const record =
      Math.abs(norm_eul - this[start].euler) <
      Math.abs(norm_eul - this[end].euler)
        ? (this[start] as ratio)
        : (this[end] as ratio);

    const fact: factorisation = {};
    let num = 1,
      den = 1;
    Object.keys(record.fact).forEach((p, i) => {
      fact[p] = record.fact[p] * sign;
      fact[p] >= 0
        ? (num *= parseInt(p) ** fact[p])
        : (den *= parseInt(p) ** -fact[p]);
    });
    if (octaves > 0) {
      "2" in fact ? (fact[2] = octaves) : (fact[2] += octaves);
      num *= 2 ** octaves;
    }

    const approximation: ratio = {
      num,
      den,
      fact,
      euler: record.euler * sign + octaves,
    };
    Object.freeze(approximation.fact);
    return {
      approximation,
      euler,
      temperament: euler - approximation.euler,
      limit: this.limit,
      range: this.range,
    } as RationalApproximation;
  }
  static approximate(euler: number, range = 1000) {
    const fact = factorize(2 ** euler, range);
    let num = 1,
      den = 1;
    Object.keys(fact).forEach((p, i) => {
      if (fact[p] >= 0) num *= parseInt(p) ** fact[p];
      else den *= parseInt(p) ** -fact[p];
    });
    return { num, den, euler: Math.log2(num) - Math.log2(den), fact } as ratio;
  }
}

export default {
  PositionalCombos,
  RatioMap,
};
