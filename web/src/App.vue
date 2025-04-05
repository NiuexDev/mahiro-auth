<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, type GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
    common: {
        borderRadius: '15px',
        primaryColor: '#65A018FF',
        primaryColorHover: '#87AD36FF',
        primaryColorPressed: '#4A7A0CFF',
        primaryColorSuppl: '#83AD36FF',

        inputColor: "transparent"
    }
}
</script>

<template>
    <n-config-provider class="container" :theme-overrides="themeOverrides">
        <n-message-provider>
            <RouterView />
        </n-message-provider>
    </n-config-provider>
</template>