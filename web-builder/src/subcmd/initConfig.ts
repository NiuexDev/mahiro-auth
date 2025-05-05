import { log, warn } from "console"
import { access, constants, stat, rmdir, unlink, writeFile } from "fs/promises"
import { join } from "path"
import { stringify as stringifyYaml } from "yaml"

export const initConfig = async (overwrite: boolean = false) => {
    log("正在初始化配置文件...")
    const configBuilder = await import(join(process.cwd(), "code/web/configBuilder.ts"))
    const config = configBuilder.createConfig()
    const configText = stringifyYaml(config)
    try {
        await access("config.yml", constants.F_OK)
        const a = await stat("config.yml")
        if (a.isDirectory()) {
            await rmdir("config.yml", { recursive: true })
        }
        if (a.isFile()) {
            if (overwrite) {
                await unlink("config.yml")
            } else {
                warn("config.yml 已经存在，如需要覆盖请使用\`--overwrite\`参数")
                process.exit(1)
            }
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    await writeFile("config.yml", configText)
    log("初始化完成")
}
