import { put_to_sorted } from "@/utils/object";
import { APPROX_PRIMES } from "./constants";
import { decimal_to_fraction, round_12, valid_frac } from "./math";
import { factorize_float, factorize_int, fraction_to_euler, is_valid } from "./pfv-methods";
import Ratio from "./ratio";
import RatioMap from "./ratiomap";

const getEuler = (val: number | fraction) => {
  return valid_frac(val)
    ? fraction_to_euler(val)
    : isNaN(val)
      ? 0 
      : val
}

export const DEFAULT_SCHEMA: canon_schema = {
  id: 0,
  name: "new",
  code: "new",
  description: "",
  tags: [],
  baseFreq: 300,
  baseStrL: 1200,
  baseColor: "#000000",
  params: {
    period: 1,
    limit: 5,
    range: 24,
    comma: Math.log2(81) - Math.log2(80),
  },
  sections: [],
};


/**
 * operates on sorted input
 * returns 1 if correct, else - returns prod of error codes (primes)
 */
export const check_sections_validity = (sections: Array<section>): number => {
  let result_code = 1;
  if (sections.length === 0) return result_code;
  if (sections[0].id != 0) result_code *= 2;//covers negats and non-zero roots
  sections.forEach((section, i) => {
    if (section.id === undefined) result_code *= 2;
    const same_id_i = sections.findIndex(el => el.id == section.id)
    if (same_id_i >= 0 && same_id_i < i) result_code *= 3;
    const parent_i = sections.findIndex(el => el.id == section.parent)
    if (parent_i >= 0 && parent_i >= i) result_code *= 5;
    if (section.parent === undefined) result_code *= 5;
    if (typeof section.rtp != "number" && !valid_frac(section.rtp)) result_code *= 7;
  });
  return result_code;
}
export const check_schema_validity = (schema: canon_schema) => {

  let result_code = check_sections_validity(schema.sections);

  if (
    typeof schema.params.period == "number"
    && schema.params.period < 0
  ) result_code *= 11;
  else if (
    typeof schema.params.period != "number"
    && !valid_frac(schema.params.period)
  ) result_code *= 11;

  if (typeof schema.params.comma != "number" || schema.params.comma < 0) result_code *= 13;
  if (typeof schema.params.range != "number" || schema.params.range < 0) result_code *= 17;
  if (APPROX_PRIMES.indexOf(schema.params.limit as number) < 0) result_code *= 19;

  return result_code;
}
const error_msg = (code: number) => {
  let msg = "";
  const ERROR: { [key: number]: string } = {
    2: "corrupted section id",
    3: "duplicate section ids",
    5: "corrupted parent hierarchy",
    7: "invalid section",
    11: "invalid period",
    13: "invalid comma euler",
    17: "invalid range",
    19: "invalid limit"
  };
  const code_primes = factorize_int(code);
  for (const p in code_primes) {
    msg += `\n${ERROR[p]}`;
  }
  return msg;
}

const private_data = new WeakMap();
const private_rtr_cache = new WeakMap();
const private_cache = new WeakMap();
const private_rmaps = new WeakMap();
export default class Canon {

