declare module "*.html" {
    const value: string
    export default value
}

interface Array<T>{
    includes(item: any): boolean
}