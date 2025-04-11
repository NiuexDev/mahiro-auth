// 确保上面的实现注入代码已经执行过
// 1. isDirectSubclass (检查传入的是否是我的直接子类)
Object.defineProperty(Function.prototype, 'isDirectSubclass', {
    value: function (this: Function, potentialChild: any): boolean {
        // 必须是函数才能有原型继承关系
        if (typeof potentialChild !== 'function' || typeof this !== 'function') {
            return false
        }
        // 直接子类的 __proto__ (或者说 Object.getPrototypeOf) 应该等于父类
        return Object.getPrototypeOf(potentialChild) === this
    },
    writable: false, // 不可重写
    enumerable: false, // 不可枚举
    configurable: true // 允许未来可能删除或重新配置
})

// 2. isSubclass (检查传入的是否是我的子孙或我自己)
Object.defineProperty(Function.prototype, 'isSubclass', {
    value: function (this: Function, potentialDescendant: any): boolean {
        if (typeof potentialDescendant !== 'function' || typeof this !== 'function') {
            return false
        }
        // 使用 instanceof 检查原型链对于类是有效的
        // 或者 potentialDescendant 就是 this 自身
        // return potentialDescendant.prototype instanceof this || potentialDescendant === this;
        // 更严谨的检查类（构造函数）继承链
        let current = potentialDescendant
        while (current) {
            if (current === this) {
                return true
            }
            current = Object.getPrototypeOf(current)
            // 到达 Function.prototype 或 null 停止
            if (current === Function.prototype || !current) break
        }
        return false
    },
    writable: false,
    enumerable: false,
    configurable: true
})

// 3. isDirectInstance (检查实例是否由我直接创建)
Object.defineProperty(Function.prototype, 'isDirectInstance', {
    value: function (this: Function, potentialInstance: any): boolean {
        if (typeof this !== 'function' || potentialInstance == null) { // null 或 undefined
            return false
        }
        // 获取实例的原型
        const instanceProto = Object.getPrototypeOf(potentialInstance)
        // 处理 Object.create(null) 的情况
        if (instanceProto === null) {
            return false
        }
        // 实例的原型的 constructor 应该等于当前类
        return instanceProto.constructor === this
    },
    writable: false,
    enumerable: false,
    configurable: true
})

// 4. isInstance (检查实例是否是我或我子类的实例)
Object.defineProperty(Function.prototype, 'isInstance', {
    value: function (this: Function, potentialInstance: any): boolean {
        if (typeof this !== 'function') {
            // this 必须是构造函数/类
            return false
        }
        // instanceof 操作符正是用于检查这个关系的
        try {
            // instanceof 要求右侧必须是函数且有 prototype
            return potentialInstance instanceof this
        } catch (e) {
            // 如果 this 不是合法的构造函数（理论上不会，因为我们检查了 typeof），
            // 或者 potentialInstance 是原始类型等，instanceof 可能抛错
            return false
        }
    },
    writable: false,
    enumerable: false,
    configurable: true
})