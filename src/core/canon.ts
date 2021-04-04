import { APPROX_PRIMES } from "./constants";
import { valid_frac } from "./math";
import { factorize_int } from "./pfv-methods";
import RatioMap from "./ratiomap";

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
export const check_sections_validity = (sections: Array<section>):number => {
  let result_code = 1;
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
  if (APPROX_PRIMES.indexOf(schema.params.limit as number) < 0 ) result_code *= 19;

  return result_code;
}
const error_msg = (code: number) => {
  let msg = "";
  const ERROR: {[key: number]:string} = {
    2: "undefined section id",
    3: "duplicate section ids",
    5: "corrupted parent hierarchy",
    7: "invalid section",
    11: "invalid period",
    13: "invalid comma euler",
    17: "invalid range",
    19: "invalid limit"
  };
  const code_primes = factorize_int(code);
  for (const p in code_primes){
    msg += `\n${ERROR[p]}`;
  }
  return msg;
}


const private_data = new WeakMap();
const private_rmaps = new WeakMap();
export default class Canon {
  
  constructor(schema?: any) {
    if (schema != undefined && typeof schema == "object"){
      for (const key in schema){
        if (!(key in DEFAULT_SCHEMA)) delete schema[key];
      }
      for (const key in schema.params){
        if (!(key in DEFAULT_SCHEMA.params)) delete schema.params[key];
      }
      schema.params = {...DEFAULT_SCHEMA.params, ...schema.params};
    }

    const data = { ...DEFAULT_SCHEMA, ...schema,  } as canon_schema;
    
    const error_code = check_schema_validity(data);
    if (error_code > 1) {
      throw Error(error_msg(error_code)+"\n"+JSON.stringify(data));
    }
    
    private_data.set(this, data);
    if (data.params.limit) private_rmaps.set(this, new RatioMap(data.params.limit, data.params.range));
  }
  get id() {return private_data.get(this).id }
  get code() {return private_data.get(this).code }
  get name() {return private_data.get(this).name }
  get description() {return private_data.get(this).description }
  get tags() {return private_data.get(this).tags.slice() }
  get baseFreq() {return private_data.get(this).baseFreq }
  get baseStrL() {return private_data.get(this).baseStrL }
  get baseColor() {return private_data.get(this).baseColor }
  get period() {return private_data.get(this).params.period }
  get limit() {return private_data.get(this).params.limit }
  get range() {return private_data.get(this).params.range }
  get comma() {return private_data.get(this).params.comma }
  
  get ratiomap() {return private_rmaps.get(this) }
}
