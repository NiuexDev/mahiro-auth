<template>
    <h1>{{ $t('auth.login.title') }}</h1>
    <n-tabs animated :value="loginMethod">
        <n-tab-pane name="usePassword" display-directive="show">
            <n-form :model="formUsePassword" :rules="formUsePasswordRule" label-placement="top"
                :show-require-mark="false">

                <n-form-item path="account" :label="$t('auth.login.account')" first>
                    <n-input v-model:value="formUsePassword.account"
                        :placeholder="allowUsername ? $t('auth.login.usernameOrEmail', [$t('auth.login.username'), $t('auth.login.email')]) : $t('auth.login.email')" />
                </n-form-item>

                <n-form-item path="password" :label="$t('auth.login.password')" first>
                    <n-input class="password" v-model:value="formUsePassword.password" placeholder="" type="password" />
                </n-form-item>

                <n-flex class="submit" :size="12">
                    <n-button type="primary" secondary round style="flex: 1">{{ $t('auth.login.submit') }}</n-button>
                    <n-button secondary round
                        @click="toResetPasswordPage()">{{ $t('auth.login.forgotPassword') }}</n-button>
                </n-flex>

                <n-flex justify="start" :size="0">
                    <n-button text @click="changeLoginMethod('useCode')">{{ $t('auth.login.useCodeLogin') }}</n-button>
                    <div style="width: 12px;"></div>
                    <n-button text @click="toRegisterPage()">{{ $t('auth.register.title') }}</n-button>
                </n-flex>
            </n-form>
        </n-tab-pane>

        <n-tab-pane name="useCode" display-directive="show">
            <n-form :model="formUseCode" :rules="formUseCodeRule" label-placement="top" label-width="auto"
                label-align="left" :show-require-mark="false">

                <n-form-item path="account" :label="$t('auth.login.account')" first>
                    <n-input v-model:value="formUseCode.account" :placeholder="$t('auth.login.email')" />
                </n-form-item>

                <n-form-item path="code" :label="$t('auth.login.code')" first>
                    <n-flex :wrap="false" :size="12" style="width: 100%;">
                        <n-input v-model:value="formUseCode.code" placeholder="" :maxlength="vcodeLength" />
                        <n-button>{{ $t('auth.login.getCode') }}</n-button>
                    </n-flex>
                </n-form-item>


                <n-flex class="submit" :size="0">
                    <n-button type="primary" secondary round style="flex: 1">{{ $t('auth.login.submit') }}</n-button>
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
import { NForm, NFormItem, NInput, NButton, NFlex, type FormRules, NTabs, NTabPane } from 'naive-ui'
import { inject, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { config } from "@/../config"
import { vcodeLength } from "~/type/validator/vcode"

const router = useRouter()
const toResetPasswordPage = () => {
    router.push('/auth/reset-password')
}
const toRegisterPage = () => {
    router.replace('/auth/register')
}

type LoginMethod = 'usePassword' | 'useCode'
const loginMethod: Ref<LoginMethod> = ref('usePassword')
const changeLoginMethod = (method: LoginMethod): void => {
    loginMethod.value = method
    // if (!verifyEMailRegExp.test(formUsePassword.value.account)) return
    if (method === 'usePassword') {
        formUsePassword.value.account = formUseCode.value.account
        return
    }
    if (method === 'useCode') {
        formUseCode.value.account = formUsePassword.value.account
        return
    }
}

const allowUsername = config.allowUseUsernameLogin

const formUsePassword = ref({
    account: '',
    password: ''
})

const { t: i18n } = useI18n()
const formUsePasswordRule: FormRules = {
    account: [
        {
            required: true,
            message: i18n('auth.login.validator.Account-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        !allowUsername ? {
            validator(_rule, value) {
                // if (verifyEMailRegExp.test(value)) return true
                return false
            },
            message: i18n('auth.login.validator.Incorrect-Email-Format'),
            trigger: 'input'
        } : {}
    ],
    password: {
        required: true,
        message: i18n('auth.login.validator.Password-Should-Not-Be-Empty'),
        trigger: 'input'
    }
}

const formUseCode = ref({
    account: '',
    code: ''
})

const formUseCodeRule: FormRules = {
    account: [
        {
            required: true,
            message: i18n('auth.login.validator.Account-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            validator(_rule, value) {
                // if (verifyEMailRegExp.test(value)) return true
                return false
            },
            message: i18n('auth.login.validator.Incorrect-Email-Format'),
            trigger: 'input'
        }
    ],
    code: [
        {
            required: true,
            message: i18n('auth.login.validator.Code-Should-Not-Be-Empty'),
            trigger: 'input'
        },
        {
            validator(_rule, value: string) {
                // if (codeValidator.regexp.test(value) && value.length === codeValidator.length) return true
                return false
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

:deep(.n-tabs-pane-wrapper) {
    overflow: visible;
}

.n-tab-pane {
    padding: 0 !important;
    box-sizing: border-box
}
</style>