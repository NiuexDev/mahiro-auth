// import deepcopy from "deepcopy"

// export function mergeObject<T>(originObject: any, templateObject: T) {
//     const newObject = Array.isArray(templateObject) ? [] : {}
//     const modified = iterator(newObject, originObject, templateObject)
//     return {
//         object: newObject as T,
//         modified
//     }
    
//     function iterator(newObject: any, originObject: any, templateObject: any): boolean {
//         let modified = false
//         for (const key in templateObject) {
//             if (originObject[key] === undefined || originObject[key] === null) {
//                 newObject[key] = deepcopy(templateObject[key])
//                 modified = true
//             } else if (typeof originObject[key] === "object") {
//                 if (typeof templateObject[key] === "object") {
//                     if (Array.isArray(originObject[key])) {
//                         if (Array.isArray(templateObject[key])) {
//                             newObject[key] = []
//                             if (iterator(newObject[key], originObject[key], templateObject[key])) modified = true
//                         } else {
//                             newObject[key] = deepcopy(templateObject[key])
//                             modified = true
//                         }
//                     } else {
//                         if (Array.isArray(templateObject[key])) {
//                             newObject[key] = deepcopy(templateObject[key])
//                             modified = true
//                         } else {
//                             newObject[key] = {}
//                             if (iterator(newObject[key], originObject[key], templateObject[key])) modified = true
//                         }
//                     }
//                 } else {
//                     newObject[key] = deepcopy(originObject[key])
//                 }
//             } else {
//                 if (typeof templateObject[key] === "object") {
//                     newObject[key] = deepcopy(templateObject[key])
//                     modified = true
//                 } else {
//                     newObject[key] = deepcopy(originObject[key])
//                 }
//             }
//         }
//         return modified
//     }
// }