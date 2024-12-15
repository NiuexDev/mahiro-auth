import { createTransport } from "nodemailer"
import { useConfig } from "@/service/config"
import { readFile } from "fs/promises"

const config = await useConfig()
const transporter = createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
        user: config.email.username,
        pass: config.email.password,
    },
})

async function safeReadFile(path: string) {
    try {
        return (await readFile(path)).toString("utf-8")
    } catch (error) {
        return null
    }
}

const defaultTemplate = 
`
<div style="padding: 10px;font-family: sans-serif;">
    <div style="background: #fff;
        box-shadow: 0 5px 20px -5px rgba(0, 0, 0, 0.1);
        margin: 30px auto;
        padding: 0;
        width: 600px;
        border-radius: 10px;
        overflow: hidden;">
        <div style="background: linear-gradient(to right,#e9b6a5 15%, #eed7cc 80%);padding: 15px 50px;">
            <h1 style="color: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 1.5em;
            font-weight: normal;">邮箱验证 - {{sitename}}</h1>
        </div>
        <div style="padding: 35px 50px;">
            <div style="padding-bottom: 25px;margin: 0;">
                <p style="margin: 0; padding: 5px 0;">验证码：{{code}}，该验证码5分钟内有效。为了保障您的账户安全，请勿向他人泄漏验证码信息。</p>
            </div>
            <div style="margin: 0;padding-bottom: 5px;">{{copyright}}</div>
            <div>Powered by Mahiro Auth</div>
        </div>
    </div>
</div>
`

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
