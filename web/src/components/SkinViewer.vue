<template>
    <canvas id="skin_container"></canvas>
</template>


<script>
import { ref } from "vue"
import * as skinview3d from "skinview3d"
const dom = ref(null)
let skinViewer = new skinview3d.SkinViewer({
	canvas: document.getElementById("skin_container"),
	width: 300,
	height: 400,
	skin: "@assets/img/Xiaohuang_Cl.png"
})
</script>


<style scoped>

</style>