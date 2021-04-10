import { APPROX_PRIMES, S_COMMA } from "../../core/constants";
import { is_int, valid_frac } from "../../core/math";
import {  factorize_int, fraction_to_euler } from "../../core/pfv-methods";

export const getEuler = (val: number | fraction): number => {
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
export const error_msg = (code: number) => {
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
