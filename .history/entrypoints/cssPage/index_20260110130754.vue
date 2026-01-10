<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { debounce, findScrollableElements } from '@/utils/index'

const highlightLayerStyle = ref({})
// 上一个悬停的元素（避免重复处理同一元素）
let lastTarget: any = null
const highlightLayer = useTemplateRef('highlightLayer')

// 监听鼠标移动事件
const updateHighlight = debounce((e) => {
  const target = e.target
  console.log('scroll')
  console.log(target)

  // 如果鼠标还在同一个元素上，无需更新
  if (target === lastTarget) {
    return
  }

  lastTarget = target

  if (!highlightLayer.value) {
    return
  }

  // 跳过无效元素和高亮层本身
  if (!target || target === highlightLayer.value) {
    highlightLayer.value.style.display = 'none'
    return
  }

  try {
    // 获取元素相对于视口的位置
    const rect = target.getBoundingClientRect()
    // 获取页面滚动的偏移量（兼容各浏览器）
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop

    // 批量修改样式（合并style修改，减少重绘次数）
    // 关键修复：加上滚动偏移量，保证位置始终准确
    highlightLayerStyle.value = {
      left: `${rect.left + scrollLeft}px`, // 加上水平滚动偏移
      top: `${rect.top + scrollTop}px`, // 加上垂直滚动偏移
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      display: 'block',
    }
    console.log(highlightLayerStyle.value)
  }
  catch (e) {
    // 兼容某些特殊元素（如iframe内元素、已移除的元素）
    highlightLayer.value.style.display = 'none'
    console.log(e)
  }
}, 100)

onMounted(() => {
  // addEventListener('mousemove', updateHighlight)
  // 额外优化：监听滚动事件，保证滚动时也能实时更新位置
  // addEventListener('scroll', updateHighlight)
  window.addEventListener('scroll', () => {
    console.log(123)
  })
  console.log(document.getElementById('chat-input-area'))
  nextTick(() => {
    console.log(findScrollableElements())
  })
})

onUnmounted(() => {
  // removeEventListener('mousemove', updateHighlight)
  // 移除滚动事件监听，避免内存泄漏
  removeEventListener('scroll', updateHighlight)
})
</script>

<template>
  <div ref="highlightLayer" class="css-inspect" :style="highlightLayerStyle" />
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
