<template>
    <div class="container">
        
        <n-tabs class="box" animated :value="state">

            <n-tab-pane class="welcome" name="welcome" display-directive="show">
                <h1>欢迎使用{{ metadata?.title }}！</h1>
                <div class="info">
                    <p>在使用之前，需要进行一些初始化设置。您也可以先跳过，之后再设置。</p>
                    <p>这大约需要2分钟时间。让我们开始吧。</p>
                </div>
                <n-flex class="button" justify="end">
                    <n-button tertiary round @click="finish()">跳过</n-button>
                    <n-button type="primary" secondary round @click="start()">开始</n-button>
                </n-flex>
            </n-tab-pane>

            <n-tab-pane class="guide" name="guide" display-directive="show">
                <n-tabs animated :value="step">

                    <n-tab-pane :name="1" display-directive="show">
                        <h1>名称</h1>
                        <div class="info">
                            <p>设置你在MC中的ID。</p>
                            <p>应为4~6字符，只包含字母、数字以及下划线。</p>
                        </div>
                        <n-form-item :rule="idRule" :show-label="false" first>
                            <n-input v-model:value="id" placeholder="" />
                        </n-form-item>
                    </n-tab-pane>

                    <n-tab-pane :name="2" display-directive="show">
                        <h1>皮肤</h1>
                        <div class="info">
                            <p>设置你在MC中的皮肤</p>
                            <p>需要是64×64的png格式。</p>
                        </div>
                        <n-upload accept="image/png" :show-file-list="false">
                            <n-upload-dragger>
                                <div>
                                    <n-icon size="3em" :depth="5">
                                        <UploadRound />
                                    </n-icon>
                                </div>
                                点击或者拖动文件到该区域来上传
                            </n-upload-dragger>
                        </n-upload>

                        <skin-viewer />
                    </n-tab-pane>

                </n-tabs>

                <n-flex class="button" :size="12" justify="end">
                    <n-button tertiary round @click="prevStep()">上一步</n-button>
                    <n-button type="primary" secondary round @click="nextStep()">下一步</n-button>
                </n-flex>

            </n-tab-pane>

            
            <n-tab-pane class="end" name="end" display-directive="show">
                <h1>完成！</h1>
                <div class="info">
                    <p>现在您已经完成了设置，快开始试试{{ metadata?.title }}吧。</p>
                    <p>祝您使用愉快！</p>
                </div>
                <n-flex class="button" justify="end">
                    <n-button type="primary" secondary round @click="finish()">完成</n-button>
                </n-flex>
            </n-tab-pane>

        </n-tabs>

        <div class="bg"></div>
    </div>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue"
import { NTabPane, NTabs, NFlex, NButton, NInput, NFormItem, NUpload, NUploadDragger, NIcon, NText, type FormItemRule } from "naive-ui"
import { UploadRound } from "@vicons/material"
import { useRouter } from "vue-router"
// import SkinViewer from "@components/SkinViewer.vue"

import { useI18n } from "vue-i18n"
const { t } = useI18n()

import type { MetaData } from "@/types/MetaData"
const metadata = inject<MetaData>("metaData")

const router = useRouter()

const state = ref("welcome")

const start = () => {
    state.value = "guide"
}

const step = ref(1)


const finish = () => router.replace("/user")

const prevStep = () => {
    if (step.value <= 1) {
        state.value = "welcome"
        return
    }
    step.value--
}

const nextStep = () => {
    if (step.value >= 2) {
        state.value = "end"
        return
    }
    step.value++
}

const id = ref("")

const idRule: FormItemRule[] = [
    {
        validator() {
            console.log(id.value)
            if (id.value.length === 0) return false
        },
        message: "id不应为空",
        trigger: 'input'
    },
    {
        validator() {
            console.log(id.value)
            if (id.value.length === 0) return false
        },
        message: "id不应为空",
        trigger: 'input'
    }
]
</script>

<style scoped>
.container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(@assets/img/Girls_Band_Cry_KV2.webp);
    background-position: center;
    background-repeat: repeat-x;
    background-size: contain;
    z-index: -1;
}

.box {
    width: min(375px, 100%);
    overflow: hidden;
    box-sizing: border-box;
    padding: 40px 40px 40px 40px;
    box-shadow: 0 0 20px -5px rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    transition: box-shadow 200ms ease
}

@supports (backdrop-filter: blur(10px)) {
    .box {
        background-color: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
    }
}

@supports not (backdrop-filter: blur(10px)) {
    .box {
        background-color: #fff;
    }
}

.box:hover {
    box-shadow: 0 0 20px -5px rgba(0, 0, 0, 0.1);
}

:deep(.n-tab-pane) {
    padding: 0 5px !important;
    box-sizing: border-box
}

:deep(.n-tabs-nav) {
    display: none !important;
}

.welcome h1 {
    margin-bottom: 18px;
}

.welcome .button {
    margin-top: 16px;
}

.guide h1 {
    margin-bottom: 12px;
}

.guide .button {
    margin-top: 8px;
}

.guide .n-upload {
    padding: 8px 0;
}

.guide .n-upload-dragger {
    border-width: 2px;
    background-color: transparent
}

.end h1 {
    margin-bottom: 18px;
}

.end .button {
    margin-top: 16px;
}
</style>