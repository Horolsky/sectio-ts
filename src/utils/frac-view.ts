export const frac_inline = (
    frac: fraction, 
    force_sign = true, 
    proper = false,
    sep = '/'
    ) => {
    const sign = Math.sign(frac[0])*Math.sign(frac[1]);
    let result = sign < 0 
    ? '-'
    : force_sign
        ? '+'
        : '';
   
    if (!proper) {
        result+= `${Math.abs(frac[0])}${sep}${Math.abs(frac[1])}`
    }
    else {
        const int = Math.trunc(Math.abs(frac[0]) / Math.abs(frac[1]));
        const den = Math.abs(frac[0]) % Math.abs(frac[1]);
        result += `(${int}+(${den}${sep}${Math.abs(frac[1])}))`
    }
    return result
}
export const frac_html = (
    frac: fraction, 
    force_sign = true, 
    proper = false,
    sep = '/'
    ) => {
    const sign = Math.sign(frac[0])*Math.sign(frac[1]);
    let result = sign < 0 
    ? '-'
    : force_sign
        ? '+'
        : '';
    if (!proper) {
        result+= `<sup>${Math.abs(frac[0])}</sup>${sep}<sub>${Math.abs(frac[1])}</sub>`
    }
    else {
        const int = Math.trunc(Math.abs(frac[0]) / Math.abs(frac[1]));
        const den = Math.abs(frac[0]) % Math.abs(frac[1]);
        result += `${int}<sup>${den}</sup>${sep}<sub>${Math.abs(frac[1])}</sub>`
    }
    return result
}

export const frac_latex = (
    frac: fraction, 
    force_sign = true, 
    proper = false
    ) => {
    const sign = Math.sign(frac[0])*Math.sign(frac[1]);
    let result = sign < 0 
    ? '-'
    : force_sign
        ? '+'
        : '';
    if (!proper) {
        result+= `\\frac{${Math.abs(frac[0])}}{${Math.abs(frac[1])}}`
    }
    else {
        const int = Math.trunc(Math.abs(frac[0]) / Math.abs(frac[1]));
        const den = Math.abs(frac[0]) % Math.abs(frac[1]);
        result += `${int}\\frac{${den}}{${Math.abs(frac[1])}}`
    }
    return result
}