<script setup lang="ts">
import { config } from "@/../config"
import icon from "@/assets/image/icon.png"
import { NButton, type c } from "naive-ui"
import logo from "~/assets/logo.svg"

const blurValue = () => {
    if (config.ui.home.blur === false) {
        return ""
    }
    if (config.ui.home.blur === true) {
        return "blur(10px)"
    }
    return `blur(${config.ui.home.blur}px)`
}
</script>

<template>
    <main :class="$style.main" v-if="config.ui.home.html === null" :style="{ backdropFilter: blurValue() }">
        <header>
            <NButton :text-color="config.ui.home.buttonColor" quaternary @click="$router.push('/auth/login')">登录</NButton>
            <NButton :text-color="config.ui.home.buttonColor" secondary type="primary" @click="$router.push('/auth/signup')">注册</NButton>
        </header>
        <div :class="$style.content">
            <div :class="$style.title" :style="{ color: config.ui.home.color }">
                <img :src="logo" alt="">
                <div :class="$style.text">
                    <h1>{{ config.ui.home.title }}</h1>
                    <p>{{ config.ui.home.description }}</p>
                </div>
            </div>
        </div>
        <footer :style="{ color: config.ui.footer.color }">
            <div :class="$style.link">
                <a v-for="link in config.ui.footer.link" :href="link.url">{{ link.name }}</a>
            </div>
            <p :class="$style.copyright">{{ config.ui.footer.copyright }}</p>
            <p :class="$style.powered">Powered by <img :src="icon" />Mahiro Auth</p>
        </footer>
    </main>
    <main v-else v-html="config.ui.home.html"></main>
</template>

<style module>
main.main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

main.main header {
    padding: 1.5em 6vw 1em;
    display: flex;
    flex-direction: row;
    justify-content: end;
    gap: 1em;
}

/* main.main header .login {
    padding: 0.5em 1em;
    border-radius: 0.5em;
} */

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
    color:#888;
    background-color: rgba(0, 0, 0, 0.03);
}

main.main footer .link {
    display: flex;
    justify-content: center;
    gap: 0.5em 2.5em;
    flex-wrap: wrap;
    margin-bottom: 1em;
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
    pointer-events: none;
}
</style>