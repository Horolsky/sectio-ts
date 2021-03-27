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

const private_data = new WeakMap();
const private_rmaps = new WeakMap();
export default class Canon {
  
  constructor(schema: Optional<canon_schema>) {
    const data = { ...DEFAULT_SCHEMA, ...schema,  } as canon_schema;
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
