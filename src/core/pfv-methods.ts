import {
  decimal_to_fraction,
  is_int,
  is_prime,
} from "./math";
import { PREC, PRIMES_LOG2 } from "./constants";

/**
 * get prime factorization
 * @param {number}
 * @return {pfv} prime factorization vector (key: prime, value: power)
 */
export const factorize_int = (val: number) => {
  const result: pfv = val > 0 ? {} : {[-1]: 1};
  val = Math.abs(val);
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
};
/**
 * get prime factorization
 * @param {number} val
 * @param {number} range
 * @param {number} precision
 * @return {pfv} pfv dict (key: prime, value: power)
 */
 export const factorize_frac = (frac: fraction):pfv => {
  const pos_pf = factorize_int(frac[0]);
  const neg_pf = factorize_int(frac[1]);
  for (const key in neg_pf){
    if (key != '1') neg_pf[key] *= -1;
  }
  return {...pos_pf, ...neg_pf};
};
/**
 * get prime factorization
 * @param {number} val
 * @param {number} range
 * @param {number} precision
 * @return {pfv} pfv dict (key: prime, value: power)
 */
export const factorize_float = (val: number, range = 1000, precision=PREC):pfv => {
  const frac = decimal_to_fraction(val, range, precision);
  return factorize_frac(frac);
};

/** factorisation vector addition, modifies and returns first arg */
export const add_in_place = (
  A: pfv,
  B: pfv
): pfv => {
  for (const p in B) A[p] ? A[p] += B[p] : A[p] = B[p];
  return A;
};
/** factorisation substraction, modifies and returns first arg */
export const sub_in_place = (
  A: pfv,
  B: pfv
): pfv => {
  for (const p in B) A[p] ? A[p] -= B[p] : A[p] = B[p];
  return A;
};
/** factorisation modulo, modifies and returns first arg */
export const mod_in_place = (
  A: pfv,
  B: pfv
): pfv => {
  while (get_exact_euler(A) > get_exact_euler(B)) sub_in_place(A, B);
  return A;
};
/** factorisation scaling, modifies and returns first arg */
export const scale_in_place = (
  A: pfv,
  scalar: number
): pfv => {
  if (!is_int(scalar)) throw Error("only integer scaling supported");
  for (const p in A) A[p] *= scalar;
  return A;
};
/** factorisation vector addition */
export const add = (A: pfv, B: pfv): pfv => {
  const f: pfv = { ...A, ...B };
  for (const p in f) f[p] = (A[p] || 0) + (B[p] || 0);
  return f;
};
/** factorisation substraction */
export const sub = (A: pfv, B: pfv): pfv => {
  const f: pfv = { ...A, ...B };
  for (const p in f) f[p] = (A[p] || 0) - (B[p] || 0);
  return f;
};
/** factorisation modulo */
export const mod = (A: pfv, B: pfv): pfv => {
  const _A = { ...A };
  while (get_exact_euler(_A) > get_exact_euler(B)) sub_in_place(_A, B);
  return A;
};
/** factorisation scaling */
export const scale = (A: pfv, scalar: number): pfv => {
  if (!is_int(scalar)) throw Error("only integer scaling supported");
  const f: pfv = { ...A };
  for (const p in f) f[p] = A[p] * scalar;
  return f;
};
/** factorisation vector to euler value */
export const get_exact_euler = (fact: pfv) => {
  let result = 0;
  for (const p in fact) result += PRIMES_LOG2[p] * fact[p];
  return result;
};
/** return euler value without temperament, i. e. with rounded 2-p power */
export const get_rational_euler = (fact: pfv) => {
  let result = 0;
  for (const p in fact)
    result += p === "2" ? Math.round(fact[p]) : PRIMES_LOG2[p] * fact[p];
  return result;
};
/** return euler value of temperament, stored on 2-p power */
export const get_temperament = (fact: pfv) => {
  return fact[2] - Math.round(fact[2]);
};
/** factorisation vector to decimal value */
export const get_decimal = (fact: pfv) => {
  let result = 0;
  for (const p in fact) result += parseFloat(p) ** fact[p];
  return result;
};
/** factorisation vector to fraction */
export const get_fraction = (fact: pfv): fraction => {
  let num = 1,
    den = 1;
  for (const p in fact) {
    fact[p] >= 0
      ? (num *= parseInt(p) ** Math.round(fact[p]))
      : (den *= parseInt(p) ** -Math.round(fact[p]));
  }
  return [num, den] as fraction;
};
/** get euler from fraction */
export const fraction_to_euler = (frac: fraction): number => {
  return Math.log2(frac[0])-Math.log2(frac[1]);
};
/** factorisation vector validity */
export const is_valid = (fact: pfv) => {
  if (typeof fact != "object") return false;
  if (Object.keys(fact).length == 0) return false;
  for (const key in fact) {
    const p = parseFloat(key);
    if (!is_prime(p) || (p != 2 && !is_int(fact[p]))) return false;
  }
  return true;
};
/** get prime factors */
export const get_primes = (A: pfv) => {
  return Object.keys(A).map(p => parseInt(p));
}
/** get prime factors with none-zero powers */
export const get_exact_primes = (A: pfv) => {
  return get_primes(A).filter(p => A[p] != 0);
}
export default {
  factorize_int,
  factorize_frac,
  factorize_float,
  add,
  sub,
  scale,
  mod,
  add_in_place,
  sub_in_place,
  scale_in_place,
  mod_in_place,
  get_decimal,
  get_fraction,
  get_exact_euler,
  get_rational_euler,
  get_temperament,
  fraction_to_euler,
  is_valid,
  get_primes,
  get_exact_primes
}