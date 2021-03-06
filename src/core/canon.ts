import { put_to_sorted } from "../utils/object";
import { APPROX_PRIMES, S_COMMA } from "./constants";
import { decimal_to_fraction, is_int, round_12, valid_frac } from "./math";
import { factorize_float, factorize_int, fraction_to_euler, is_valid } from "./pfv-methods";
import Ratio from "./ratio";
import {get_ratio_map} from "./ratiomap";
import { get_tm_map } from "./tempmap";

const getEuler = (val: number | fraction): number => {
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
    comma: S_COMMA//Math.log2(81) - Math.log2(80),
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
  const name_set = new Set();
  const code_set = new Set();
  sections.forEach(section => {
    if (!is_int(section.id)) result_code *= 2;
    if (!is_int(section.parent)) result_code *= 3;
    if (typeof section.rtp != "number" && !valid_frac(section.rtp)) result_code *= 5;
    name_set.add(section.name);
    code_set.add(section.code);
    if (section.code.length > 3) result_code *= 7;
  });
  if (name_set.size != sections.length || code_set.size != sections.length) result_code *= 7;
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
    2: "undefined section id",
    3: "undefined section parent",
    5: "invalid rtio to parent",
    7: "invalid section namings",
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
const private_cache = new WeakMap();
const private_rmaps = new WeakMap();
const private_tmaps = new WeakMap();

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
    const error_code = check_schema_validity(data);
    if (error_code > 1) {
      throw Error(error_msg(error_code) + "\n" + JSON.stringify(data));
    }
    const size = data.sections.length;
    const period = data.params.period === null
      ? 0
      : getEuler(data.params.period)

    //SECTIONS CACHE
    const sections = data.sections;
    if (size == 0) {
      sections[0] = {
        id: 0,
        code: "??",
        name: "??",
        parent: NaN,
        rtp: 0
      } as section;
    }
    /** array */
    const id_set = new Set();
    /** id index to sections array */
    const s_index: section_index = { 0: sections[0] };
    for (let i = 0; i < size; i++){
      const id = sections[i].id;
      if (id >= 0) id_set.add(id);
      s_index[id] = sections[i];
      s_index[id].children = [];
    }
    if (id_set.size !=  size || s_index[0] == undefined) throw Error("corrupted sections tree");
    
    s_index[0].rtr = 0;
    const id_pool = Array.from(id_set) as number[];
    const queue = id_pool.splice(id_pool.indexOf(0),1);
    while (queue.length > 0){
      const id = queue.shift();
      for (let i = id_pool.length-1; i>=0; i--){
        const child = id_pool[i];
        if (s_index[child].parent == id){
          s_index[child].rtr = ((s_index[id].rtr as number) + getEuler(s_index[child].rtp)) % (period || Infinity);
          (s_index[id].children as number[]).push(child);
          queue.push(id_pool.splice(i, 1)[0]);
        }
      }
    }
    if (id_pool.length > 0) throw Error("corrupted sections tree");
    data.sections.sort((a, b) => a.id - b.id);//order is irrelevant to ratio
    private_data.set(this, { ...data, s_index });
    const rm = data.params.limit ? get_ratio_map(data.params.limit, data.params.range) : null;
    private_rmaps.set(this, rm);
    private_tmaps.set(this, get_tm_map(getEuler(data.params.comma)));

    //CANON CACHE
    const relations = new Array<Array<interval>>(size);
    
    /** interval dictionary */
    const intervals = { 
      0: {
        euler: 0,
        pairs: [], 
        ratio: new Ratio({2:0})
      } 
    } as intrv_dict;
    /** interval reference matrix */
    const intv_ref = new Array<Array<intrv_dict>>(size);
    for (let a = 0; a < size; a++) {
      relations[a] = new Array<interval>(size);
      relations[a][a] = intervals[0];

      intervals[0].pairs.push([sections[a].id, sections[a].id]);
      for (let b = 0; b < a; b++) {
        let recto = round_12(((sections[a].rtr as number) - (sections[b].rtr as number)) % (period || Infinity));
        if (recto < 0) recto = round_12(period + recto);
        const inverso = round_12(period - recto);
        
        intervals[recto] == undefined
          ? intervals[recto] = {
            euler: recto,
            pairs: [[sections[b].id, sections[a].id]],
            ratio: this.rationalize(recto)
          }
          : intervals[recto].pairs.push([sections[b].id, sections[a].id]);
        intervals[inverso] == undefined
          ? intervals[inverso] = {
            euler: inverso,
            pairs: [[sections[a].id, sections[b].id]],
            ratio: this.rationalize(inverso)
          }
          : intervals[inverso].pairs.push([sections[a].id, sections[b].id]);

        relations[b][a] = intervals[recto];
        relations[a][b] = intervals[inverso];
      }
    }
    private_cache.set(this, {
      relations,
      intervals
    });
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
  get tempmap() { return private_tmaps.get(this) }

  get data() { return private_data.get(this) }
  get cache() { return private_cache.get(this) }
  get relations() { return private_cache.get(this).relations as interval[][] }
  get intervals() { return private_cache.get(this).intervals as intrv_dict }
  get s_index() { return private_data.get(this)?.s_index as section_index }
  get size() {return private_data.get(this).sections.length }
  get_subtree(root: number) {
    /** all sections from an edited subtree */
    const subset = new Array<number>();
    const queue = new Array<number>();
    queue.push(root);
    while (queue.length > 0) {
      const s_id = queue.shift() as number;
      put_to_sorted(subset, s_id);
      (this.s_index[s_id].children as number[]).forEach(child => queue.push(child));
    }
    //subset duplicates test
    //possibly unnecessary
    if (subset.length > 1) {
      for (let i = 1; i < subset.length; i++) {
        if (subset[i] == subset[i - 1]) throw Error("corrupted sections hierarchy");
      }
    }
    return subset;
  }
  add_section({ name, code, parent = 0, rtp }: {
    name?: string,
    code?: string,
    parent?: number,
    rtp: number
  }) {
    //add new section
    if (rtp === undefined) return -1

    const data = private_data.get(this);
    const period = data.params.period === null
      ? 0
      : getEuler(data.params.period);
    const sections = data.sections as Array<section>;
    const index = data.s_index as section_index;
    const size = sections.length;
    const cache = private_cache.get(this);
    const relations = cache.relations as Array<Array<interval>>;
    const intervals = cache.intervals as intrv_dict;

    const parent_i = sections.findIndex(s => s.id == parent);
    if (parent_i < 0) throw Error("invalid parent id");
    const [new_id, new_i] = (() => {
      let id = sections[size - 1].id + 1;
      let i = parent_i;
      for (i; i < size - 1; i++) {
        if (sections[i + 1].id - sections[i].id > 1) {
          id = sections[i].id + 1;
          break;
        }
      }
      return [id, i + 1];
    })();
    if (sections.findIndex(s => s.id == new_id) >= 0) throw Error("sections order corrupted");
    //NEW SECTION PARAMS
    code = code
      ? sections.findIndex(s => s.code == code) < 0
        ? code
        : `${new_id}`
      : `${new_id}`

    name = name
      ? sections.findIndex(s => s.name == name) < 0
        ? name
        : code
      : code

    const rtr = ((index[parent].rtr as number) + rtp) % (period || Infinity);
    sections.splice(new_i, 0, {
      id: new_id,
      code,
      name,
      rtp,
      parent,
      rtr,
      children: []
    } as section);

    //INDEX REG
    index[new_id] = sections[new_i];
    //CACHE UPD
    relations.splice(new_i, 0, new Array<interval>(size));
    for (let a = 0; a < size + 1; a++) {
      let recto = round_12(rtr - (sections[a].rtr as number));
      if (recto < 0) recto = round_12(period + recto);
      const inverso = round_12(period - recto);
      
      intervals[recto] == undefined
        ? intervals[recto] = {
          euler: recto,
          pairs: [[ sections[a].id, new_id]],
          ratio: this.rationalize(recto)
        }
        : intervals[recto].pairs.push([sections[a].id, new_id]);
      intervals[inverso] == undefined 
        ? intervals[inverso] = {
          euler: inverso,
          pairs: [[new_id, sections[a].id]],
          ratio: this.rationalize(inverso)
        }
        : intervals[inverso].pairs.push([new_id, sections[a].id]);

      relations[a].splice(new_i, 0, intervals[recto]);
      relations[new_i][a] = intervals[inverso];
    }
    relations[new_i][new_i] = intervals[0];
    return new_id;
  }
  edit_section({ id, name, code, parent, rtp }: {
    id: number
    name?: string,
    code?: string,
    parent?: number,
    rtp?: number
  }) {
    const data = private_data.get(this);
    const sections = data.sections as Array<section>;
    const index = data.s_index as section_index;
    const cache = private_cache.get(this);
    const relations = cache.relations as Array<Array<interval>>;
    const intervals = cache.intervals as intrv_dict;
    const sec_i = sections.findIndex(s => s.id == id);
    if (sec_i < 0) return false;
    if (
      rtp === undefined &&
      parent === undefined &&
      name === undefined &&
      code === undefined
    ) return true;
    if (code != undefined || sections.findIndex(s => s.code == code) < 0) {
      index[id].code = code as string;
    }
    if (name != undefined || sections.findIndex(s => s.name == name) < 0) {
      index[id].name = name as string;
    }
    //relations update
    parent = parent ?? index[id].parent;
    rtp = rtp ?? getEuler(index[id].rtp);
    if (rtp != index[id].rtp || parent != index[id].parent) {
      const subtree = this.get_subtree(id);
      if (subtree.indexOf(parent) >= 0) return false;
      const period = data.params.period === null
      ? 0
      : getEuler(data.params.period);
      const size = sections.length;
      //REG UPD
      const old_parent = index[id].parent;
      const op_children = (index[old_parent].children as number[]);
      op_children.splice(op_children.indexOf(id), 1);
      (index[parent].children as number[]).push(id);
      index[id].parent = parent;
      index[id].rtp = rtp;
      const rtr = ((index[parent].rtr as number) + rtp) % (period || Infinity);
      index[id].rtr = rtr;

      //CACHE UPD
      for (let a = 0; a < sections.length; a++) {
        let recto = round_12(rtr - (sections[a].rtr as number));
        if (recto < 0) recto = round_12(period + recto);
        const inverso = round_12(period - recto);
        
        const old_recto = relations[a][sec_i].euler;
        const old_inverso = relations[sec_i][a].euler; 
        
        
        intervals[old_recto].pairs.splice(intervals[old_recto].pairs.findIndex(pair=>(pair as number[]).indexOf(id)>=0));
        intervals[old_inverso].pairs.splice(intervals[old_inverso].pairs.findIndex(pair=>pair.indexOf(id)>=0));
        
        intervals[recto] == undefined
          ? intervals[recto] = {
            euler: recto,
            pairs: [[ sections[a].id, id]],
            ratio: this.rationalize(recto)
          }
          : intervals[recto].pairs.push([sections[a].id, id]);
        intervals[inverso] == undefined 
          ? intervals[inverso] = {
            euler: inverso,
            pairs: [[id, sections[a].id]],
            ratio: this.rationalize(inverso)
          }
          : intervals[inverso].pairs.push([id, sections[a].id]);

        relations[a][sec_i] = intervals[recto];
        relations[sec_i][a] = intervals[inverso];
      }
      relations[sec_i][sec_i] = intervals[0];
    }
    return true;
  }
  delete_section(id: number) {
    const data = private_data.get(this);
    const sections = data.sections as Array<section>;
    const index = data.s_index as section_index;
    const cache = private_cache.get(this);
    const relations = cache.relations as Array<Array<interval>>;
    const intervals = cache.intervals as intrv_dict;
    const sec_i = sections.findIndex(s => s.id == id);
    if (sec_i < 0) return false;

    const subtree = this.get_subtree(id);
    for (let i = subtree.length - 1; i >= 0; i--) {
      const del_id = subtree[i];
      const del_i = sections.findIndex(s => s.id == del_id);
      //sections and index
      sections.splice(del_i, 1);
      delete index[subtree[i]];
      //interval map cleaning
      relations[del_i].forEach(intv => {
        for (let p = intv.pairs.length - 1; p >= 0; p--) {
          const pair = intv.pairs[p];
          if (pair.indexOf(del_id) >= 0) intv.pairs.splice(p, 1);
        }
        if (intv.pairs.length == 0) delete intervals[intv.euler];
      })
      //row deletion
      relations.splice(del_i, 1);
      //column deletion + inversion intervals
      for (let c = 0; c < relations.length; c++) {
        const inv = relations[c].splice(del_i, 1)[0];
        for (let p = inv.pairs.length - 1; p >= 0; p--) {
          const pair = inv.pairs[p];
          if (pair.indexOf(del_id) >= 0) inv.pairs.splice(p, 1);
        }
        if (inv.pairs.length == 0) delete intervals[inv.euler];
      }
    }
    return true;
  }
  drop_sections() {
    const data = private_data.get(this);
    const sections = data.sections as Array<section>;
    const index = data.s_index as section_index;
    const size = sections.length;
    sections.forEach(s => delete index[s.id]);
    sections.splice(1, size - 1);
    index[0] = sections[0];
    const intervals = { 0: {
      euler: 0,
      pairs: [[0, 0]],
      ratio: new Ratio({2: 0})
    } } as intrv_dict;
    private_cache.set(this, {
      relations: [[intervals[0]]],
      intervals
    });
    return 0;
  }
  update_params({ period, comma, range, limit }:{
    period?: number | fraction,
    comma?: number | fraction,
    range?: number,
    limit?: plimit | null 
  }) {
    
    const params = private_data.get(this).params as canon_params;
    //period = getEuler(period) ?? this.period;
    if (comma != undefined && typeof comma == "number" && comma > 0){
      params.comma = getEuler(comma);
    }
    if (period != undefined && this.size === 1){
      params.period = period;
    }
    if (range != undefined || limit != undefined){
      params.range = range ?? params.range; 
      params.limit = limit ?? params.limit;

      const rm = params.limit ? get_ratio_map(params.limit, params.range) : null;
      private_rmaps.set(this, rm);
      
      const intervals = private_cache.get(this).intervals as intrv_dict;
      for (const i in intervals){
        intervals[i].ratio = this.rationalize(intervals[i].euler);
      }
    }
  }
  update_info({ id, name, code, description, tags }:{
    id?: number,
    name?: string,
    code?: string,
    description?: string,
    tags?: string[]
  }) {
    const data = private_data.get(this);
    if (id != undefined && is_int(id)){
      data.id = id;
    }
    if (name != undefined && typeof name === "string"){
      data.name = name;
    }
    if (code != undefined && typeof code === "string"){
      data.code = code;
    }
    if (description != undefined && typeof description === "string"){
      data.description = description;
    }
    if (tags != undefined && Array.isArray(tags)){
      data.tags = tags;
    }
  }
  private rationalize(val: number | fraction) {
    return valid_frac(val)
      ? new Ratio(val)
      : this.limit
        ? new Ratio(this.ratiomap.approximate(val))
        : new Ratio(factorize_float(val ** 2, this.range))
  }
  /** print relation matrix in ratio form */
  print_relmt_r() {
    const mt = this.cache.relations as Array<Array<interval>>;
    return mt.map(row => row.map(r => {
      const ratio = r.ratio;
      const cell = `${ratio.frac[0]}:${ratio.frac[1]}${ratio.temperament != 0
        ? (ratio.temperament > 0 ? '+' : '-')
        + decimal_to_fraction(this.comma / Math.abs(ratio.temperament), 100).join('/')
        : ''
        }`;
      //cell = new Array(6 - cell.indexOf(':')).join(" ") + cell;
      //cell += new Array(12 - cell.length).join(" ");
      return cell;
    }).join("\t\t")
    ).join("\n")
  }
  /** print relation matrix in euler form */
  print_relmt_e() {
    const mt = this.cache.relations as Array<Array<interval>>;
    return mt.map(row => row.map(r => {
      const _r = `${r.euler.toFixed(6)}`;
      const L = _r.indexOf('.');
      const R = _r.length - L - 4;
      return new Array(4 - L).join(" ")
        + _r
        + new Array(8 - R).join(" ");
    }).join("")
    ).join("\n")
  }
}
