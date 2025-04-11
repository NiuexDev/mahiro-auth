declare module "*.html" {
    const value: string
    export default value
}

interface Array<T> {
    includes(item: any): boolean
}

// type AnyClass<T = any> = new (...args: any[]) => T
interface Function {
    /**
     * 检查传入的类是否是当前类的直接子类
     * @param this 调用此方法的类
     * @param potentialChild 可能的直接子类构造函数
     * @returns 如果 potentialChild 是 this 的直接子类，则返回 true，否则返回 false
     * @example
     * class A {}
     * class B extends A {}
     * A.isDirectSubclass(B) // true
     * A.isDirectSubclass(A) // false
     */
    isDirectSubclass(this: Function, potentialChild: any): boolean

    /**
     * 检查传入的类是否是当前类的子类（直接或间接），或者是当前类自身
     * @param this 调用此方法的类
     * @param potentialDescendant 可能的子类或自身构造函数
     * @returns 如果 potentialDescendant 是 this 的子类或就是 this，则返回 true，否则返回 false
     * @example
     * class A {}
     * class B extends A {}
     * class C extends B {}
     * A.isSubclass(C) // true
     * A.isSubclass(A) // true
     * C.isSubclass(A) // false
     */
    isSubclass(this: Function, potentialDescendant: any): boolean

    /**
     * 检查传入的对象是否是当前类直接构造的实例
     * @param this 调用此方法的类
     * @param potentialInstance 可能的直接实例对象
     * @returns 如果 potentialInstance 是由 this 直接构造的，则返回 true，否则返回 false
     * @example
     * class A {}
     * class B extends A {}
     * const a = new A()
     * const b = new B()
     * A.isDirectInstance(a) // true
     * A.isDirectInstance(b) // false
     */
    isDirectInstance(this: Function, potentialInstance: any): boolean

    /**
     * 检查传入的对象是否是当前类或其子类构造的实例
     * @param this 调用此方法的类
     * @param potentialInstance 可能的实例对象
     * @returns 如果 potentialInstance 是 this 或其子类的实例，则返回 true，否则返回 false
     * @example
     * class A {}
     * class B extends A {}
     * const a = new A()
     * const b = new B()
     * A.isInstance(a) // true
     * A.isInstance(b) // true
     * B.isInstance(a) // false
     */
    isInstance(this: Function, potentialInstance: any): boolean
}