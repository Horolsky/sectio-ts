/** bimary search for index of element with closest value */
export const bin_search = (
    arr: Array<any>, 
    val: any, 
    callback: search_callback
    ) => {
    let start = 0;
    let end = arr.length - 1;
    let mid: number;
    while (end - start > 1) {
        mid = start + Math.trunc((end - start) / 2);
        callback(val, arr[mid]) > 0 ? start = mid : end = mid;
    }
    return Math.abs(callback(val, arr[start])) < Math.abs(callback(val, arr[end])) ? start : end;
}
export const bin_search_appr = (arr:Array<number>, val:number) => {
    let start = 0;
    let end = arr.length - 1;
    let mid: number;
    while (end - start > 1) {
        mid = start + Math.trunc((end - start) / 2);
        val > arr[mid] ? start = mid : end = mid;
    }
    return Math.abs(val - arr[start]) < Math.abs(val - arr[end]) ? start : end;
}
export const bin_search_exact = (arr:Array<number>, val:number) => {
    let start = 0;
    let end = arr.length-1;
    let mid: number;
    while (end - start > 1) {
        mid = start + Math.trunc((end - start) / 2);
        val > arr[mid] ? start = mid : end = mid;
    }
    return val === arr[start] ? start : -1;
}
export default {
    bin_search_appr,
    bin_search
}