<script lang="ts" setup>
import { selectedMode, toggle } from "@/stores/darkMode"
import { AutoAwesomeRound, DarkModeRound, LightModeFilled } from "@vicons/material"
import { NButton, NIcon } from "naive-ui"

</script>


<template>
    <NButton quaternary circle @click="toggle()">
        <Transition name="animation" mode="out-in">
            <NIcon size="1em" v-if="selectedMode === 'light'" :component="LightModeFilled"/>
            <NIcon size="0.8em" v-else-if="selectedMode === 'dark'" :component="DarkModeRound"/>
            <NIcon v-else-if="selectedMode === 'auto'" :component="AutoAwesomeRound" />
        </Transition>
    </NButton>
</template>


<style scoped>
.n-button .n-icon {
    transition: all 200ms ease;
}
.n-button:active .n-icon {
    transform: scale(0.85);
    opacity: 0.6;
}

.animation-enter-from {
    transform: scale(0.85);
    opacity: 0.6;
}
.animation-enter-to {
    transform: scale(1);
    opacity: 1;
}
.animation-enter-active {
    transition: all 200ms ease;
}
</style>