declare module "*.html" {
    const value: string
    export default value
}

interface Array<T> {
    includes(item: any): boolean
}

type AnyClass<T = any> = new (...args: any[]) => T

interface Function {
    isDirectSubclass: (potentialChild: any) => boolean
    isSubclass: (potentialDescendant: any) => boolean
    isDirectInstance: (potentialInstance: any) => boolean
    isInstance: (potentialInstance: any) => boolean
}