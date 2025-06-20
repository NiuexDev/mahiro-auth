export type Enum<T extends Record<string, any>> = T[keyof T]
