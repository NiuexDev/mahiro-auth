import { createI18n } from "vue-i18n"
import zhCN from "./zh-cn.json" assert { type: "json" }
import en from "./en.json" assert { type: "json" }

const i18n = createI18n({
    locale: localStorage.getItem("lang") || navigator.language?.toLocaleLowerCase(),
    fallbackLocale: "zh-cn",
    messages: {
        "zh-cn": zhCN,
        "en": en,
    },
    legacy: false,
})

export default i18n