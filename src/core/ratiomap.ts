import { is_int } from './math';
import PositionalCombos from './combos'
import { APPROX_PRIMES, PREC } from "./constants";
import {get_exact_euler} from './pfv-methods'

const rm_cache = new Map<string, RatioMap>();

/**
 * immutable class for p-limit approximation of tuning systems\
 * creates a map of ratios in a given params, reduced to one octave
 */
export class RatioMap {
  /** max ranges corresponding to p-limit */
  static readonly max_ranges = [1e7, 1e7, 1e6, 6e5, 6e3, 1e3, 300];
  /** limited ratio space */
  readonly space: Array<rm_record>;
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
      payload.space != undefined &&
      payload.space.length > 0 &&
      payload.limit != undefined &&
      payload.range != undefined &&
      payload.primes != undefined
    ) {
      this.space = payload.space;
      this.limit = payload.limit;
      this.range = payload.range;
      this.primes = payload.primes;
    } else if (typeof payload == "number") {
      this.space = Array<rm_record>();
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
        const fact: pfv = {};
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
        const euler = get_exact_euler(fact);
        const record: rm_record = { euler, fact };
        Object.freeze(record);
        Object.freeze(record.fact);
        this.space.push(record);
      }

      this.space.sort((a, b) => a.euler - b.euler);
      Object.freeze(this.space);
      Object.freeze(this);
    } else throw new Error("not enough data");
  }
  /** return stringified data */
  to_json() {
    return JSON.stringify({
      space: this.space,
      limit: this.limit,
      range: this.range,
      primes: this.primes,
    });
  }

  /**
   * approximate by given euler value
   * return rational factorisation 
   * with temperament stored on p-2 power value
   * @param euler 
   * @returns 
   */
  approximate(euler: number): pfv {
    if (typeof euler != "number") throw new Error("invalid input type");
    if (is_int(euler)) return {2:euler};
    
    const norm_eul = Math.abs(euler) % 1;
    const octaves = Math.trunc(euler);
    const sign = Math.sign(euler);
    
    //binary approximation search
    let start = 0,
      end = this.space.length - 1,
      mid: number;
    while (end - start > 1) {
      mid = start + Math.trunc((end - start) / 2);
      norm_eul > this.space[mid].euler ? (start = mid) : (end = mid);
    }
    const record =
      Math.abs(norm_eul - this.space[start].euler) <
      Math.abs(norm_eul - this.space[end].euler)
        ? (this.space[start] as rm_record)
        : (this.space[end] as rm_record);

    const fact: pfv = {};
    for (const p in record.fact) fact[p] = euler > 0 && record.fact[p] != 0 ? record.fact[p] : -record.fact[p];
    let temperament = (norm_eul - record.euler)*sign;// euler;// * Math.sign(euler);// + octaves;
    if (Math.abs(temperament) <= PREC) temperament = 0;
    2 in fact ? (fact[2] += octaves+temperament) : (fact[2] = octaves+temperament);
    return fact;
  }
}

export const get_ratio_map = (limit: plimit, range: number) => {
  if (!is_int(limit) || !is_int(range)) throw Error("non integer arguments");
  const id = `RM-${limit}-${range}`;
  if (rm_cache.has(id)) { 
    const rm = rm_cache.get(id) as RatioMap;
    return rm;
  }
  else {
    const data = (localStorage as any).getItem(id);
    const rm = data ? new RatioMap(JSON.parse(data) as rm_data) : new RatioMap(limit, range);
    rm_cache.set(id, rm);
    return rm;
  }
}

export const clear_rm_cache = () => rm_cache.clear();

export const store_rm_cache = () => {
  for (const id in rm_cache.keys()) {
    if (!(localStorage as any).getItem(id)) (localStorage as any).setItem(id, (rm_cache.get(id) as RatioMap).to_json());
  }
};
export const storage_index = () => {
  const index: string[] = [];
  for (const key in (localStorage as any)){
    if (key.slice(0,3) === "RM-") index.push(key);
  }
  return index;
};
export const storage_size = () => {
  let size = 0;
  const encoder = new TextEncoder();
  for (const key in storage_index()){
    const item = (localStorage as any).getItem(key);
    if (item) size += encoder.encode(item).length;
  }
  return size;
};

export default {
  get_ratio_map,
  clear_rm_cache,
  store_rm_cache,
  storage_index,
  storage_size
};