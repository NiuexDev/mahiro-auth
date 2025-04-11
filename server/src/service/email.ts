import { createTransport } from "nodemailer"
import { Config, useConfig } from "@/service/config"
import { readFile } from "fs/promises"
import defaultTemplate from "@/assets/email_templa.html"

let transporter: any
let config!: Config

const initEmail = async () => {
    config = await useConfig()
    transporter = createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
            user: config.email.username,
            pass: config.email.password,
        },
    })
}

async function safeReadFile(path: string) {
    try {
        return (await readFile(path)).toString("utf-8")
    } catch (error) {
        return null
    }
}

const emailTemplate = await (async() => {
    if (config.email.template.enable) {
        const customDefault = await safeReadFile(config.email.template.default) || defaultTemplate
        const [customRegister, customLogin, customResetpasswd] = await Promise.all([
            await safeReadFile(config.email.template.register) || customDefault,
            await safeReadFile(config.email.template.login) || customDefault,
            await safeReadFile(config.email.template.resetpasswd) || customDefault
        ])
        return {
            customDefault,
            customRegister,
            customLogin,
            customResetpasswd
        }
    } else {
        return {
            customDefault: defaultTemplate,
            customRegister: defaultTemplate,
            customLogin: defaultTemplate,
            customResetpasswd: defaultTemplate
        }
    }
})()

export async function send(title: any, content: any, to: any) {
    const a = await transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
        to: to,
        subject: title,
        html: content,
    })
}

export async function sendRegister(code: string, to: string) {
    await send(
        "注册验证",
        emailTemplate.customRegister
            .replaceAll("{{sitename}}", "真寻验证")
            .replaceAll("{{code}}", code)
            .replaceAll("{{copyright}}", "版权所有"),
        to
    )
}
