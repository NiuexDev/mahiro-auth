import { getArgv } from "@/service/cmd"
import { useBaseUrl } from "~/util/useBaseUrl"
export const dataPath = (()=>{
    let path = getArgv("data-dir") ?? "data"
    path = path.replace(/[/\\]+$/, "")
    path = path.replace(/^[/\\]+/, "")
    if (path.includes("\\") || path.includes("/") || path === "..") {
        console.error("数据目录不可为多层目录：" + path)
        process.exit(1)
    }
    if (path === "") {
        path = "."
    }
    return path
})()
export const useDataPath = (path: string) => {
    return useBaseUrl(dataPath, path)
}