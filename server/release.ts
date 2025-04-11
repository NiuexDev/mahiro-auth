import { version } from "@/../package.json"
import { execSync } from "child_process"
import { log } from "console"
import { readFile } from "fs/promises"
import { Octokit } from "octokit"

const meta = {
    owner: "NiuexDev",
    repo: "mahiro-auth",
}

const githubToken = process.env.GITHUB_TOKEN
if (!githubToken) {
    console.error("GITHUB_TOKEN 缺失！")
    process.exit(1)
}

const octokit = new Octokit({
    auth: githubToken
})

let preTagName = undefined
let page = 1
do {
    const releaseList = await octokit.rest.repos.listReleases({
        owner: meta.owner,
        repo: meta.repo,
        page
    }) as {tag_name: string}[]
    
    preTagName = releaseList.find(({tag_name}) => tag_name.includes("server"))?.tag_name
    page++
    // tagName
} while (preTagName === undefined)

let preVersion = preTagName
    .match(/server-v(\d+\.\d+\.\d+)/)![1]
    .split(".")
    .map(n => {
        return Number(n)
    })

const currentVersion = version.split(".").map(n => {
    return Number(n)
})

const a = (b, c) => b.some((v, i) => v > c[i])

const isUpdate = currentVersion.some((v, i) => v > preVersion[i])
if (!isUpdate) {
    console.log("版本无变化")
    console.log(`pre: ${preTagName}, now: ${version}`)
    process.exit(0)
}

const tagName = "server-v" + version

const changeLog = await readFile("./changelog.md", "utf-8")

const response = await octokit.rest.repos.createRelease({
    owner: meta.owner,
    repo: meta.repo,
    tag_name: tagName,          // 这个 tag 会被创建（如果不存在）并关联到 target_commitish
    name: `Server v${version}`,
    body: changeLog,
    target_commitish: "main", // 指定 tag 指向哪个 commit/branch
    draft: false,               // false = 直接发布, true = 创建为草稿
    prerelease: false,           // false = 正式版, true = 预发布版
})