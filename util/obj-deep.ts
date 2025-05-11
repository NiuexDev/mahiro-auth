export const deepMerge = (target = {}, source = {}) => {
    target = deepClone(target)
    if (typeof target !== 'object' || typeof source !== 'object') throw new Error('parameters must be object')
    for (const prop in source) {
        if (!source.hasOwnProperty(prop)) continue
        if (prop in target) {
            if (typeof target[prop] !== 'object') {
                target[prop] = source[prop]
            } else {
                if (typeof source[prop] !== 'object') {
                    target[prop] = source[prop]
                } else {
                    if (target[prop].concat && source[prop].concat) {
                        target[prop] = target[prop].concat(source[prop])
                    } else {
                        target[prop] = deepMerge(target[prop], source[prop])
                    }
                }
            }
        } else {
            target[prop] = source[prop]
        }
    }
    return target
}

export const deepClone = (obj) => {
    // 对常见的“非”值，直接返回原来值
    if ([null, undefined, NaN, false].includes(obj)) return obj
    if (typeof obj !== 'object' && typeof obj !== 'function') {
        //原始类型直接返回
        return obj
    }
    var o = Array.isArray(obj) ? [] : {}
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            o[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i]
        }
    }
    return o
}