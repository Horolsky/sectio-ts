
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

export default {
    obj_not_array,
    deep_merge
}