import { is_prime } from "./math";
const priv_data = new WeakMap();

/**
 * Prime Factorisation Vector Space
 */
export default class PFVS {
  constructor(primes: Array<number>) {
    const rank = primes.length;
    primes.sort();
    if (rank < 1) throw Error("cannot create 0-dim space");
    if (rank > 7) throw Error("maximum 7 dimensions allowed");
    primes.forEach((p, i) => {
      if (!is_prime(p))
        throw Error(`arguments contains non-prime numbers: ${p}`);
      if (primes.indexOf(p) != i) 
        throw Error(`arguments contains non-unique numbers: ${p}`);
    });

    const fold_vectors = new Array<number[]>(rank);

    for (let i = 0; i < rank; i++) {
      fold_vectors[i] = new Array<number>(rank).fill(1);
      let sum = 0;
      for (let j = 0; j < rank; j++) sum += j == i ? 0 : Math.log2(primes[j]);
      fold_vectors[i][i] = -sum / Math.log2(primes[i]);
    }
    const hyperplane = new Array<number>(rank + 1);
    const plane_mt = new Array<number[]>(rank);
    for (let i = 0; i < rank-1; i++) {
      plane_mt[i] = PFVS.v_sub(fold_vectors[i], fold_vectors[rank-1]);
    }
    plane_mt[rank-1] = new Array(rank);
    for (let i = 0; i < rank; i++) {
      plane_mt[rank-1].fill(0);
      plane_mt[rank-1][i] = 1;
      hyperplane[i] = PFVS.determinant(plane_mt);
    }
    hyperplane[rank] = -PFVS.dot_p(fold_vectors[rank-1], hyperplane.slice(0,rank));

    priv_data.set(this, {
      rank,
      primes: Object.freeze(primes),
      fold_vectors: Object.freeze(fold_vectors),
      hyperplane
    });
  }
  get rank() {
    return priv_data.get(this).rank;
  }
  get primes() {
    return priv_data.get(this).primes;
  }
  get fold_vectors() {
    return priv_data.get(this).fold_vectors;
  }
  /**
  * coefficients for rank-1 fold space equation
  * i. e. ax + by+ cz + d = 0;
  */
  get hyperplane() {
    return priv_data.get(this).hyperplane;
  }
  /**
   * x = -(by+cz+d)/a
   */

  static cross_p(A: number[], B: number[]) {
    if (A.length != B.length) throw Error("unequal vector dimensions");
    return A.map((a) => {
      let sum = 0;
      B.forEach((b) => (sum += a * b));
      return sum;
    });
  }
  static dot_p(A: number[], B: number[]) {
    if (A.length != B.length) throw Error("unequal vector dimensions");
    let sum = 0;
    A.forEach((a, i) => sum += a * B[i]);
    return sum;
  }
  static v_add(A: number[], B: number[]) {
    if (A.length != B.length) throw Error("unequal vector dimensions");
    return A.map((v, i) => v + B[i]);
  }
  static v_sub(A: number[], B: number[]) {
    if (A.length != B.length) throw Error("unequal vector dimensions");
    return A.map((v, i) => v - B[i]);
  }
  //src: https://stackoverflow.com/a/57696101
  /**
   * 
   * @param m matrix
   * @returns 
   */
  static determinant = (m: number[][]): number => {
    return m.length == 1
      ? m[0][0]
      : m.length == 2
      ? m[0][0] * m[1][1] - m[0][1] * m[1][0]
      : m[0].reduce(
          (r, e, i) =>
            r +
            (-1) ** (i + 2) *
              e *
              PFVS.determinant(
                m.slice(1).map((c) => c.filter((_, j) => i != j))
              ),
          0
        );
  };
}
