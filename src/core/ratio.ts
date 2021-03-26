import {
  is_int,
  is_prime,
  simplify_ratio,
  factorize,
  factorize_int,
} from "./math";
import { obj_not_array } from "../utils/object";

/**
 * interval ratio class
 */
export default class Ratio {
  /** fraction [numerator, denominator] */
  private _frac: number[] = [1, 1];
  /** log2 representation */
  private _euler: number = 0;
  /** prime factorisation */
  private _fact: factorisation = { 1: 1 };

  /**
   * create Ratio instance with log2 value
   * @param euler
   */
  constructor(euler: number);
  /**
   * create Ratio instance with factorisation map
   * @param fact
   */
  constructor(fact: factorisation);
  /**
   * create Ratio instance with natural fraction [numerator, denominator]
   * @param frac
   */
  constructor(frac: number[]);
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
  constructor(arg1: any, arg2?: any) {
    this.update(arg2 ? [arg1, arg2] : arg1);
  }

  update(payload?: Ratio | factorisation | number | number[]) {
    /** payload as factorisation */
    let num: number, den: number, euler: number, fact: factorisation;
    if (obj_not_array(payload)) {
      fact = payload as factorisation;
      if (fact["0"] < 0) throw new Error("division by zero");
      (num = 1), (den = 1);
      Object.keys(fact).forEach((p) => {
        if (!is_int(fact[p]) || !is_prime(parseInt(p)))
          throw new Error("corrupted factorisation");
        if (fact[p] >= 0) num *= parseInt(p) ** fact[p];
        else den *= parseInt(p) ** -fact[p];
      });
      euler = Math.log2(num) - Math.log2(den);
    } else if (Array.isArray(payload) && payload.length == 2) {
    /** payload as natural fraction */
      payload = simplify_ratio(payload);
      (num = payload[0]), (den = payload[1]);
      if (!is_int(den) || !is_int(num)) throw new Error("invalid fraction");
      if (den === 0) throw new Error("division by zero");
      const pos_pf = factorize_int(num);
      const neg_pf = den != 1 ? factorize_int(den) : {};
      Object.keys(neg_pf).forEach((key) => {
        if (key != "1") neg_pf[key] *= -1;
      });
      fact = { ...pos_pf, ...neg_pf };
      euler = Math.log2(num) - Math.log2(den);
    } else if (typeof payload === "number") {
    /** payload as euler */
      euler = payload;
      fact = factorize(2 ** euler);
      (num = 1), (den = 1);
      Object.keys(fact).forEach((p) => {
        if (fact[p] >= 0) num *= parseInt(p) ** fact[p];
        else den *= parseInt(p) ** -fact[p];
      });
    } else if (payload instanceof Ratio) {
    /** payload as other Ratio */
      euler = payload._euler;
      fact = Object.create(payload._fact);
      num = payload._frac[0];
      den = payload._frac[1];
    } else {
      throw new Error("corrupted Ratio parameters");
    }
    this._fact = fact;
    this._frac = [num, den];
    this._euler = euler;
  }
  /** immutable factorisation map {[prime]:power}, assignable */
  get fact() {
    const wrapper = Object.create(null);
    Object.keys(this._fact).forEach((p) => {
      wrapper[p] = this._fact[p];
    });
    return Object.freeze(wrapper);
  }
  set fact(val: factorisation) {
    this.update(val);
  }
  /** log2 value, assignable */
  get euler() {
    return this._euler;
  }
  set euler(val: number) {
    this.update(val);
  }
  /** ratio numerator, assignable */
  get num() {
    return this._frac[0];
  }
  set num(val: number) {
    this.update([val, this._frac[1]]);
  }
  /** ratio denominator, assignable */
  get den() {
    return this._frac[1];
  }
  set den(val: number) {
    if (val === 0) throw new Error("division by zero");
    this.update([val, this._frac[0]]);
  }
  get decimal() {
    return this._frac[0] / this._frac[1];
  }

  add(other: Ratio | number | number[] | factorisation) {
    return Ratio.add(this, other);
  }
  sub(other: Ratio | number | number[] | factorisation) {
    return Ratio.sub(this, other);
  }
  mul(other: Ratio | number | number[] | factorisation) {
    return Ratio.mul(this, other);
  }
  div(other: Ratio | number | number[] | factorisation) {
    return Ratio.div(this, other);
  }
  logmod(mod: Ratio | number | number[] | factorisation) {
    return Ratio.logmod(this, mod);
  }
  pow(pow: number) {
    return Ratio.pow(this, pow);
  }

  static add(a: any, b: any) {
    a = Ratio.get(a);
    b = Ratio.get(b);
    return new Ratio(a.num * b.den + b.num * a.den, a.den * b.den);
  }
  static sub(a: any, b: any) {
    a = Ratio.get(a);
    b = Ratio.get(b);
    return new Ratio(a.num * b.den - b.num * a.den, a.den * b.den);
  }
  static mul(a: any, b: any) {
    a = Ratio.get(a);
    b = Ratio.get(b);
    const fact: factorisation = {};
    const primes = new Set<string>([
      ...Object.keys(a.fact),
      ...Object.keys(b.fact),
    ]);
    primes.forEach((p) => {
      fact[p] = (a.fact[p] || 0) + (b.fact[p] || 0);
    });
    return new Ratio(fact);
  }
  static div(a: any, b: any) {
    a = Ratio.get(a);
    b = Ratio.get(b);
    const fact: factorisation = {};
    const primes = new Set<string>([
      ...Object.keys(a.fact),
      ...Object.keys(b.fact),
    ]);
    primes.forEach((p) => {
      fact[p] = (a.fact[p] || 0) - (b.fact[p] || 0);
    });
    return new Ratio(fact);
  }
  static logmod(a: any, b: any) {
    const ar = new Ratio(a);
    const br = Ratio.get(b);
    while (ar.num / ar.den > br.num / br.den) ar.div(br);
    return ar;
  }
  static pow(a: any, pow: number) {
    if (!is_int(pow)) throw new Error("irrational arithmetic");
    a = Ratio.get(a);
    const fact: factorisation = {};
    Object.keys(a.fact).forEach((p) => {
      fact[p] = a.fact[p] * pow;
    });
    return new Ratio(fact);
  }
  static get(arg: any): Ratio {
    if (arg instanceof Ratio) return arg;
    else return new Ratio(arg);
  }
  static copy(arg: Ratio): Ratio {
    return new Ratio(arg);
  }
}
