<template>
    <h1>{{ $t('auth.register.title') }}</h1>
    <n-form ref="formRef" size="medium" :model="form" :rules="rule" label-placement="top" :show-require-mark="false">

        <n-form-item path="email" :label="$t('auth.register.email')" first>
            <n-input v-model:value="form.email" placeholder="请输入邮箱" />
        </n-form-item>

        <n-form-item path="vcode" :label="$t('auth.register.code')" first>
            <n-flex :wrap="false" :size="12" style="width: 100%;">
                <n-input v-model:value="form.vcode" placeholder="请输入验证码" :maxlength="vcodeLength"/>
                <n-button @click="sendVcode()">发送验证码</n-button>
            </n-flex>
        </n-form-item>

        <n-form-item path="password" :label="$t('auth.register.password')" first>
            <NPopover trigger="focus" placement="bottom" class="password-strength" :show-arrow="false" header-class="header" width="trigger">
                <template #trigger>
                    <n-input class="password" v-model:value="form.password" placeholder="请输入密码" show-password-on="click" type="password" :input-props="{ autocomplete: 'new-password' }"/>
                </template>
                <template #header>
                    <NIcon v-if="isStrongPasswd(form.password)" color="#4cbe17">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 12"><g fill="none"><path d="M9.765 3.205a.75.75 0 0 1 .03 1.06l-4.25 4.5a.75.75 0 0 1-1.075.015L2.22 6.53a.75.75 0 0 1 1.06-1.06l1.705 1.704l3.72-3.939a.75.75 0 0 1 1.06-.03z" fill="currentColor"></path></g></svg>
                    </NIcon>
                    <NIcon v-if="!isStrongPasswd(form.password)" color="#d1242f">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-2 -2 14 14"><g fill="none"><path d="M6 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM1 6a5 5 0 1 1 10 0A5 5 0 0 1 1 6z" fill="currentColor"></path></g></svg>
                    </NIcon>
                    <span>密码至少应有8个字符，且含有文字，或含有大写、小写字母、数字、特殊符号中三种</span>
                </template>
                <span v-for="tip in tiplist" class="tip">
                    <NIcon v-if="tip[0](form.password)" color="#4cbe17">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 12 12"><g fill="none"><path d="M9.765 3.205a.75.75 0 0 1 .03 1.06l-4.25 4.5a.75.75 0 0 1-1.075.015L2.22 6.53a.75.75 0 0 1 1.06-1.06l1.705 1.704l3.72-3.939a.75.75 0 0 1 1.06-.03z" fill="currentColor"></path></g></svg>
                    </NIcon>
                    <NIcon v-if="!tip[0](form.password)" color="#d1242f">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-2 -2 14 14"><g fill="none"><path d="M6 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM1 6a5 5 0 1 1 10 0A5 5 0 0 1 1 6z" fill="currentColor"></path></g></svg>
                    </NIcon>
                    <span class="text">{{ tip[1] }}</span>
                </span>
            </NPopover>
        </n-form-item>
        
        <n-flex class="submit" :size="12">
            <n-button @click="submit()" type="primary" secondary round style="flex: 1">{{ $t('auth.register.submit') }}</n-button>
        </n-flex>

        <n-button text @click="toLoginPage()">{{ $t('auth.login.title') }}</n-button>
    </n-form>
</template>

<script lang="ts" setup>
import { fetch } from "@/utils/fetch"
import { NButton, NFlex, NForm, NFormItem, NIcon, NInput, NPopover, useMessage, type FormRules } from 'naive-ui'
import { reactive, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getVcode } from "~/type/api/getvcode"
import { register } from "~/type/api/register"
import { isEamil } from "~/type/validator/email"
import { hasCharacter, hasLowerCase, hasNumber, hasSymbol, hasUpperCase, isStrongPasswd } from "~/type/validator/strong-passwd"
import { isVcode, vcodeLength } from "~/type/validator/vcode"
import { base64ToHex } from "~/util/base64ToHex"
import { tryCatch } from "~/util/try-catch"

const { t: i18n } = useI18n()
const router = useRouter()
const message = useMessage()


const toLoginPage = () => {
    router.replace('/auth/login')
}

const form = reactive({
    email: "",
    password: "",
    vcode: "",
    vcodeid: null as null | string,
})

const formRef = useTemplateRef("formRef")

const validateErrorMessage = (error: any[][] | undefined) => {
    error?.forEach(error => {
        message.warning(error[0].message)
    })
}

async function sendVcode() {
    await formRef.value?.validate(validateErrorMessage, (rule => rule?.key === "email"))
    const { error, data: res } = await tryCatch(fetch<
        getVcode.Request,
        getVcode.Response
    >(
        getVcode.endpoint,
        {
            email: form.email
        }
    ))
    if (error || res.state !== "success") {
        message.error("获取验证码失败！")
        return
    }
    form.vcodeid = base64ToHex(res.data.vcodeid)
    message.success("已发送验证码！")
}

async function submit() {
    if (form.vcodeid === null) {
        message.warning("请获取验证码")
        return
    }
    await formRef.value?.validate(validateErrorMessage)
    const { error, data: res } = await tryCatch(fetch<
        register.Request,
        register.Response
    >(
        register.endpoint,
        {
            email: form.email,
            password: form.password,
            vcode: form.vcode,
            vcodeid: form.vcodeid,
        }
    ))
    // const res = await(await fetch(useApiUrl("/register"), {
    //     method: "POST",
    //     headers: {
    //         // "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         email: form.email,
    //         password: form.password,
    //         codeid,
    //         code: form.code,
    //     })
    // })).json()
    // console.log(res)
    // if (res.state === "success") {
    //     message.success("注册成功！")
    // }
}

const rule: FormRules = {
    email: [
        {
            key: "email",
            required: true,
            message: i18n('auth.register.validator.Email-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            key: "email",
            validator(_rule, value) {
                return isEamil(value)
            },
            message: i18n('auth.register.validator.Incorrect-Email-Format'),
            trigger: 'input'
        }
    ],
    vcode: [
        {
            key: "vcode",
            required: true,
            message: i18n('auth.register.validator.Code-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            key: "vcode",
            validator(_rule, value) {
                return isVcode(value)
            },
            message: i18n('auth.register.validator.Incorrect-Code-Format'),
            trigger: 'input'
        }
    ],
    password: [
        {
            key: "password",
            required: true,
            message: i18n('auth.register.validator.Password-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            key: "password",
            validator(_rule, value) {
                console.log(value)
                return isStrongPasswd(value)
            },
            message: "密码安全性不足",
            trigger: 'input'
        },
        {
            key: "password",
            validator(_rule, value: string) {
                return value.length <= 32
            },
            message: "密码应在32字符内",
            trigger: 'input'
        }
    ]
}

const tiplist = [
    [hasUpperCase, "包含大写字母"],
    [hasLowerCase, "包含小写字母"],
    [hasNumber, "包含数字"],
    [hasSymbol, "包含特殊字符"],
    [hasCharacter, "包含文字"],
] as [(value: string)=>boolean, string][]
</script>

<style>
.password-strength {
    font-size: 12px;
}

.header, .tip {
    display: flex;
    align-items: center;
}

.password-strength .n-icon {
    animation: show  200ms ease-out;
}

.header .n-icon {
    margin-right: 0.5em;
}

.tip .n-icon {
    font-size: 0.8em;
    margin-right: 0.3em;
}

@keyframes show {
    0% {
        transform: scale(0.5);
        opacity: 0.5;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>