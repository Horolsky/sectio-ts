import {State, Mutation, Action, Getter} from 'vuex-simple';
import Vue from 'vue';
import { put_to_sorted } from "@/utils/object";
import { is_int, round_12, valid_frac } from "@/core/math";
import { factorize_float } from "@/core/pfv-methods";
import Ratio from "@/core/ratio";
import { get_ratio_map, RatioMap } from "@/core/ratiomap";
import { get_tm_map, TempMap } from "@/core/tempmap";
import { DEFAULT_SCHEMA, getEuler, check_schema_validity, error_msg } from './canon-helper';



export default class Canon {
  @State()
  readonly data: canon_schema;
  @State()
  readonly s_index: section_index;
  @State()
  public ratiomap?: RatioMap;
  @State()
  public tempmap: TempMap;
  @State()
  readonly relations: interval[][];
  @State()
  readonly intervals: intrv_dict;

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
        code: "Г",
        name: "Г",
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
    this.data = data;
    this.s_index = s_index;
    //private_data.set(this, { ...data, s_index });
    this.ratiomap = data.params.limit ? get_ratio_map(data.params.limit, data.params.range) : undefined;
    this.tempmap = get_tm_map(getEuler(data.params.comma));

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
    this.relations = relations;
    this.intervals = intervals;    
  }
  @Getter()
  get id() { return this.data.id }
  @Getter()
  get code() { return this.data.code }
  @Getter()
  get name() { return this.data.name }
  @Getter()
  get description() { return this.data.description }
  @Getter()
  get tags() { return this.data.tags.slice() }
  @Getter()
  get baseFreq() { return this.data.baseFreq }
  @Getter()
  get baseStrL() { return this.data.baseStrL }
  @Getter()
  get baseColor() { return this.data.baseColor }
  @Getter()
  get period() { return this.data.params.period }
  @Getter()
  get limit() { return this.data.params.limit }
  @Getter()
  get range() { return this.data.params.range }
  @Getter()
  get comma() { return this.data.params.comma }
  @Getter()
  get size() {return this.data.sections.length }
  @Mutation()
  add_section({ name, code, parent = 0, rtp }: {
    name?: string,
    code?: string,
    parent?: number,
    rtp: number
  }) {
    //add new section
    if (rtp === undefined) return -1

    const data = this.data;
    const period = data.params.period === null
      ? 0
      : getEuler(data.params.period);
    const sections = data.sections as Array<section>;
    const index = this.s_index as section_index;
    const size = sections.length;
    
    const relations = this.relations;// as Array<Array<interval>>;
    const intervals = this.intervals;// as intrv_dict;

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
        ? Vue.set(intervals, recto, {
          euler: recto,
          pairs: [[ sections[a].id, new_id]],
          ratio: this.rationalize(recto)
        })
        : intervals[recto].pairs.push([sections[a].id, new_id]);
      intervals[inverso] == undefined 
        ? Vue.set(intervals, inverso,  {
          euler: inverso,
          pairs: [[new_id, sections[a].id]],
          ratio: this.rationalize(inverso)
        })
        : intervals[inverso].pairs.push([new_id, sections[a].id]);

      relations[a].splice(new_i, 0, intervals[recto]);
      relations[new_i][a] = intervals[inverso];
    }
    relations[new_i][new_i] = intervals[0];
    return new_id;
  }
  @Mutation()
  edit_section({ id, name, code, parent, rtp }: {
    id: number
    name?: string,
    code?: string,
    parent?: number,
    rtp?: number
  }) {
    const data = this.data;
    const sections = data.sections as Array<section>;
    const index = this.s_index as section_index;
    
    const relations = this.relations as Array<Array<interval>>;
    const intervals = this.intervals as intrv_dict;
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
        if (intervals[old_recto].pairs.length == 0) Vue.delete(intervals, old_recto);
        if (intervals[old_inverso].pairs.length == 0) Vue.delete(intervals, old_inverso);


        intervals[recto] == undefined
          ? Vue.set(intervals, recto, {
            euler: recto,
            pairs: [[ sections[a].id, id]],
            ratio: this.rationalize(recto)
          })
          : intervals[recto].pairs.push([sections[a].id, id]);
        intervals[inverso] == undefined 
          ? Vue.set(intervals, inverso, {
            euler: inverso,
            pairs: [[id, sections[a].id]],
            ratio: this.rationalize(inverso)
          })
          : intervals[inverso].pairs.push([id, sections[a].id]);

        relations[a][sec_i] = intervals[recto];
        relations[sec_i][a] = intervals[inverso];
      }
      relations[sec_i][sec_i] = intervals[0];
    }
    return true;
  }
  @Mutation()
  delete_section(id: number) {
    const data = this.data;
    const sections = data.sections as Array<section>;
    const index = this.s_index as section_index;
    const relations = this.relations as Array<Array<interval>>;
    const intervals = this.intervals as intrv_dict;
    const sec_i = sections.findIndex(s => s.id == id);
    if (sec_i < 0) return false;

    const subtree = this.get_subtree(id);
    for (let i = subtree.length - 1; i >= 0; i--) {
      const del_id = subtree[i];
      const del_i = sections.findIndex(s => s.id == del_id);
      //sections and index
      sections.splice(del_i, 1);
      Vue.delete(index, subtree[i]);
      //interval map cleaning
      relations[del_i].forEach(intv => {
        for (let p = intv.pairs.length - 1; p >= 0; p--) {
          const pair = intv.pairs[p];
          if (pair.indexOf(del_id) >= 0) intv.pairs.splice(p, 1);
        }
        if (intv.pairs.length == 0) Vue.delete(intervals, intv.euler);
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
        if (inv.pairs.length == 0) Vue.delete(intervals, inv.euler);
      }
    }
    return true;
  }
  @Mutation()
  drop_sections() {
    const data = this.data;
    const sections = data.sections;
    const index = this.s_index;
    const size = sections.length;
    sections.forEach(s => delete index[s.id]);
    sections.splice(1, size - 1);
    index[0] = sections[0];
    //this.intervals = { 0: {
    //  euler: 0,
    //  pairs: [[0, 0]],
    //  ratio: new Ratio({2: 0})
    //} } as intrv_dict;
    //this.relations = [[intervals[0]]];
    //this.intervals = intervals;
    
    for (const k in this.intervals) k != '0' ? Vue.delete(this.intervals, k) : null;
    this.relations.splice(0, this.relations.length, [this.intervals[0]]);
    return 0;
  }
  @Mutation()
  update_params({ period, comma, range, limit }:{
    period?: number | fraction,
    comma?: number | fraction,
    range?: number,
    limit?: plimit | null 
  }) {
    
    const params = this.data.params;
    if (comma != undefined && typeof comma == "number" && comma > 0){
      params.comma = getEuler(comma);
    }
    if (period != undefined && this.size === 1){
      params.period = period;
    }
    if (range != undefined || limit != undefined){
      params.range = range ?? params.range; 
      params.limit = limit ?? params.limit;

      this.ratiomap = params.limit ? get_ratio_map(params.limit, params.range) : undefined;
      const intervals = this.intervals;
      for (const i in intervals){
        intervals[i].ratio = this.rationalize(intervals[i].euler);
      }
    }
  }
  @Mutation()
  update_info({ id, name, code, description, tags }:{
    id?: number,
    name?: string,
    code?: string,
    description?: string,
    tags?: string[]
  }) {
    const data = this.data;
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
  private rationalize(val: number | fraction) {
    return valid_frac(val)
      ? new Ratio(val)
      : this.ratiomap
        ? new Ratio(this.ratiomap.approximate(val))
        : new Ratio(factorize_float(val ** 2, this.range))
  }
}
