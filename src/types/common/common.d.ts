interface dict {
    [key: string]: any
}
type search_callback = function (any, any):number;

type Readonly<Type> = {readonly [key in keyof Type ]: Type[key]};
type Optional<Type> = {[key in keyof Type ]?: Type[key]};