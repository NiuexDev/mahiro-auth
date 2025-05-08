import { execSync } from "child_process"
import { error, log, warn } from "console"
import { randomBytes } from "crypto"
import { mkdir, readFile, writeFile, access, constants, stat, rmdir, unlink, rename, copyFile, readdir, rm } from "fs/promises"
import ora from "ora"
import Path, { join } from "path"
import { parse as parseYaml } from "yaml"
import { tryCatch } from "~/util/try-catch"
import { Config } from "~/web/config"

let configBuilder: typeof import("~/web/config")

const assetsPath = "code/web/public/assets/"

export const pack = async (bunPathP?: string) => {
    log("正在打包...")
    configBuilder = await import(join(process.cwd(), "code/web/configBuilder.ts"))
    const config = parseYaml(await readFile("config.yml", "utf-8"))

    const spinner0 = ora({ text: '正在复制资源文件...', color: "green" })
    spinner0.start()
    if ((await tryCatch(access(assetsPath, constants.F_OK))).error === null) {
        await rm(assetsPath, { recursive: true, force: true })
    }
    await mkdir(assetsPath, { recursive: true })
    const webConfigFile = await transferConfig(config)
    await writeFile("code/web/config.ts", webConfigFile, "utf-8")
    spinner0.succeed("复制完成")
    spinner0.stop()

    const bunPath = bunPathP ?? process.argv[0]

    const spinner1 = ora({ text: '正在安装依赖...', color: "green" })
    spinner1.start()
    execSync(`${bunPath} install`, { cwd: "code/web" })
    spinner1.succeed("依赖安装完成")
    spinner1.stop()

    const spinner2 = ora({ text: '正在构建...', color: "cyan" })
    spinner2.start()
    execSync(`${bunPath} run build-only`, { cwd: "code/web" })
    spinner2.succeed("构建完成")
    spinner2.stop()

    try {
        await access("dist", constants.F_OK)
        const distDir = await stat("dist")
        if (distDir.isDirectory()) {
            await rmdir("dist", { recursive: true })
        }
        if (distDir.isFile()) {
            await unlink("dist")
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    await rename("code/web/dist", "dist")
}

const transferConfig = async (config: Config): Promise<string> => {
    const configStr = [] as string[]
    
    const configpath = [] as string[]
    const iterator = async (configitem: any) => {
        for (const configkey in configitem) {
            configpath.push(configkey)
            if (typeof configitem[configkey] === "object") {
                await iterator(configitem[configkey])
            }
            if (configBuilder.assetsConfigItem.includes(configpath.join("."))) {
                if (Array.isArray(configitem[configkey])) {
                    const pathList = [] as string[]
                    for await (const path of configitem[configkey]) {
                        if ((await tryCatch(access(path, constants.F_OK))).error !== null) {
                            warn(`${configpath.join(".")} 配置中，路径 ${path} 不存在，已忽略`)
                            continue
                        }
                        const stats = await stat(path)
                        if (stats.isDirectory()) {
                            const dir = await readdir(path)
                            for await (let file of dir) {
                                file = join(path, file)
                                if ((await tryCatch(access(file, constants.F_OK))).error !== null) continue
                                if ((await stat(file)).isFile()) {
                                    pathList.push(await moveFile(file))
                                }
                            }
                        }
                        if (stats.isFile()) {
                            pathList.push(await moveFile(path))
                        }
                    }
                    if (pathList.length === 0) {
                        configitem[configkey] = null
                    } else {
                        configitem[configkey] = pathList
                    }
                } else {
                    const path = configitem[configkey]
                    if ((await tryCatch(access(path, constants.F_OK))).error !== null) {
                        configitem[configkey] = null
                        warn(`${configpath.join(".")} 配置中，路径 ${path} 不存在，已忽略`)
                    } else if ((await stat(path)).isFile() === false) {
                        configitem[configkey] = null
                        warn(`${configpath.join(".")} 配置中，路径 ${path} 不是一个文件，已忽略`)
                    } else {
                        configitem[configkey] = await moveFile(path)
                    }
                }
            }
            configpath.pop()
        }
    }
    await iterator(config)

    // 导出 config
    configStr.push("export const config = " + JSON.stringify(config))
    // 导出 commitHash 和 shortCommitHash
    configStr.push("export const commitHash = " + JSON.stringify(configBuilder.commitHash))
    configStr.push("export const shortCommitHash = " + JSON.stringify(configBuilder.shortCommitHash))

    return configStr.join(";")
}

const filenameMap = new Map<string, string>()
const moveFile = async (filename: string): Promise<string> => {
    const fileSymbol = filenameMap.get(filename) 
    if (fileSymbol !== undefined) return fileSymbol
    
    const fileData = await readFile(filename)
    const symbol = new Bun.CryptoHasher("md5", ).update(fileData).digest("hex").slice(0, 8)
    const name = `${Path.parse(filename).name}-${symbol}${Path.parse(filename).ext}`
    await writeFile(join(assetsPath, name), fileData)
    const outFilename = join("/assets/", name)
    filenameMap.set(filename, outFilename)
    return outFilename
}