<template>
  <div class="root">
    <div class="nav">
      <button @click="addCard('gauge')">增加仪表盘</button>
      <button @click="addCard('line')">增加折线图</button>
      <button @click="save">保存</button>
    </div>
    <Draggle ref="draggle" :logCube="logCube">
      <!-- <template #content="item">
        <div :class="item.type"></div>
      </template> -->
    </Draggle>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import Draggle from './components/draggle.vue'
const draggle = ref()
/** 添加卡片 */
const addCard = (type: string) => {
  draggle.value.addCard(type)
}
const logCube = ref([])
const lineHeight = ref('') // 折线图图表高度
const lineWidth = ref('') // 折线图图表宽度
const gaugeWidth = ref('') // 仪表图图表宽度
const gaugeHeight = ref('') // 仪表图图表高度
onMounted(() => {
  logCube.value = JSON.parse(localStorage.getItem('logCube') || '[]')
  resize()
  window.addEventListener('resize', resize)
})
const resize = () => {
  const unitLength = Math.floor(draggle.value.containerRef.clientWidth / 8)
  gaugeWidth.value = `${unitLength}px`
  gaugeHeight.value = `${unitLength}px`
  lineWidth.value = `${unitLength * 2}px`
  lineHeight.value = `${unitLength * 2}px`
}
/** 保存 */
const save = () => {
  logCube.value = draggle.value.save()
  localStorage.setItem('logCube', JSON.stringify(logCube.value))
  console.log(logCube.value)
}
</script>
<style>
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
}
#app {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
<style scoped>
.root {
  height: 100%;
  width: 100%;
}
.gauge {
  width: v-bind('gaugeWidth');
  height: v-bind('gaugeHeight');
  background-color: green;
}

.line {
  width: v-bind('lineWidth');
  height: v-bind('lineHeight');
  background-color: yellow;
}
</style>
