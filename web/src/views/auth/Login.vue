<template>
    <h1>{{ $t('auth.login.title') }}</h1>
    <n-tabs animated :value="loginMethod" ref="tab">
        <n-tab-pane name="usePassword" display-directive="show">
            <n-form :model="formUsePassword" :rules="formUsePasswordRule" label-placement="top" ref="formRefUsePassword"
                :show-require-mark="false">

                <n-form-item path="email" :label="$t('auth.login.account')" first>
                    <n-input v-model:value="formUsePassword.email"
                        :placeholder="$t('auth.login.email')" />
                </n-form-item>

                <n-form-item path="password" :label="$t('auth.login.password')" first>
                    <n-input class="password" v-model:value="formUsePassword.password" placeholder="" type="password" />
                </n-form-item>

                <n-flex class="submit" :size="12">
                    <n-button @click="submit()" type="primary" secondary round style="flex: 1">{{ $t('auth.login.submit') }}</n-button>
                    <n-button secondary round
                        @click="toResetPasswordPage()">{{ $t('auth.login.forgotPassword') }}</n-button>
                </n-flex>

                <n-flex justify="start" :size="0">
                    <n-button text @click="changeLoginMethod('useVcode')">{{ $t('auth.login.useCodeLogin') }}</n-button>
                    <div style="width: 12px;"></div>
                    <n-button text @click="toRegisterPage()">{{ $t('auth.register.title') }}</n-button>
                </n-flex>
            </n-form>
        </n-tab-pane>

        <n-tab-pane name="useVcode" display-directive="show">
            <n-form :model="formUseCode" :rules="formUseCodeRule" label-placement="top" label-width="auto" ref="formRefUseCode"
                label-align="left" :show-require-mark="false">

                <n-form-item path="email" :label="$t('auth.login.account')" first>
                    <n-input v-model:value="formUseCode.email" :placeholder="$t('auth.login.email')" />
                </n-form-item>

                <n-form-item path="vcode" :label="$t('auth.login.code')" first>
                    <n-flex :wrap="false" :size="12" style="width: 100%;">
                        <n-input v-model:value="formUseCode.vcode" placeholder="" :maxlength="vcodeLength" />
                        <n-button @click="sendVcode()">{{ getVcodeInterval ===  null ? "发送验证码" : getVcodeInterval+"秒后重试"}}</n-button>
                    </n-flex>
                </n-form-item>


                <n-flex class="submit" :size="0">
                    <n-button @click="submit()" type="primary" secondary round style="flex: 1">{{ $t('auth.login.submit') }}</n-button>
                </n-flex>

                <n-flex justify="start" :size="12">
                    <n-button text
                        @click="changeLoginMethod('usePassword')">{{ $t('auth.login.usePasswordLogin') }}</n-button>
                    <n-button text @click="toRegisterPage()">{{ $t('auth.register.title') }}</n-button>
                </n-flex>
            </n-form>
        </n-tab-pane>
    </n-tabs>

</template>

