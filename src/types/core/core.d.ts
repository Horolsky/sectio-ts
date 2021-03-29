

/** 
 * approximaton prime limit
 * if undefined, will use fast approximation algo
 */
type plimit = 2 | 3 | 5 | 7 | 11 | 13 | 17;

/** 
 * prime factorisation 
 * key: prime, value: power
*/
type factorisation = map_numeric

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


interface intrv_incendence {
  [key: number]: number[][]
}
interface ratio_dict {
  [key: number]: Ratio | RationalApproximation,
}
type canon_cache = {
  /** number of sections */
  size: number,
  /** section ids can be uneven */
  id_list: number[],
  /** rational model (no temperament) */
  rational: boolean,
  /** complete adjacency matrix of sections relations */
  relations_mt: number[],
  /** interval incedence list where values are list of sections id tuples*/
  interval_incedence: intrv_incendence,
  /** parent list (index - section, value - parent's id) */
  parent_list: dict<number, null | number>,
  /** heuristic property: ratiodict generated from ratiomap*/
  ratiodict?: ratio_dict,
  /** heuristic property: adjacency matrix of heuristic generator intervals */
  generators?: number[],
  /** heuristic property: list of factorisation primes for unlim approximations or rational systems */
  primes?: number[],
  /** rational canon property: adjacency matrix of factorisaion vectors */
  factorisation_mt?: number[][],
  /** rational canon property: full system as ratio in factorisation form */
  super_ratio_fct?: number[]
}


