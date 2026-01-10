<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { debounce, findScrollableElements } from '@/utils/index'

const highlightLayerStyle = ref({})
// 上一个悬停的元素（避免重复处理同一元素）
let lastTarget: any = null
const highlightLayer = useTemplateRef('highlightLayer')
// 用于监听元素位置变化的 MutationObserver
let mutationObserver: MutationObserver | null = null

// 监听鼠标移动事件
const updateHighlight = debounce((e) => {
  const target = e.target

  // 如果鼠标还在同一个元素上，无需更新
  if (target === lastTarget) {
    return
  }

  // 清除之前的 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
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

    // 添加 MutationObserver 监听元素位置变化
    mutationObserver = new MutationObserver(() => {
      if (lastTarget) {
        try {
          const rect = lastTarget.getBoundingClientRect()
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop

          highlightLayerStyle.value = {
            left: `${rect.left + scrollLeft}px`,
            top: `${rect.top + scrollTop}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            display: 'block',
          }
        }
        catch (e) {
          if (highlightLayer.value) {
            highlightLayer.value.style.display = 'none'
          }
          console.log(e)
        }
      }
    })

    // 监听目标元素的变化，只监听可能影响位置的属性
    mutationObserver.observe(target, {
      attributes: true,
      attributeFilter: ['style', 'class', 'id'],
      childList: false,
      subtree: false,
    })

    // 也监听目标元素的父元素，以捕获可能影响位置的变化
    if (target.parentElement) {
      mutationObserver.observe(target.parentElement, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        childList: true,
        subtree: false,
      })
    }
  }
  catch (e) {
    // 兼容某些特殊元素（如iframe内元素、已移除的元素）
    highlightLayer.value.style.display = 'none'
    console.log(e)
  }
}, 100)

// 处理滚动事件，更新高亮层位置
const handleScroll = debounce(() => {
  if (lastTarget) {
    try {
      // 获取元素相对于视口的位置
      const rect = lastTarget.getBoundingClientRect()
      // 获取页面滚动的偏移量（兼容各浏览器）
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop

      // 更新高亮层位置
      highlightLayerStyle.value = {
        left: `${rect.left + scrollLeft}px`,
        top: `${rect.top + scrollTop}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'block',
      }
    }
    catch (e) {
      if (highlightLayer.value) {
        highlightLayer.value.style.display = 'none'
      }
      console.log(e)
    }
  }
}, 50)

onMounted(() => {
  addEventListener('mousemove', updateHighlight)
  // 监听窗口滚动事件
  window.addEventListener('scroll', handleScroll, true)
  // 监听所有可滚动元素的滚动事件
  const scrollableElements = findScrollableElements()
  scrollableElements.forEach((element) => {
    element.addEventListener('scroll', handleScroll, true)
  })
})

onUnmounted(() => {
  removeEventListener('mousemove', updateHighlight)
  // 移除滚动事件监听，避免内存泄漏
  window.removeEventListener('scroll', handleScroll, true)
  // 移除所有可滚动元素的滚动事件监听
  const scrollableElements = findScrollableElements()
  scrollableElements.forEach((element) => {
    element.removeEventListener('scroll', handleScroll, true)
  })
  // 清除 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
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
