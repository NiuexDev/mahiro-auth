<template>
    <div class="container">
        <div class="box">
            <RouterView></RouterView>
        </div>
    </div>
    <div class="bg"></div>
</template>

<script lang="ts" setup>
import { RouterView } from 'vue-router'
</script>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(@/assets/img/Girls_Band_Cry_KV2.webp);
    background-position: center;
    background-repeat: repeat-x;
    background-size: contain;
    /* background-image: url(@/assets/img/03.png);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover; */
    z-index: -1;
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
        background-color: rgba(255, 255, 255, 0.9);
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
    margin-bottom: 15px;
}

.box :deep(.submit) {
    margin-bottom: 17px;
}

:deep(.password input) {
    padding: 0 2px;
    letter-spacing: 0.1em;
}
</style>