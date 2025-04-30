import { createI18n } from "vue-i18n"
import zhCN from "./zh-cn.json" assert { type: "json" }
import en from "./en.json" assert { type: "json" }

const formatLangCode = (lang: string) => {
    const knownLang = ["zh-CN", "zh-TW", "zh-UK", "zh", "en"]
    if (knownLang.includes(lang)) return lang.replace("-", "")
    return lang.split("-")[0]
}

let lang = formatLangCode(navigator.language)
const i18n = createI18n({
    locale: localStorage.getItem("lang") || lang,
    fallbackLocale: "zhCN",
    messages: {
        zhCN,
        zhTW: zhCN,
        zhUK: zhCN,
        zh: zhCN,
        en,
    },
    legacy: false,
})

export default i18n