<script lang="ts" setup>
import { fetch } from "@/utils/fetch"
import { NButton, NFlex, NForm, NFormItem, NInput, NTabPane, NTabs, useMessage, type FormRules } from 'naive-ui'
import { onMounted, reactive, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { CommonAPI } from "~/type/api/common"
import { GetVcodeAPI } from "~/type/api/getvcode"
import { LoginAPI as LoginAPI } from "~/type/api/login"
import { isEamil } from "~/type/validator/email"
import { isVcode, vcodeLength } from "~/type/validator/vcode"
import { tryCatch } from "~/util/try-catch"
import { login } from "@/utils/login"

const tabRef = useTemplateRef("tab")
onMounted(() => {
    tabRef.value?.tabsPaneWrapperRef?.setAttribute("style", "")
})

const message = useMessage()
const { t: i18n } = useI18n()

const router = useRouter()
const toResetPasswordPage = () => {
    router.push('/auth/reset-password')
}
const toRegisterPage = () => {
    router.replace('/auth/signup')
}

type LoginMethod = 'usePassword' | 'useVcode'
const loginMethod = ref<LoginMethod>('usePassword')
const changeLoginMethod = (method: LoginMethod): void => {
    loginMethod.value = method
    if (method === 'usePassword') {
        formUsePassword.email = formUseCode.email
        return
    }
    if (method === 'useVcode') {
        formUseCode.email = formUsePassword.email
        return
    }
}

const validateErrorMessage = (error: any[][] | undefined) => {
    error?.forEach(error => {
        message.warning(error[0].message)
    })
}

let getVcodeInterval = ref<null | number>(null)

async function sendVcode() {
    if (getVcodeInterval.value !== null) {
        message.warning( "请等待"+getVcodeInterval.value+"秒后重试" )
        return
    }
    await formUseCodeRef.value?.validate(validateErrorMessage, (rule => rule?.key === "email"))
    const { error, data: res } = await tryCatch(fetch<
        GetVcodeAPI.Request,
        GetVcodeAPI.Response
    >(
        GetVcodeAPI.endpoint,
        {
            type: GetVcodeAPI.VcodeType.LOGIN,
            email: formUseCode.email
        }
    ))
    if (error || res.state === CommonAPI.ResponseStatus.ERROR) {
        message.error("获取验证码失败")
        return
    }
    if (res.state === CommonAPI.ResponseStatus.FAIL) {
        switch (res.type) {
            case GetVcodeAPI.FailType.USER_NOT_EXIST: {
                message.warning("该邮箱未注册")
                return
            }
            case GetVcodeAPI.FailType.REQUEST_TOO_FAST: {
                message.warning("获取验证码过于频繁，请稍后再试")
                return
            }
        }
    }
    if (res.state === CommonAPI.ResponseStatus.SUCCESS) {
        getVcodeInterval.value = 60
        const interval = setInterval(() => {
            if (getVcodeInterval.value === 0 || getVcodeInterval.value === null) {
                clearInterval(interval)
                return
            }
            getVcodeInterval.value!--
            if (getVcodeInterval.value === 0 || getVcodeInterval.value === null) {
                getVcodeInterval.value = null
                clearInterval(interval)
            }
        }, 1000)
        message.success("已发送验证码")
        return
    }
}

const submit = async () => {
    if (loginMethod.value === 'usePassword') {
        await formUsePasswordRef.value?.validate(validateErrorMessage)
    }
    if (loginMethod.value === 'useVcode') {
        await formUseCodeRef.value?.validate(validateErrorMessage)
    }
    const email = (() => {
        if (loginMethod.value === 'usePassword') {
            return formUsePassword.email
        }
        if (loginMethod.value === 'useVcode') {
            return formUseCode.email
        }
    })()!
    const { error, data: res } = await tryCatch(fetch<
        LoginAPI.Request,
        LoginAPI.Response
    >(
        LoginAPI.endpoint,
        {   
            type: (() => {
                if (loginMethod.value === 'usePassword') {
                    return LoginAPI.RequestType.PASSWD
                }
                if (loginMethod.value === 'useVcode') {
                    return LoginAPI.RequestType.VCODE
                }
            })()!,
            email,
            password: formUsePassword.password,
            vcode: formUseCode.vcode
        }
    ))
    if (error || res.state === CommonAPI.ResponseStatus.ERROR) {
        message.error("出现意外的错误")
        return
    }
    if (res.state === CommonAPI.ResponseStatus.FAIL) {
        switch (res.type) {
            case LoginAPI.FailType.USER_NOT_EXIST: {
                message.warning("该邮箱未注册")
                return
            }
            case LoginAPI.FailType.PASSWD_ERROR: {
                message.warning("密码错误")
                return
            }
            case LoginAPI.FailType.VCODE_ERROR: {
                message.warning("验证码错误")
                return
            }
        }
    }
    if (res.state === CommonAPI.ResponseStatus.SUCCESS) {
        login(res.data.session)
        message.success("登录成功")
        setTimeout(() => {
            router.push("/user")
        }, 1000)
        return
    }
}

const formUsePassword = reactive({
    email: '',
    password: ''
})

const formUsePasswordRef = useTemplateRef("formRefUsePassword")
const formUsePasswordRule: FormRules = {
    email: [
        {
            required: true,
            message: i18n('auth.login.validator.Account-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            validator(_rule, value) {
                return isEamil(value)
            },
            message: i18n('auth.login.validator.Incorrect-Email-Format'),
            trigger: 'input'
        }
    ],
    password: {
        required: true,
        message: i18n('auth.login.validator.Password-Should-Not-Be-Empty'),
        trigger: 'input'
    }
}

const formUseCode = reactive({
    email: '',
    vcode: ''
})

watch(() => formUseCode.email, () => {
    getVcodeInterval.value = null
})

const formUseCodeRef = useTemplateRef("formRefUseCode")
const formUseCodeRule: FormRules = {
    email: [
        {
            key: "email",
            required: true,
            message: i18n('auth.login.validator.Account-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            key: "email",
            validator(_rule, value) {
                return isEamil(value)
            },
            message: i18n('auth.login.validator.Incorrect-Email-Format'),
            trigger: 'input'
        }
    ],
    vcode: [
        {
            required: true,
            message: i18n('auth.login.validator.Code-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            validator(_rule, value: string) {
                return isVcode(value)
            },
            message: i18n('auth.login.validator.Incorrect-Code-Format'),
            trigger: 'input'
        }
    ]
}
</script>

<style scoped>
:deep(.n-tabs-nav) {
    display: none !important;
}

:deep(.n-tabs-pane-wrapper[style]) {
    overflow: hidden;
}

:deep(.n-tabs-pane-wrapper[style=""]) {
    overflow: visible;
}

.n-tab-pane {
    padding: 0 !important;
    box-sizing: border-box
}
</style>