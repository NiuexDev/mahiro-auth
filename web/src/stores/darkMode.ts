import { ref, watch } from 'vue'

export const toggle = () => {
    switch (selectedMode.value) {
        case "light":
            selectedMode.value = "dark"
            break
        case "dark":
            selectedMode.value = "auto"
            break
        case "auto":
            selectedMode.value = "light"
            break
    }
    return selectedMode
}
export const mode = ref<"light" | "dark">()

export const selectedMode = ref((localStorage.getItem("dark-mode") ?? "auto") as "light"|"dark"|"auto")

watch(() => selectedMode.value, (selectedMode) => {
    switch (selectedMode) {
        case "light": {
            localStorage.setItem("dark-mode", "light")
            document.documentElement.classList.remove("dark")
            mode.value = "light"
            break
        }
        case "dark": {
            localStorage.setItem("dark-mode", "dark")
            document.documentElement.classList.add("dark")
            mode.value = "dark"
            break
        }
        case "auto": {
            localStorage.setItem("dark-mode", "auto")

            var isLight = window.matchMedia('(prefers-color-scheme: light)').matches
            var isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (isLight) {
                document.documentElement.classList.remove("dark")
                mode.value = "light"
            } else if (isDarkMode) {
                document.documentElement.classList.add("dark")
                mode.value = "dark"
            }
            break
        }
    }
}, { immediate: true })