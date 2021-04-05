import {
  simplify_ratio,
  valid_frac
} from "./math";
import PFV from './pfv-methods'
const private_props = new WeakMap();

/**
 * wrapper around pfv vector
 */
export default class Ratio {
  /**
   * create Ratio instance with pfv map
   * @param fact
   */
  constructor(fact: pfv);
  /**
   * create Ratio instance with natural fraction [numerator, denominator].
   * This method is much slower than pfv
   * @param frac
   */
  constructor(frac: fraction);
  /**
   * create Ratio instance from other instance (make a copy)
   * @param ratio
   */
  constructor(ratio: Ratio);
  /**
   * create Ratio instance with numerator, denominator
   * @param num
   * @param den
   */
  constructor(num: number, den: number);
  /**
   * create Ratio instance with 1-d factorisation
   * @param euler log2 value
   */
  constructor(euler: number);
  constructor(arg1: any, arg2?: any) {
    /** payload as factorisation */
    let fact: pfv;
    if (PFV.is_valid(arg1) && arg2 == undefined) {
      fact = arg1 as pfv;
    }
    else if (valid_frac(arg1) && arg2 == undefined) {
      /** payload as natural fraction */
        const frac = simplify_ratio(arg1 as fraction);
        const pos_pf = PFV.factorize_int(frac[0]);
        const neg_pf = frac[0] != 1 ? PFV.factorize_int(frac[1]) : {};
        for (const key in neg_pf) if (key != '1') neg_pf[key] *= -1;
        fact = { ...pos_pf, ...neg_pf };
    }
    else if (valid_frac([arg1, arg2])) {
    /** payload as natural fraction decomposed */
      const frac = simplify_ratio([arg1, arg2] as fraction);
      const pos_pf = PFV.factorize_int(frac[0]);
      const neg_pf = frac[0] != 1 ? PFV.factorize_int(frac[1]) : {};
      for (const key in neg_pf) if (key != '1') neg_pf[key] *= -1;
      fact = { ...pos_pf, ...neg_pf };
    } 
    else if (arg1 instanceof Ratio && arg2 == undefined) {
    /** payload as other Ratio */
      fact = arg1.fact;
    }
    else if (typeof arg1 === 'number' && arg2 == undefined){
      /** payload as euler value */
      fact = {2:arg1};
    } 
    else {
      throw new Error("corrupted Ratio parameters");
    }
    private_props.set(this, fact);
  }

  /** immutable factorisation vector {[prime]:power} */
  get fact() {
    return {...private_props.get(this)};
  }
  /** ratio numerator */
  get frac() {
    return PFV.get_fraction(this.fact);
  }
  /** decimal fraction value */
  get decimal() {
    return PFV.get_decimal(this.fact);
  }
  /** exact log2 value */
  get exact_euler() {
    return PFV.get_exact_euler(this.fact);
  }
  /** log2 value disregarding temperament */
  get rational_euler() {
    return PFV.get_rational_euler(this.fact);
  }
  /** temperament log2 value */
  get temperament() {
    return PFV.get_temperament(this.fact);
  }
  /** */
  get primes() {
    return PFV.get_exact_primes(this.fact);
  }

  add(other: Ratio | pfv) {
    return new Ratio(PFV.add(this.fact, other instanceof Ratio ? other.fact : other));
  }
  sub(other: Ratio | pfv) {
    return new Ratio(PFV.sub(this.fact, other instanceof Ratio ? other.fact : other));
  }
  mod(other: Ratio | pfv) {
    return new Ratio(PFV.mod(this.fact, other instanceof Ratio ? other.fact : other));
  }
  scale(scalar: number) {
    return new Ratio(PFV.scale(this.fact, scalar));
  }
  copy(): Ratio {
    return new Ratio(this);
  }
}
