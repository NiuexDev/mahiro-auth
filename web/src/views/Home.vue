<script setup lang="ts">
import { config } from "@/../config"
import DarkToggle from "@/components/DarkToggle.vue"
import LangSwitch from "@/components/LangSelector.vue"
import { NButton } from "naive-ui"
import icon from "~/assets/icon.svg"

const blurValue = () => {
    if (config.ui.home.blur === false) {
        return ""
    }
    if (config.ui.home.blur === true) {
        return "blur(10px)"
    }
    return `blur(${config.ui.home.blur}px)`
}

const ui = config.ui
</script>

<template>
    <main class="main" :style="{ backdropFilter: blurValue() }">
        <header>
            <DarkToggle/>
            <LangSwitch/>
            <NButton quaternary @click="$router.push('/auth/login')">登录</NButton>
            <NButton secondary type="primary" @click="$router.push('/auth/signup')">注册</NButton>
        </header>
        <div v-if="ui.home.html === null" class="content">
            <div class="title">
                <img :src="config.assets.logo" alt="">
                <div class="text">
                    <h1>{{ ui.home.title }}</h1>
                    <p>{{ ui.home.description }}</p>
                </div>
            </div>
        </div>
        <div v-else v-html="ui.home.html"></div>
        <footer>
            <div class="link">
                <a v-for="link in ui.home.footer.link" :href="link.url">{{ link.name }}</a>
            </div>
            <p class="copyright">{{ ui.home.footer.copyright }}</p>
            <p v-if="ui.home.footer.showpowered" class="powered">Powered by <img :src="icon" />Mahiro Auth</p>
        </footer>
    </main>
</template>

<style scoped>
main.main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    --homo-title-color: rgb(20, 20, 20);
    --home-footer-bg-color:rgba(0, 0, 0, 0.05);
    --home-footer-text-color: rgba(33, 33, 33, 0.6);
}

.dark main.main {
    --homo-title-color: rgb(250, 250, 250);
    --home-footer-bg-color:rgba(255, 255, 255, 0.05);
    --home-footer-text-color: rgba(220, 220, 220, 0.6);
}

main.main header {
    padding: 1.5em 6vw 0;
    display: flex;
    flex-direction: row;
    justify-content: end;
    gap: 0.5em;
}

main.main .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10vh 10vw;
}

main.main .content .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 11vh 0 10vh;
    font-weight: normal;
    pointer-events: none;
    user-select: none;
    color: var(--homo-title-color);
}

main.main .content .title img {
    height: 100px;
}

main.main .content .text {
    padding-top: 1.5em;
}

main.main footer {
    padding: 28px 48px;
    text-align: center;
    font-size: 0.8em;
    pointer-events: none;
    user-select: none;
    color: var(--home-footer-text-color);
    background-color: var(--home-footer-bg-color);
}

main.main footer .link {
    display: flex;
    justify-content: center;
    gap: 0.5em 2.5em;
    flex-wrap: wrap;
    margin-bottom: 1em;
    pointer-events: initial;
}

main.main footer .link a {
    text-decoration: none;
}

main.main footer .link a:hover {
    text-decoration: underline;
}

main.main footer .copyright {
    margin-bottom: 0.3em;
}

main.main footer .powered img {
    height: 1em;
    vertical-align: -7%;
    padding: 0 0.1em;
}
</style>