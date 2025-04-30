<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, type GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
    common: {
        borderRadius: '15px',
        primaryColor: "rgba(101, 160, 24, 1)",
        primaryColorHover: "rgba(137, 174, 55, 1)",
        primaryColorPressed: 'rgba(74, 121, 12, 1)',
        primaryColorSuppl: 'rgba(133, 174, 55, 1)',

        inputColor: "transparent"
    }
}

</script>

<template>
    <n-config-provider class="container" :theme-overrides="themeOverrides" inline-theme-disabled>
        <n-message-provider>
            <RouterView />
        </n-message-provider>
    </n-config-provider>
</template>