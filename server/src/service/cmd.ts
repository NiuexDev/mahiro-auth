import { version } from "@/../package.json"
import { commitHash } from "@/assets/commitHash"
import { get } from "http"

export const commandRunner = () => {
    const command = process.argv.slice(2).filter(arg => !arg.startsWith("-"))
    if (command.length > 0) {
        const argv = process.argv
        switch (command[0]) {
            case "version":
                showVersion()
                break
            default:
                cmdNotFind(argv)
        }
        process.exit(0)
    }
}

export const hasArgv = (name: string): boolean => {
    return process.argv.slice(2).includes("-"+name) || process.argv.slice(1).some(arg => new RegExp(`^-${name}=`).test(arg))
}

export const getArgv = (name: string): string | null => {
    const arg = process.argv.slice(2).find(arg => new RegExp(`^-${name}=`).test(arg))
    return arg?.slice(name.length + 2) ?? null
}

const showVersion = () => {
    console.log(`版本：${version}\n提交：${commitHash}`)
}

const cmdNotFind = (argv: string[]) => {
    console.log(`子命令 ${argv[2]} 不存在`)
}