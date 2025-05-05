import { execSync } from "child_process"
import { log } from "console"
import { randomBytes } from "crypto"
import { mkdir, readFile, writeFile, access, constants, stat, rmdir, unlink, rename, copyFile } from "fs/promises"
import ora from "ora"
import path, { join } from "path"
import { parse as parseYaml } from "yaml"
import { Config } from "~/web/config"

export const pack = async (bunPathP?: string) => {
    log("正在打包...")
    const configYaml = await readFile("config.yml", "utf-8")
    const configTsData = await transferConfig(parseYaml(configYaml))
    await writeFile("code/web/config.ts", configTsData, "utf-8")

    const bunPath = bunPathP ?? process.argv[0]

    const spinner1 = ora({ text: '正在安装依赖...', color: "green" })
    spinner1.start()
    execSync(`${bunPath} install`, { cwd: "code/web" })
    spinner1.succeed("依赖安装完成")
    spinner1.stop()

    const spinner2 = ora({ text: '正在构建...', color: "cyan" })
    spinner2.start()
    execSync(`${bunPath} run build`, { cwd: "code/web" })
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

const assetsDir = "code/web/assets/"
const transferConfig = async (configYaml: string): Promise<string> => {
    const originalConfig = parseYaml(configYaml) as Config
    const configBuilder = await import(join(process.cwd(), "code/web/configBuilder.ts"))
    const configStr = [] as string[]
    // 导出 config
    configStr.push("export const config = " + JSON.stringify(originalConfig))
    // 导出 commitHash 和 shortCommitHash
    configStr.push("export const commitHash = " + JSON.stringify(configBuilder.commitHash))
    configStr.push("export const shortCommitHash = " + JSON.stringify(configBuilder.shortCommitHash))

    // 导出 iconUrl
    try {
        await access(originalConfig.meta.icon, constants.F_OK)
        const file = await stat(originalConfig.meta.icon)
        if (!file.isFile()) throw new Error()
        
        const targetPath = join(assetsDir, originalConfig.meta.icon)
        const target = path.parse(targetPath)
        await mkdir(target.dir, { recursive: true })
        await copyFile(originalConfig.meta.icon, targetPath)
        const symbol = getSymbol()
        configStr.push(`import ${symbol} from ` + "@/../" + join("assets/", originalConfig.meta.icon))
        configStr.push(`export const iconUrl = ${symbol}`)
    } catch (e) {
        configStr.push(`export const iconUrl = ""`)
    }





    return configStr.join(";")
}

const symbolMap = new Set<string>()
const getSymbol = (): string => {
    let symbol
    do {
        symbol = randomBytes(4).toString("hex")
    } while (symbolMap.has(symbol))
    symbolMap.add(symbol)
    return symbol
}