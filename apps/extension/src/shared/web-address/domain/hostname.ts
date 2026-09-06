declare const hostnameBrand: unique symbol;

export type Hostname = string & { readonly [hostnameBrand]: true };
