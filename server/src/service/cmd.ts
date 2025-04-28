import { version } from "@/../package.json"

export const commandRunner = (argv: string[]) => {
    switch (argv[2]) {
        case "version":
            showVersion()
            break
        default:
            cmdNotFind(argv)
    }
}

const showVersion = () => {
    console.log(`版本：${version} 提交：${import.meta.env.longCommitHash}`)
}

const cmdNotFind = (argv: string[]) => {
    console.log(`子命令 ${argv[2]} 不存在`)
}