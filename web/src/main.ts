import "@/assets/css/main.css"

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

document.title = config.title
const description = document.createElement("meta")
description.setAttribute("name", "description")
description.setAttribute("content", config.description)
document.head.appendChild(description)

const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(pinia)
app.mount("body")