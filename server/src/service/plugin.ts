import { log } from "console"

export const initPlugin = () => {

}

interface Plugin {
    name: string
    need: string[]
}[]

const getOrder = (plugin: Plugin[]) => {

    const setIndex = (name: string, index: number) => {
        if (order[name] === undefined) order[name] = {}
        order[name].index = index
    }
    const getIndex = (name: string) => {
        return order[name]?.index
    }
    const setLoop = (name: string, loop: 0|1) => {
        if (order[name] === undefined) order[name] = {}
        order[name].loop = loop
    }
    const getLoop = (name: string) => {
        return order[name]?.loop
    }

    const needMap: Record<string, string[]> = {}
    plugin.forEach(p => needMap[p.name] = p.need)
    
    const order: Record<string, { index?: number, loop?: 0|1 }> = {}

    const iterator = (name: string, path: string[]) => {
        const needList = needMap[name]
        if (needList.length === 0) {
            setIndex(name, 0)
        } else {
            let index = 0
            for (const needName of needList) {
                let needIndex = getIndex(needName)
                if (path.includes(needName)) {
                    setLoop(needName, 1)
                    needIndex = -1
                    setLoop(name, 0)
                } else {
                    if (needIndex === undefined) {
                        iterator(needName, [needName, ...path])
                        needIndex = getIndex(needName)
                    }
                }
                index = Math.max(index, needIndex!)
                if (getLoop(needName) === 1 || getLoop(needName) === 0) {
                    setLoop(name, 0)
                }
            }
            index = index + 1
            setIndex(name, index)
        }
    }

    for (const name in needMap) {
        iterator(name, [name])
    }
    return order
}