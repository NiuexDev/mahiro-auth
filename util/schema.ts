import "~/util/class-instance"

export abstract class ValueValidator {
    abstract create(): any
    abstract verify(value: any): void | string
}

export class StringValidator extends ValueValidator {
    private value: string;
    private error: string;
    constructor(value: string = "", error: string = "须为字符串") {
        super()
        this.error = error
        this.value = value
    }
    create() {
        return this.value
    }
    verify(value: any) {
        if (typeof value !== "string") {
            return this.error
        }
    }
}

export class NumberValidator extends ValueValidator {
    private value: number;
    private error: string;
    constructor(value: number = 0, error: string = "须为数字") {
        super()
        this.value = value
        this.error = error
    }
    create() {
        return this.value
    }
    verify(value: any) {
        if (typeof value !== "number") {
            return this.error
        }
    }
}

export class BooleanValidator extends ValueValidator {
    private value: any;
    private error: string;
    constructor(value: boolean = true, error: string = "须为布尔值") {
        super()
        this.value = value
        this.error = error
    }
    create() {
        return this.value
    }
    verify(value: any) {
        if (typeof value !== "boolean") {
            return this.error
        }
    }
}

export class ArrayValidator extends ValueValidator {
    private value: any;
    private error: string;
    constructor(value: any[] = [], error: string = "须为数组") {
        super()
        this.value = value
        this.error = error
    }
    create() {
        return []
    }
    verify(value: any) {
        if (Array.isArray(value) === false) return this.error
    }
}

export class ObjectValidator extends ValueValidator {
    private value: any;
    private error: string;
    constructor(value: any = {}, error: string = "须为对象") {
        super()
        this.value = value
        this.error = error
    }
    create() {
        return {}
    }
    verify(value: any) {
        if (typeof value !== "object" || Array.isArray(value)) return this.error
    }
}

export interface Schema {
    [key: string]: Schema | ValueValidator | (Schema|ValueValidator)[]
}

export const verify = (obj: any, schema: Schema) => {
    if (typeof obj !== "object") throw new Error("须传入一个对象")

    const resultList: {path: string, value: any, reason: string}[] = []

    const path: string[] = []
    const iterator = (schema: any, obj: any) => {
        for (const key in schema) {
            path.push(key)
            if (obj[key] === undefined || obj[key] === null) {
                resultList.push({
                    path: path.join("."),
                    value: null,
                    reason: "不存在"
                })
            }
            else if (ValueValidator.isInstance(schema[key])) {
                const reason = (schema[key] as ValueValidator).verify(obj[key])
                if (reason) {
                    resultList.push({
                        path: path.join("."),
                        value: obj[key],
                        reason: reason
                    })
                }
            }
            else if (typeof schema[key] === "object" && typeof obj[key] === "object") {
            
                iterator(schema[key], obj[key])
            } else {
                resultList.push({
                    path: path.join("."),
                    value: obj[key],
                    reason: "类型错误"
                })
            }
            path.pop()
        }
    }

    iterator(schema, obj)

    if (resultList.length === 0) return true

    return resultList

}

export const create = <T>(schema: Schema): T  => {
    const obj = {}
    const iterator = (schema: any, obj: any) => {
        for (const key in schema) {
            if (ValueValidator.isInstance(schema[key])) {
                obj[key] = (schema[key] as ValueValidator).create()
            } else if (typeof schema[key] === "object") {
                if (Array.isArray(schema[key])) {
                    obj[key] = []
                } else {
                    obj[key] = {}
                }
                iterator(schema[key], obj[key])
            }
        }
    }
    iterator(schema, obj)
    return obj as T
}

export const fix = (obj: any, schema: Schema) => {
    if (typeof obj !== "object") throw new Error("须传入一个对象")
    const resultList: {path: string, value: any, reason: string}[] = []
    const path: string[] = []
    const iterator = (schema: any, obj: any) => {
        for (const key in schema) {
            path.push(key)
            if (obj[key] === undefined || obj[key] === null) {
                if (ValueValidator.isInstance(schema[key])) {
                    obj[key] = (schema[key] as ValueValidator).create()
                } else if (typeof schema[key] === "object") {
                    if (Array.isArray(schema[key])) {
                        obj[key] = []
                    } else {
                        obj[key] = {}
                    }
                    iterator(schema[key], obj[key])
                }
            }
            else if (ValueValidator.isInstance(schema[key])) {
                const reason = (schema[key] as ValueValidator).verify(obj[key])
                if (reason) {
                    resultList.push({
                        path: path.join("."),
                        value: obj[key],
                        reason: reason
                    })
                }
            }
            else if (typeof schema[key] === "object" && typeof obj[key] === "object") {
                iterator(schema[key], obj[key])
            } else {
                resultList.push({
                    path: path.join("."),
                    value: obj[key],
                    reason: "类型错误"
                })
            }
            path.pop()
        }
    }

    iterator(schema, obj)

    if (resultList.length === 0) return true

    return resultList
}
export const put = (obj: any, schema: Schema) => {
    if (typeof obj !== "object") throw new Error("须传入一个对象")

    const path: string[] = []
    const iterator = (schema: any, obj: any) => {
        for (const key in schema) {
            path.push(key)
            if (obj[key] === undefined || obj[key] === null) {
                if (ValueValidator.isInstance(schema[key])) {
                    obj[key] = (schema[key] as ValueValidator).create()
                } else if (typeof schema[key] === "object") {
                    if (Array.isArray(schema[key])) {
                        obj[key] = []
                    } else {
                        obj[key] = {}
                    }
                    iterator(schema[key], obj[key])
                }
            }
            else if (ValueValidator.isInstance(schema[key])) {
                const reason = (schema[key] as ValueValidator).verify(obj[key])
                if (reason) {
                    obj[key] = (schema[key] as ValueValidator).create()
                }
            }
            else if (typeof schema[key] === "object") {
                if (typeof obj[key] === "object") {
                    iterator(schema[key], obj[key])
                } else {
                    if (Array.isArray(schema[key])) {
                        obj[key] = []
                    } else {
                        obj[key] = {}
                    }
                    iterator(schema[key], obj[key])
                }
            }
            path.pop()
        }
    }

    iterator(schema, obj)

}