import { COMMA_RANGE, S_COMMA, TEMP_PREC } from "./constants";
import { decimal_to_fraction, is_int, round_12 } from "./math";

const private_props = new WeakMap();
const private_cache = new WeakMap();
const tm_cache = new Map<string, TempMap>();
type tm_data = {[key: number]: proper_frac};
export class TempMap {
    constructor(comma = S_COMMA, range = COMMA_RANGE) {
        if (comma > 0 && is_int(range) && range > 0) {
            private_props.set(this, { comma, range });
            private_cache.set(this, {});
        }
        else throw Error("negative arguments");
    }
    get comma() { return private_props.get(this).comma }
    get range() { return private_props.get(this).range }
    get_frac(euler: number): proper_frac {
        if (isNaN(euler)) throw Error("not a number");
        const map = private_cache.get(this) as tm_data;
        let record: proper_frac;
        if (euler in map) record = map[euler];
        else {
            const sgn = Math.sign(euler);
            const [num, den] = decimal_to_fraction(Math.abs(euler) / this.comma, this.range, TEMP_PREC);
            const int = Math.trunc(num/den);
            record = {sgn, int, num: num % den, den};
            map[euler] = record;
        }
        return record; 
    }
    get_html(euler: number) {
        const { sgn, int, num, den } = this.get_frac(euler);
        return num == 0 
            ? `${sgn > 0 ? '+' : '-'}${int || ''}`
            : `${sgn > 0 ? '+' : '-'}${int || ''}<sup>${num}</sup>/<sub>${den}</sub>`;
    }
}

export const get_tm_map = (comma = S_COMMA, range = COMMA_RANGE) => {
    if (!(comma > 0 && is_int(range) && range > 0)) throw Error("non integer arguments");

    const id = `TM-${range}-${comma}`;
    if (tm_cache.has(id)) {
        return tm_cache.get(id);
    }
    else {
        const tm = new TempMap(comma, range);
        tm_cache.set(id, tm);
        return tm;
    }
}