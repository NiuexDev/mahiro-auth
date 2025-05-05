import { log, error } from "console"
import { readFile } from "fs/promises"
import { join } from "path"
import { parse as parseYaml } from "yaml"

export const verifyConfig = async () => {
    log("正在验证配置文件...")
    const configBuilder = await import(join(process.cwd(), "code/web/configBuilder.ts"))

    const data = await readFile("config.yml", "utf-8")
    const result = configBuilder.verifyConfig(parseYaml(data))
    if (result === true) {
        log("配置文件验证通过")
        return
    }
    result.forEach((result: any) => error(`配置项：\`${result.path}\` ${result.reason}，当前值：${JSON.stringify(result.value)}`)
    )
    error("配置文件验证失败")
    process.exit(1)
}
