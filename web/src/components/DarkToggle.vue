<script lang="ts" setup>
import { selectedMode, toggle } from "@/stores/darkMode"
import { AutoAwesomeRound, DarkModeRound, LightModeFilled } from "@vicons/material"
import { NButton, NIcon } from "naive-ui"

</script>


<template>
    <NButton quaternary circle @click="toggle()">
        <NIcon size="1em" v-if="selectedMode === 'light'" :component="LightModeFilled"/>
        <NIcon size="0.8em" v-if="selectedMode === 'dark'" :component="DarkModeRound"/>
        <NIcon  v-if="selectedMode === 'auto'" :component="AutoAwesomeRound" />
    </NButton>
</template>


<style scoped>

.n-icon {
    transform: scale(1);
    opacity: 1;
    transition: all 200ms ease;
    animation: in 200ms ease;
}

@keyframes in {
    from {
        opacity: 0.6;
        transform: scale(0.85);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.n-button:active .n-icon {
    transform: scale(0.85);
    opacity: 0.6;
}
/* .card {
    display: inline-block;
    min-width: 160px;
    box-sizing: border-box;
    width: unset;
    border-radius: 20px;
    background-color: var(--card-bg-color);
    overflow: hidden;
}

h1 {
    font-size: 1.1em;
    padding: 18px 14px 10px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.list-container {
    max-height: 100vh;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 8px 28px;
}
.list::-webkit-scrollbar {
    display: none;
    width: 0;
}

.list {
    display: flex;
    flex-direction: column;
    align-items: start;
    padding-bottom: 14px;
    gap: 4px;
}

.list p {
    margin-top: 4px;
} */

/* .list p {
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 15px;
    margin: 0 8px;
    padding: 8px 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 200ms ease;
} */

/* .list p:hover {
    background-color: rgba(0, 0, 0, 0.1);
} */
</style>