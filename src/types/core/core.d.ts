

/** 
 * approximaton prime limit
 * if undefined, will use fast approximation algo
 */
type plimit = 2 | 3 | 5 | 7 | 11 | 13 | 17;

//type fraction = [number, number];
type fraction = Tuple<number, 2>

type proper_frac = {sgn:number, int: number, num:number, den: number};
/** 
 * prime factorisation vector {key: prime, value: power}
 * temperament stored on p-2 value,
 * other values must be integer 
*/
type pfv = map_numeric

type rm_record = {
  /** log2 representation */
  readonly euler: number;
  /** prime factorisation */
  readonly fact: pfv
};
/** RatioMap jsonized data */
type rm_data = {
  ratios: rm_record[],
  limit: number,
  range: number,
  primes: number[]
};
/** canonic model parameters */
type canon_params = {
  /** p-limit of the system's rational approximation */
  limit: null | plimit,
  /** range of the system's rational approximation */
  range: number,
  /** periodic interval of the system */
  period: null | number | fraction,
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
  rtp: number | fraction,
  /** ratio to root section, internal cache */
  rtr?: number,
  /** children sections, internal cache */
  children?: number[]
}
/** gives access to section array by id */
type section_index = { [key: number]: section }

type section_cache = {
  [id: number]: {
    /** section's full name */
    name: string,
    /** section's short code */
    code: string,
    /** id of parent section */
    parent: number,
    /** ratio to parent section */
    rtp: number | Ratio,
    /** ratio to root section */
    rtr: number | Ratio
  }
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
/** canon interval record */
type interval = {
  euler: number
  pairs: number[][],
  ratio: Ratio
}
/** canon interval dictionary */
type intrv_dict = {
  [key: number]: interval
}

type canon_cache = {
  /** number of sections */
  size: number,
  /** dict with additional data */
  sections: section_cache,
  /** rational model (no temperament) */
  rational: boolean,
  /** complete adjacency matrix of sections relations */
  relations_mt: number[] | Ratio[],
  /** interval incedence list where values are list of sections id tuples*/
  interval_incedence: intrv_dict,
  /** heuristic property: ratiodict generated from ratiomap*/
  ratiodict?: ratio_dict,
  /** heuristic property: adjacency matrix of heuristic generator intervals */
  generators?: number[],
  /** heuristic property: list of factorisation primes for unlim approximations or rational systems */
  primes?: number[],
  /** rational canon property: full system as ratio in factorisation form */
  super_ratio_fct?: number[]
}


