/**
 * immutable class for natural numbers combinations
 * creates a series of real numbers in a mixed-radix numeral system
 * and maps it to a given bounds inclusively
 */
 export default class PositionalCombos extends Array {
    /** upper inclusive position bounds */
    readonly upper_bounds: number[];
    /** lower inclusive position bounds */
    readonly lower_bounds: number[];
    /** radices (bound amplitudes) */
    readonly radices: number[];
    /** place values for positional numeral system */
    readonly place_values: number[];
    /**
     * each upper and lower bounds that give negat amplitude would be swapped
     * e. g. ([-1, 2], [3, -4]) => ([3, -1], [2, -4])
     * @param upper_bounds
     * @param lower_bounds zeros by default
     * @returns series of combos as a stepwise series of real numbers in a given bounds
     */
    constructor(
      upper_bounds: number[],
      lower_bounds: number[] = new Array(upper_bounds.length).fill(0)
    ) {
      if (upper_bounds.length != lower_bounds.length)
        throw new Error("unequal length of args");
      const W = upper_bounds.length;
      if (W === 0) throw Error("bounds must be non-empty");
      //normalizing bounds
      for (let i = 0; i < W; i++) {
        let swap: number;
        if (upper_bounds[i] < lower_bounds[i]) {
          swap = upper_bounds[i];
          upper_bounds[i] = lower_bounds[i];
          lower_bounds[i] = swap;
        }
      }
      const radices = upper_bounds.map((up, i) =>
        Math.abs(up - lower_bounds[i] + 1)
      );
      super(radices.reduce((a, b) => a * b, 1));
      this.upper_bounds = upper_bounds;
      this.lower_bounds = lower_bounds;
      this.radices = radices;
      //place_values
      this.place_values = new Array(W);
      this.place_values[W - 1] = radices[W - 1];
      for (let i = W - 2; i >= 0; i--)
        this.place_values[i] = radices[i] * this.place_values[i + 1];
      //first combo
      this[0] = lower_bounds.slice();
      //rightmost column
      for (let combo = 1; combo < this.length; combo++) {
        this[combo] = new Array<number>(W);
        this[combo][W - 1] = (combo % radices[W - 1]) + lower_bounds[W - 1];
      }
      //filling combos by position
      for (let position = W - 2; position >= 0; position--) {
        for (let combo = 1; combo < this.length; combo++) {
          const cycle = Math.floor(combo / this.place_values[position + 1]);
          this[combo][position] =
            (cycle % radices[position]) + lower_bounds[position];
        }
      }
      //freezing data
      for (let combo = 0; combo < this.length; combo++)
        Object.freeze(this[combo]);
      Object.freeze(this.upper_bounds);
      Object.freeze(this.lower_bounds);
      Object.freeze(this.radices);
      Object.freeze(this.place_values);
      Object.freeze(this);
    }
    get width() {
      return this.upper_bounds.length;
    }
  }