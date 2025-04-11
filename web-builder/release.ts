// @ts-nocheck
import { version } from "@/../package.json"
import { execSync } from "child_process"
import { log } from "console"
import { readFile, readdir, stat } from "fs/promises"
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
    const { data: releaseList } = await octokit.rest.repos.listReleases({
        owner: meta.owner,
        repo: meta.repo,
        page
    }) as {tag_name: string}[]
    
    
    preTagName = releaseList.find(({tag_name}) => tag_name.includes("web-builder-v"))?.tag_name
    page++
} while (preTagName === undefined)

let preVersion = preTagName
    .match(/web-builder-v(\d+\.\d+\.\d+)/)![1]
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

const tagName = "web-builder-v" + version

const changeLog = await readFile("./changelog.md", "utf-8")
const Mark = {
    start: "<!-- Unreleased -->",
    end: "<!--/ Unreleased -->"
}

const startIndex = changeLog.indexOf(Mark.start)
const endIndex = changeLog.indexOf(Mark.end)

const content = changeLog.substring(startIndex, endIndex).trim()

const response = await octokit.rest.repos.createRelease({
    owner: meta.owner,
    repo: meta.repo,
    tag_name: tagName,
    name: `Web Builder v${version}`,
    body: content,
    target_commitish: "main",
    draft: false,
    prerelease: false,
})

const release_id = response.data.id

const mimeType = 'application/octet-stream'

const fileData = await readFile(`./dist/web-builder.js`)
const fileInfo = await stat(`./dist/web-builder.js`)

await octokit.rest.repos.uploadReleaseAsset({
    owner: meta.owner,
    repo: meta.repo,
    release_id: release_id,
    name: "web-builder.js",
    headers: {
        'content-type': mimeType,
        'content-length': fileInfo.size,
    },
    data: fileData,
})