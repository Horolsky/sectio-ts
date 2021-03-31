interface dict<KeyType, ValType> {
    [key: KeyType]: ValType
}
type map_numeric = {[key: number]: number}
type map_null = {[key: number]: number | null}

/** https://stackoverflow.com/a/59906630 */
type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
type Tuple<T extends any[]> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [Symbol.iterator]: () => IterableIterator< ArrayItems<T> > }

type search_callback = function (any, any):number;

type Readonly<Type> = {readonly [key in keyof Type ]: Type[key]};

type Optional<Type> = {[key in keyof Type ]?: Type[key]};
