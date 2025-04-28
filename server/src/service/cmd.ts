import { version } from "@/../package.json"

export const commandRunner = () => {
    if (process.argv.length > 2) {
        const argv = process.argv
        switch (argv[2]) {
            case "version":
                showVersion()
                break
            default:
                cmdNotFind(argv)
        }
        process.exit(0)
    }
}

const showVersion = () => {
    console.log(`版本：${version} 提交：${import.meta.env.longCommitHash}`)
}

const cmdNotFind = (argv: string[]) => {
    console.log(`子命令 ${argv[2]} 不存在`)
}