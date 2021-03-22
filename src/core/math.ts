import dict from "./types";
/** synthonic comma (81/80) in log2 form */
export const comma = Math.log2(1.0125);
/** canonic primes */
export const primes = [undefined, 2, 3, 5, 7, 11, 13, 17]; 

const _gcf = (a: number, b: number): number => (!b ? a : _gcf(b, a % b));
/**
 * greatest common factor
 */
export const gcf = (nums: number[]) => {
  if (nums.length == 0) return 1;
  let result = nums[0];
  for (let i = 1; i < nums.length; i++) {
    result = _gcf(nums[i], result);
    if (result == 1) return 1;
  }
  return result;
};
/**
 * simplify ratio by gcf
 * @param  {[type]} ratio array of integers
 */
export const simplify_ratio = (ratio: number[]) => {
  const factor = Math.abs(gcf(ratio));
  return ratio.map((el) => el / factor);
};
/**
 * prime check
 */
export const is_prime = (num: number) => {
  if (num == 2) return true;
  if (num === 1 || num % 1 != 0 || num % 2 == 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
};
/**
 * @param  {[type]} range   upper bound
 * @param  {[type]} start   lower bound, default = 2
 * @return {[type]} array of prime numbers in the given bounds
 */
export const get_primes = (range: number, start = 2) => {
  const primes = [];
  if (start == 2) primes.push(2);
  if (start % 2 === 0) start += 1;
  for (let i = start; i <= range; i += 2) {
    if (is_prime(i)) primes.push(i);
  }
  return primes;
};
/**
 * approximate decimal value as a natural fraction
 * @param  {number} value       decimal
 * @param  {number} range       max number in fraction, default = 1000
 * @param  {number} precision   approximation precision, default = 1e-16
 * @return {frac}           natural fraction as an array of 2 integers
 */
export const decimal_to_fraction = (
  value: number,
  range: number = 1000,
  precision: number = 1e-16
) => {
  const sign = Math.sign(value);
  const absval = Math.abs(value);
  const floor = Math.floor(absval);
  const ceil = floor + 1;

  //precision met
  const round = Math.round(absval);
  if ((round > absval ? round - absval : absval - round) <= precision) {
    return [round * sign, 1];
  }
  /** floor fraction */
  const f = [floor, 1];
  /** mid fraction */
  const m = [floor+ceil, 2];
  /** temp fraction */
  const t = [m[0], 2];
  /** ceil fraction */
  const c = [ceil, 1];
  let i_frac = m[0] / m[1];
  while (Math.abs(absval - i_frac) >= precision) {
    if (i_frac > absval) (c[0] = m[0]), (c[1] = m[1]);
    else (f[0] = m[0]), (f[1] = m[1]);
    t[0] = f[0] + c[0];
    t[1] = f[1] + c[1];
    if (t[0] > range || t[1] > range) break;
    else {
      (m[0] = t[0]), (m[1] = t[1]);
      i_frac = m[0] / m[1];
    }
  }
  m[0] *= sign;
  return m;
};
/**
 * largest prime factor
 * @param {number}
 * @return {number}
 */
export const largest_prime = (val: number) => {
  val = Math.abs(val);
  if (val === 1 || val === 2) return val;
  while (val % 2 === 0) val /= 2;
  if (val === 1) return 2;
  let max = 0;
  for (let i = 3; i <= val; i += 2) {
    while (val % i === 0) {
      val /= i;
      max = Math.max(i, max);
    }
  }
  max = Math.max(val, max);
  return max;
};
/**
 * get prime factorization 
 * @param {number}
 * @return {dict} dict where key is prime factor and value is it's power
 */
export const factorize_int = (val: number) => {
  const sign = Math.sign(val);
  val = Math.abs(val);
  const result: dict = { [sign]: 1 };
  
  for (let div = 2; div <= val; div++) {
    if (val % div !== 0) continue;

    let is_prime = true;
    for (let i = 2; i <= Math.sqrt(div); i++) {
      if (div % i === 0) {
        is_prime = false;
        break;
      }
    }
    if (is_prime) {
        result[div] = 0;
        while (val % div === 0) {
          val /= div;
          result[div]++;
        }
    }
  }
  return result;
}

/**
 * get prime factorization 
 * @param {number} val
 * @param {number} range
 * @param {number} precision
 * @return {dict} dict where key is prime factor and value is it's power
 */
 export const factorize_float = (val: number, range=1000, precision=1e-16): dict => {
     const frac = decimal_to_fraction(val, range, precision);
     const pos_pf = factorize_int(frac[0]);
     const neg_pf = factorize_int(frac[1]);
     Object.keys(neg_pf).map(function(key, index) {
        if (key != '1') neg_pf[key] *= -1;
      });
    return {...pos_pf, ...neg_pf};
 }
export default {
  comma,
  primes,
  gcf,
  simplify_ratio,
  is_prime,
  get_primes,
  largest_prime,
  decimal_to_fraction,
  factorize_int,
  factorize_float
};
