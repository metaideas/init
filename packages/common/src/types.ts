export type StrictOmit<T, K extends keyof T> = Omit<T, K>

declare const __brand: unique symbol

export type Brand<K, T> = K & { readonly [__brand]: T }
