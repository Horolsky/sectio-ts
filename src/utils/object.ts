
export function obj_not_array(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
export function deep_merge(target: any, ...sources: any): undefined {
    if (!sources.length) return target;
    const source = sources.shift();
    if (obj_not_array(target) && obj_not_array(source)) {
        for (const key in source) {
            if (obj_not_array(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deep_merge(target[key], source[key]);
            }
            else if (Array.isArray(source[key])) Object.assign(target, { [key]: source[key].slice() });
            else Object.assign(target, { [key]: source[key] });
        }
    }
    return deep_merge(target, ...sources);
}
/** insert element to sorted numeric or string array\
 *  binary search for insertion index
 *  return new index of inserted element */
export function put_to_sorted<Type>(
    target: Array<Type>, val: Type
    ):number {
    if (target.length == 0) {
        target.push(val);
        return 0;
    }
    if (typeof val != typeof target[0]) throw Error("incompactible types");
    let start = -1;
    let end = target.length;
    let mid: number;
    while (end - start > 1) {
        mid = start + Math.trunc((end - start) / 2);
        val > target[mid] ? start = mid : end = mid;
    }
    target.splice(end,0,val);
    return end;
}

export default {
    obj_not_array,
    deep_merge
}