  constructor(schema?: any) {
    //DATA VALIDATION
    if (schema != undefined && typeof schema == "object") {
      for (const key in schema) {
        if (!(key in DEFAULT_SCHEMA)) delete schema[key];
      }
      for (const key in schema.params) {
        if (!(key in DEFAULT_SCHEMA.params)) delete schema.params[key];
      }
      schema.params = { ...DEFAULT_SCHEMA.params, ...schema.params };
    }

    const data = { ...DEFAULT_SCHEMA, ...schema, } as canon_schema;
    data.sections.sort((a, b) => a.id - b.id);
    const error_code = check_schema_validity(data);
    if (error_code > 1) {
      throw Error(error_msg(error_code) + "\n" + JSON.stringify(data));
    }
    //CANON CACHE
    const size = data.sections.length;
    const period = data.params.period === null
      ? 0
      : getEuler(data.params.period)

    const rm = data.params.limit ? new RatioMap(data.params.limit, data.params.range) : null;
    if (rm) private_rmaps.set(this, rm);

    //SECTIONS CACHE
    const sections = data.sections;
    
    /** id index to sections array */
    const s_index: section_index = {0: sections[0]};
    s_index[0].rtr = 0;//root ratio to itself
    
    for (let i = 1; i < size; i++) {
      const sec = sections[i];
      s_index[sec.id] = sections[i];
      s_index[sec.id].rtr = getEuler(sec.rtp) + s_index[sec.parent].rtr;
      s_index[sec.parent].children 
        ? s_index[sec.parent].children?.push(sec.id)
        : s_index[sec.parent].children = [sec.id]; 
    }
    private_data.set(this, { ...data, s_index });

    const relations = new Array<Array<number>>(size); 
    const intervals = {0: []} as intrv_incendence; 
    
    for (let a = 0; a < size; a++) {
      relations[a] = new Array<number>(size);
      relations[a][a] = 0;
      intervals[0].push([sections[a].id,sections[a].id]);
      for (let b = 0; b < a; b++) {
        const recto = round_12((sections[a].rtr - sections[b].rtr) % period);
        const inverso = round_12(period - recto);
        relations[b][a] = recto;
        relations[a][b] = inverso;
        if(intervals[recto] == undefined) {
          intervals[recto] = new Array<number[]>();
          intervals[inverso] = new Array<number[]>();
        }
        intervals[recto].push([sections[b].id,sections[a].id]);
        intervals[inverso].push([sections[a].id,sections[b].id]);
      }
    }
    private_cache.set(this, { 
      relations,
      intervals
    });

    //update_cache(this, { root: 0, rtp: 0, parent: NaN });
  }
  get id() { return private_data.get(this).id }
  get code() { return private_data.get(this).code }
  get name() { return private_data.get(this).name }
  get description() { return private_data.get(this).description }
  get tags() { return private_data.get(this).tags.slice() }
  get baseFreq() { return private_data.get(this).baseFreq }
  get baseStrL() { return private_data.get(this).baseStrL }
  get baseColor() { return private_data.get(this).baseColor }
  get period() { return private_data.get(this).params.period }
  get limit() { return private_data.get(this).params.limit }
  get range() { return private_data.get(this).params.range }
  get comma() { return private_data.get(this).params.comma }

  get ratiomap() { return private_rmaps.get(this) }

  get data() { return private_data.get(this) }
  get cache() { return private_cache.get(this) }
  update_tree (
      /** root id of section subtree */
      root: number,
      /** new root ratio to parent */
      rtp?: number,
      /** new root parent */
      parent?: number
    ) {
      const data = private_data.get(this);
      const sections = data.sections as Array<section>;
      const index = data.s_index as section_index;
      const size = sections.length;
  
      /** all sections from an edited subtree */
      const subset = new Array<number>();
      const queue = new Array<number>();
      queue.push(root);
      while (queue.length > 0){
        const s_id = queue.shift() as number;
        put_to_sorted(subset, s_id);
        index[s_id].children?.forEach(child => queue.push(child));
      }
      //subset duplicates test
      //possibly unnecessary
      if (subset.length > 1){
        for (let i = 1; i < subset.length; i++){
          if (subset[i] == subset[i-1]) throw Error("corrupted sections hierarchy");
        }
      }
      const cache = private_cache.get(this);
      const relations = cache.relations as Array<Array<number>>;
      const intervals = cache.intervals as intrv_incendence;
      
      //do update
  }

  getRatio(val: number | fraction) {
    return valid_frac(val)
      ? new Ratio(val)
      : this.limit
        ? new Ratio(this.ratiomap.approximate(val))
        : new Ratio(factorize_float(val ** 2, this.range))
  }
  /** print relation matrix in ratio form */
  print_relmt_r() {
    const mt = this.cache.relations as Array<Array<number>>;
    return mt.map(row => row.map(r => {
      const ratio = this.getRatio(r);
      let cell = `${ratio.frac[0]}:${ratio.frac[1]}${
        ratio.temperament != 0
        ? (ratio.temperament > 0 ? '+' :'-') 
        + decimal_to_fraction(this.comma / Math.abs(ratio.temperament), 100).join('/')
        : ''
      }`;
      cell = new Array(6-cell.indexOf(':')).join(" ")+cell;
      cell += new Array(12-cell.length).join(" ");
      return cell;
    }).join("\t\t")
    ).join("\n")
  }
  /** print relation matrix in euler form */
  print_relmt_e() {
    const mt = this.cache.relations as Array<Array<number>>;
    return mt.map(row => row.map(r => {
      const _r = `${r.toFixed(6)}`;
      const L = _r.indexOf('.');
      const R = _r.length - L - 4;
      return new Array(4 - L).join(" ")
        + _r
        + new Array(8 - R).join(" ");
    }).join("")
    ).join("\n")
  }
}
