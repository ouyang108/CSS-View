<script setup lang="ts">
import { debounce } from '@/utils/index'
// 监听鼠标移动事件
function handleMouseMove(e: MouseEvent) {
  console.log(e.clientX, e.clientY)
}
onMounted(() => {
  addEventListener('mousemove', handleMouseMove)
})
onUnmounted(() => {
  removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div class="css-inspect">
    测试弹框
  </div>
</template>

<style scoped>
.css-inspect {
  position: fixed;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24px;
  text-align: center;
  transform: translateZ(0);
  transition: opacity 0.05s;
  will-change: left, top, width, height;
  backface-visibility: hidden
}
</style>
