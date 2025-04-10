// 判断是否为直接子类
export const isDirectSubclass = (Child, Parent) =>
    Object.getPrototypeOf(Child) === Parent

// 判断是否为直接或间接子类（含自身）
export const isSubclass = (Child, Parent) =>
    Parent.isPrototypeOf(Child) || Child === Parent

// 判断是否为直接实例
export const isDirectInstance = (obj, Class) =>
    Object.getPrototypeOf(obj).constructor === Class

// 判断是否为直接或间接实例
export const isInstance = (obj, Class) =>
    obj instanceof Class