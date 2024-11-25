export type StrictOmit<T, K extends keyof T> = Omit<T, K>

export type Brand<T, B> = T & { readonly __brand__: B }
