<script setup lang="ts">
import { debounce } from '@/utils/index'

const highlightLayerStyle = ref({})
// 上一个悬停的元素（避免重复处理同一元素）
let lastTarget: any = null
const highlightLayer = useTemplateRef('highlightLayer')
// 监听鼠标移动事件
const updateHighlight = debounce((target) => {
  // 如果鼠标还在同一个元素上，无需更新
  if (target === lastTarget) {
    console.log(78788)
    return
  }

  lastTarget = target

  if (!highlightLayer.value) {
    console.log('111111')
    return
  }

  // 跳过无效元素和高亮层本身
  if (!target || target === highlightLayer.value) {
    highlightLayer.value.style.display = 'none'
    return
  }

  try {
    // 获取元素位置（仅在元素变化时读取，减少重排）
    const rect = target.getBoundingClientRect()
    console.log(123)
    // 批量修改样式（合并style修改，减少重绘次数）
    highlightLayerStyle.value = {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      display: 'block',
    }
    console.log(highlightLayerStyle.value)
  }

  catch (_e) {
    // 兼容某些特殊元素（如iframe内元素、已移除的元素）
    highlightLayer.value.style.display = 'none'
  }
}, 100)
onMounted(() => {
  addEventListener('mousemove', updateHighlight)
})
onUnmounted(() => {
  removeEventListener('mousemove', updateHighlight)
})
</script>

<template>
  <div ref="highlightLayer" class="css-inspect" :style="highlightLayerStyle">
    测试弹框
  </div>
</template>

<style scoped>
.css-inspect {
  position: fixed;
  pointer-events: none;
  background: transparent;
  border: 2px solid #ff4500;
  z-index: 999999;
  display: none;
  transform: translateZ(0);
  transition: opacity 0.05s;
  will-change: left, top, width, height;
  backface-visibility: hidden
}
</style>
