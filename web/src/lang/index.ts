import { createI18n } from "vue-i18n"
import zhCN from "./zh-cn.json" assert { type: "json" }
import en from "./en.json" assert { type: "json" }

export const lang = {
    "zh-cn": zhCN,
    "en": en,
}

export const langList = (Object.keys(lang) as (keyof typeof lang)[]).map(key => ({ langKey: key, langName: lang[key].name }))

const i18n = createI18n({
    locale: localStorage.getItem("lang") || navigator.language?.toLocaleLowerCase(),
    fallbackLocale: "zh-cn",
    messages: lang,
    legacy: false,
})

export default i18n