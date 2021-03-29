interface dict<KeyType, ValType> {
    [key: KeyType]: ValType
}
type map_numeric = {[key: number]: number}
type map_null = {[key: number]: number | null}

type search_callback = function (any, any):number;

type Readonly<Type> = {readonly [key in keyof Type ]: Type[key]};

type Optional<Type> = {[key in keyof Type ]?: Type[key]};
