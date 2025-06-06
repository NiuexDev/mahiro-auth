<script setup lang="ts">
import { config } from "@/../config"
import { mode } from "@/stores/darkMode"
import { darkTheme, NConfigProvider, NMessageProvider, type GlobalThemeOverrides, NThemeEditor } from 'naive-ui'
import { RouterView } from 'vue-router'
import { deepMerge } from "~/util/obj-deep"

const common = {
    color: "rgb(147, 187, 96)",
    colorHover: "rgb(137, 174, 55)",
    colorPressed: 'rgb(74, 121, 12)',
    colorSuppl: 'rgb(133, 174, 55)',
}

const customTheme: GlobalThemeOverrides = {
    common: {
        borderRadius: '15px',
        primaryColor: common.color,
        primaryColorHover: common.colorHover,
        primaryColorPressed: common.colorPressed,
        primaryColorSuppl: common.colorSuppl,

        successColor: common.color,
        successColorHover: common.colorHover,
        successColorPressed: common.colorPressed,
        successColorSuppl: common.colorSuppl,
    },
}

const customLightTheme = deepMerge(customTheme, {
    common: {
        inputColor: "transparent",
        
        popoverColor: "rgb(255, 255, 255)"
    },
})

const customDarkTheme = deepMerge(customTheme, {
    common: {        
        popoverColor: "rgb(65, 65, 65)"
    },
})
</script>

<template>
    <n-config-provider
    :style="{ backgroundColor: mode === 'dark' ? config.ui.bgColor.dark : config.ui.bgColor.light }"
    class="container"
    :theme="mode === 'dark' ? darkTheme : null"
    :theme-overrides="mode === 'dark' ? customDarkTheme : customLightTheme"
    inline-theme-disabled>
        <!-- <n-theme-editor> -->
            <n-message-provider>
                <RouterView />
            </n-message-provider>
        <!-- </n-theme-editor> -->
    </n-config-provider>
</template>