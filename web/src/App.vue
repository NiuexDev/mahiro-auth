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

const style: StyleValue = config.assets.background === null ? {} : {
    backgroundImage: `url("${ config.assets.background[Math.floor(Math.random() * config.assets.background.length)] }")`
}
</script>

<template>
    <n-config-provider
    class="container"
    :theme-overrides="themeOverrides"
    inline-theme-disabled
    :style="style">
        <n-message-provider>
            <RouterView />
        </n-message-provider>
    </n-config-provider>
</template>

<style scoped>
.container {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url(@/assets/image/09.png) !important;
}
</style>