<template>
    <div class="container">
        <div class="box">
            <RouterView></RouterView>
        </div>
        <div class="toolbar">
            <DarkToggle/>
            <LangSelector :secondary="true"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
import LangSelector from "@/components/LangSelector.vue"
import DarkToggle from "@/components/DarkToggle.vue"
import { RouterView } from 'vue-router'
</script>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.box {
    width: min(320px, 100%);
    box-sizing: border-box;
    padding: 35px;
    box-shadow: 0 0 20px -5px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
}

@supports (backdrop-filter: blur(10px)) {
    .box {
        background-color: var(--card-bg-color);
        backdrop-filter: blur(10px);
    }
}
@supports not (backdrop-filter: blur(10px)) {
    .box {
        background-color: #fff;
    }
}

@media screen and (max-width: 520px) {
    .box {
        width: 100%;
        min-height: 100vh;
        padding: 35px 45px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border-radius: 0;
    }
}

.box :deep(h1) {
    color: var(--text-color);
    margin-bottom: 15px;
}

.box :deep(.submit) {
    margin-bottom: 17px;
}

.box :deep(.n-tabs-pane-wrapper) {
    padding-bottom: 2px;
}

:deep(.password input) {
    padding: 0 2px;
    letter-spacing: 0.1em;
}

.toolbar {
    position: absolute;
    top: 1.5em;
    right: 6vw;
    /* margin-top: 1em; */
    display: flex;
    flex-direction: row;
    justify-content: start;
    gap: 0.5em;
}
</style>