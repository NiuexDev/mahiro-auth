<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, type GlobalThemeOverrides } from 'naive-ui'
import type { StyleValue } from "vue"
import { config } from "@/../config"

const themeOverrides: GlobalThemeOverrides = {
    common: {
        borderRadius: '15px',
        primaryColor: "rgb(147, 187, 96)",
        primaryColorHover: "rgba(137, 174, 55, 1)",
        primaryColorPressed: 'rgba(74, 121, 12, 1)',
        primaryColorSuppl: 'rgba(133, 174, 55, 1)',

        inputColor: "transparent"
    }
}

const style: StyleValue = {
    backgroundImage: `url("${ config.assets.background === null ? "" : config.assets.background[Math.floor(Math.random() * config.assets.background.length)] }")`
}
</script>

<template>
    <n-config-provider class="container" :theme-overrides="themeOverrides" inline-theme-disabled>
        <n-message-provider>
            <RouterView />
        </n-message-provider>
    </n-config-provider>
    <div v-if="config.assets.background !== null" class="bg" :style="style"></div>
</template>

<style scoped>
.bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
</style>