import { createTransport } from "nodemailer"
import { Config, useConfig } from "@/service/config"
import { readFile } from "fs/promises"
import defaultTemplate from "@/assets/email_templa.html"
import { Logger } from "winston"
import { getLogger } from "@/service/logger"
import { load as loadHtml } from "cheerio"

let transporter: any
let config!: Config
let emailTemplate: { default: string; register: string; login: string; resetpasswd: string }
let logger: Logger

const safeReadFile = async (path: string) => {
    try {
        return (await readFile(path, "utf-8"))
    } catch (error) {
        return null
    }
}

const loadEmailTemplate = async() => {
    if (config.email.template.enable) {
        const path = config.email.template
        const a = await Promise.all([
            await safeReadFile(path.default),
            await safeReadFile(path.register),
            await safeReadFile(path.login),
            await safeReadFile(path.resetpasswd)
        ])
        return {
            default: a[0] ?? defaultTemplate,
            register: a[1] ?? a[0] ?? defaultTemplate,
            login: a[2] ?? a[0] ?? defaultTemplate,
            resetpasswd: a[3] ?? a[0] ?? defaultTemplate
        }
    } else {
        return {
            default: defaultTemplate,
            register: defaultTemplate,
            login: defaultTemplate,
            resetpasswd: defaultTemplate
        }
    }
}

export const initEmail = async () => {
    config = await useConfig()
    logger = await getLogger("email")
    transporter = createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
            user: config.email.username,
            pass: config.email.password,
        },
    })
    emailTemplate = await loadEmailTemplate()
    
}

const fillTemplate = (template: string, placeholders: { [key: string]: string }) => {
    return template.replaceAll(
        /\{\{([^}]+)\}\}/g,
        (raw, key) => {
            return placeholders[(key as string).trim()] ?? raw
    }
    )
}

export const sendEmail = async (title: string, content: string, to: string) => {
    await transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
        to: to,
        subject: title,
        html: content,
    })
}

const setting = {
    sitename: "まひろ验证",
    copyright: "版权所有"
}

type TemplateType = "default" | "register" | "login" | "resetpasswd"
export const sendTemplate = async (type: TemplateType, code: string, to: string) => {
    const html = loadHtml(
        fillTemplate(
            emailTemplate[type], {
                sitename: setting.sitename,
                code,
                copyright: setting.copyright
            }
        )
    )
    const title = html("title").text()
    const content = html("div").first().html()!
    await sendEmail(title, content, to)
}