

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
//type factorisation  = Map<number, number>;
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
type interval = number | number[] | ratio | Ratio;
/** RatioMap jsonized data */
type rm_data = {
  ratios: ratio[],
  limit: number,
  range: number,
  primes: number[]
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
/** canonic model parameters */
type canon_params = {
  /** p-limit of the system's rational approximation */
  limit: null | plimit,
  /** range of the system's rational approximation */
  range: number,
  /** periodic interval of the system */
  period: null | number | number[],
  /** temperament representation interval */
  comma: number
}
/** canonic section data */
type section = {
  id: number,
  /** section's full name */
  name: string,
  /** section's short code */
  code: string,
  /** id of parent section */
  parent: number,
  /** ratio to parent section */
  rtp: number | number[]
}
/** canonic raw data schema */
type canon_schema = {
  id: number,
  name: string,
  code: string,
  description: string,
  tags: string[],
  baseFreq: number,
  baseStrL: number,
  baseColor: string,
  params: canon_params,
  sections: section[]
}

type canon_cache = {
  /** number of sections */
  size: number,
  /** adjacency matrix of generator intervals */
  generators_mt: number[],
  /** complete adjacency matrix of sections relations */
  relations_mt: number[],
  /** parent list (index - section, value - parent's id) */
  parent_list: number[],
  /** factorisation primes*/
  primes: [],
  /** adjacency matrix of factorisaion vectors */
  factorisation_mt: number[][],
  /** full system as ratio in factorisation form */
  super_ratio_fct: number[]
}