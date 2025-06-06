import "@/assets/css/main.css"
import iconUrl from "~/assets/icon.png"
import BgImage from "@/assets/image/09.png"

import { name, version } from "@/../package.json"
import { config, shortCommitHash } from "@/../config"
import { createApp } from "vue"
import App from "@/App.vue"
import router from "@/router"
import i18n from "@/lang"
import { createPinia } from "pinia"
import { logo } from "~/assets/text-logo"

const versionStr = `v${version} (${shortCommitHash})`
console.info(`\n${logo}\n\n${name + String().padEnd(logo.split("\n").at(-1)!.length-name.length-versionStr.length, " ") + versionStr}\n\n`)

// 设置标题
document.title = config.meta.title
// 设置介绍
const description = document.createElement("meta")
description.setAttribute("name", "description")
description.setAttribute("content", config.meta.description)
document.head.appendChild(description)
// 设置图标
const icon = document.createElement("link")
icon.setAttribute("rel", "icon")
icon.setAttribute("type", "image/x-icon")
icon.setAttribute("href", config.meta.icon ?? iconUrl)
document.head.appendChild(icon)
 
if (config.assets.background !== null) {
    document.body.style.backgroundImage = `url("${import.meta.env.MODE === "development" ? BgImage : config.assets.background[Math.floor(Math.random() * config.assets.background.length)]}")`
}

const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(pinia)
app.mount("body")