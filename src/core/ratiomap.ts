import { factorize } from "./math";
import PositionalCombos from './combos'
import { APPROX_PRIMES } from "./constants";

/**
 * immutable class for p-limit approximation of tuning systems
 * creates a map of ratios in a given params, reduced to one octave
 */
export default class RatioMap extends Array {
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
      const p_index = APPROX_PRIMES.indexOf(limit);
      if (p_index < 0) throw Error("invalid p-limit parameter");
      /** limited prime factors */
      const l_primes = APPROX_PRIMES.slice(
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
    for (const p in record.fact) {
      fact[p] = record.fact[p] * sign;
      fact[p] >= 0
        ? (num *= parseInt(p) ** fact[p])
        : (den *= parseInt(p) ** -fact[p]);
    }
    if (octaves > 0) {
      2 in fact ? (fact[2] = octaves) : (fact[2] += octaves);
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
    for (const p in fact) {
      if (fact[p] >= 0) num *= parseInt(p) ** fact[p];
      else den *= parseInt(p) ** -fact[p];
    }
    return { num, den, euler: Math.log2(num) - Math.log2(den), fact } as ratio;
  }
}