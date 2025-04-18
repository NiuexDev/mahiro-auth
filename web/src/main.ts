import "@/assets/css/main.css"

import { name, version } from "@/../package.json"
import { createApp } from "vue"
import App from "@/App.vue"
import router from "@/router"
import i18n from "@/lang/init"
import { createPinia } from "pinia"
import { useMetaData } from "@/services/useMetaData"
import { logo } from "~/logo"

const versionStr = `v${version} (${import.meta.env.commitHash})`
console.info(`
${logo}

${name + String().padEnd(logo.split("\n").at(-1)!.length-name.length-versionStr.length, " ") + versionStr}

`)

const pinia = createPinia()

const app = createApp(App)

const metaData = await useMetaData()
app.provide("metaData", metaData)

document.title = metaData.title
const description = document.head.appendChild(document.createElement("meta"))
description.setAttribute("name", "description")
description.setAttribute("content", metaData.description)


app.use(router)
app.use(i18n)
app.use(pinia)

app.mount("body")