<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { debounce } from '@/utils/index'

const highlightLayerStyle = ref({})
// 上一个悬停的元素（避免重复处理同一元素）
let lastTarget: any = null
const highlightLayer = useTemplateRef('highlightLayer')

// 核心逻辑抽离：单独处理高亮层位置更新
function updateHighlightPosition(target: HTMLElement) {
  if (!highlightLayer.value || !target) {
    highlightLayer.value?.style.display = 'none'
    return
  }

  try {
    // 获取元素相对于视口的位置
    const rect = target.getBoundingClientRect()
    // 获取页面滚动的偏移量（兼容各浏览器）
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop

    // 批量修改样式，修正滚动偏移
    highlightLayerStyle.value = {
      left: `${rect.left + scrollLeft}px`,
      top: `${rect.top + scrollTop}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      display: 'block',
    }
  }
  catch (e) {
    highlightLayer.value.style.display = 'none'
    console.log(e)
  }
}

// 鼠标移动的防抖处理（保留原有逻辑）
const handleMouseMove = debounce((e) => {
  const target = e.target
  if (target === lastTarget || target === highlightLayer.value)
    return

  lastTarget = target
  updateHighlightPosition(target)
}, 100)

// 滚动事件的防抖处理（单独处理，复用位置更新逻辑）
const handleScroll = debounce(() => {
  // 滚动时，基于上一个悬停的元素重新计算位置
  if (lastTarget) {
    updateHighlightPosition(lastTarget)
  }
}, 50) // 滚动防抖延迟可以更小，提升响应速度

onMounted(() => {
  // 监听鼠标移动
  addEventListener('mousemove', handleMouseMove)
  // 监听滚动（单独的防抖函数，避免参数冲突）
  addEventListener('scroll', handleScroll, true) // 捕获阶段触发，更及时
})

onUnmounted(() => {
  removeEventListener('mousemove', handleMouseMove)
  removeEventListener('scroll', handleScroll, true)
  // 清空缓存，避免内存泄漏
  lastTarget = null
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
