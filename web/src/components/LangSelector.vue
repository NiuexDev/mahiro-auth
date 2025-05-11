<script lang="ts" setup>
import i18n, { langList } from "@/lang"
import { NButton, NCard, NIcon, NModal, NScrollbar, useMessage } from "naive-ui"
import { ref } from "vue"

const modalShow = ref(false)

const message = useMessage()

const select = (lang: any) => {
    i18n.global.locale.value = lang.langKey
    localStorage.setItem("lang", lang.langKey)
    modalShow.value = false
    message.success("已切换为" + lang.langName)
}
</script>


<template>
    <NButton quaternary @click="modalShow = true" class="button">
        语言
        <template #icon>
            <NIcon size="0.8em">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M478.33 433.6l-90-218a22 22 0 0 0-40.67 0l-90 218a22 22 0 1 0 40.67 16.79L316.66 406h102.67l18.33 44.39A22 22 0 0 0 458 464a22 22 0 0 0 20.32-30.4zM334.83 362L368 281.65L401.17 362z" fill="currentColor"></path><path d="M267.84 342.92a22 22 0 0 0-4.89-30.7c-.2-.15-15-11.13-36.49-34.73c39.65-53.68 62.11-114.75 71.27-143.49H330a22 22 0 0 0 0-44H214V70a22 22 0 0 0-44 0v20H54a22 22 0 0 0 0 44h197.25c-9.52 26.95-27.05 69.5-53.79 108.36c-31.41-41.68-43.08-68.65-43.17-68.87a22 22 0 0 0-40.58 17c.58 1.38 14.55 34.23 52.86 83.93c.92 1.19 1.83 2.35 2.74 3.51c-39.24 44.35-77.74 71.86-93.85 80.74a22 22 0 1 0 21.07 38.63c2.16-1.18 48.6-26.89 101.63-85.59c22.52 24.08 38 35.44 38.93 36.1a22 22 0 0 0 30.75-4.9z" fill="currentColor"></path></svg>
            </NIcon>
        </template>
        <NModal
        :show="modalShow"
        transform-origin="center"
        @mask-click="modalShow = false"
        @esc="modalShow = false"
        :auto-focus="false">
            <div class="card">
                <h1>
                    选择语言
                    <NButton quaternary circle>
                        <template #icon>
                            <NIcon @click="modalShow = false">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><path d="M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4l6.6 6.6L8 22.6L9.4 24l6.6-6.6l6.6 6.6l1.4-1.4l-6.6-6.6L24 9.4z" fill="currentColor"></path></svg>
                            </NIcon>
                        </template>
                    </NButton>
                </h1>
                <div class="list-container">
                    <div class="list">
                        <p v-for="lang in langList" @click="select(lang)">{{ lang.langName }}</p>
                    </div>
                </div>
            </div>
        </NModal>
    </NButton>
</template>


<style scoped>
.button {
    margin: 0 -6px;
}
.card {
    display: inline-block;
    min-width: 160px;
    box-sizing: border-box;
    width: unset;
    border-radius: 20px;
    background-color: var(--card-bg-color);
    overflow: hidden;
    font-size: 14px;
}

h1 {
    font-size: 1.1em;
    padding: 18px 14px 10px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.list-container {
    max-height: min(120px, 100vh);
    overflow-y: auto;
    scrollbar-width: none;
}
.list::-webkit-scrollbar {
    display: none;
    width: 0;
}

.list {
    display: flex;
    flex-direction: column;
    padding-bottom: 14px;
    gap: 4px;
}

.list p {
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 15px;
    margin: 0 8px;
    padding: 8px 20px;
    transition: all 200ms ease;
}

.list p:hover {
    background-color: var(--button-hover-color);
}
</style>