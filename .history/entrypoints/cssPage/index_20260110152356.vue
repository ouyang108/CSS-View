<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { onMessage } from 'webext-bridge'
import { local_CONFIG } from '@/constants'

const highlightLayerStyle = ref({
  left: '0px',
  top: '0px',
  width: '0px',
  height: '0px',
  display: 'none',
  borderColor: '',
  borderStyle: '',
})
// 上一个悬停的元素（避免重复处理同一元素）
let lastTarget: HTMLElement | null = null
// 缓存元素位置，避免重复计算
let lastRect: DOMRect | null = null
const highlightLayer = useTemplateRef<HTMLDivElement>('highlightLayer')
// 用于监听元素位置变化的 MutationObserver
let mutationObserver: MutationObserver | null = null
// 标记是否正在更新样式，避免重复执行
let isUpdating = false

// 核心：计算并更新高亮层位置（抽离为独立函数）
function updateLayerPosition(target: HTMLElement) {
  if (isUpdating || !highlightLayer.value)
    return

  // 用 requestAnimationFrame 保证样式更新在浏览器重绘周期执行，更丝滑
  requestAnimationFrame(() => {
    try {
      const rect = target.getBoundingClientRect()
      // 缓存rect，避免重复获取
      lastRect = rect

      // 固定定位不需要加滚动偏移
      highlightLayerStyle.value = {
        ...highlightLayerStyle.value,
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'block',
      }
    }
    catch (e) {
      highlightLayerStyle.value.display = 'none'
      console.log('更新高亮层位置失败:', e)
    }
    finally {
      isUpdating = false
    }
  })
}

// 监听鼠标移动事件（无防抖，实时响应）
function updateHighlight(e: MouseEvent) {
  const target = e.target as HTMLElement

  // 跳过无效元素、高亮层本身、同一元素
  if (
    !target
    || target === highlightLayer.value
    || target === lastTarget
    // 跳过不可见/无尺寸的元素
    || (lastRect && target.getBoundingClientRect().width === 0)
  ) {
    return
  }

  // 清除之前的 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }

  lastTarget = target
  // 立即更新位置
  updateLayerPosition(target)

  // 优化 MutationObserver：只监听必要的变化，降低性能消耗
  mutationObserver = new MutationObserver(() => {
    if (lastTarget) {
      updateLayerPosition(lastTarget)
    }
  })

  // 缩小监听范围：只监听目标元素本身的样式/类变化
  mutationObserver.observe(target, {
    attributes: true,
    attributeFilter: ['style', 'class'],
    childList: false,
    subtree: false,
  })
}

// 处理滚动/窗口大小变化（无防抖，用 requestAnimationFrame 优化）
function handleViewportChange() {
  if (lastTarget) {
    updateLayerPosition(lastTarget)
  }
}

onMounted(async () => {
  await nextTick() // 确保高亮层已挂载
  // 鼠标移动事件：passive: true 提升滚动性能
  document.addEventListener('mousemove', updateHighlight, { passive: true })
  // 滚动/窗口大小变化：用 capture 模式，更早触发
  window.addEventListener('scroll', handleViewportChange, { passive: true, capture: true })
  window.addEventListener('resize', handleViewportChange, { passive: true, capture: true })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', updateHighlight)
  window.removeEventListener('scroll', handleViewportChange, { capture: true })
  window.removeEventListener('resize', handleViewportChange, { capture: true })

  // 清除 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }

  // 重置状态
  lastTarget = null
  lastRect = null
  highlightLayerStyle.value.display = 'none'
})
onMounted(async () => {
  const config: string | null = await storage.getItem(local_CONFIG)

  if (config) {
    highlightLayerStyle.value = {
      ...highlightLayerStyle.value,
      ...JSON.parse(config),
    }
  }
})
</script>

<template>
  <div ref="highlightLayer" class="css-inspect" :style="highlightLayerStyle" />
</template>

<style scoped>
.css-inspect {
  position: fixed; /* 关键：fixed 定位基于视口，无需加滚动偏移 */
  pointer-events: none;
  background: transparent;
  /* border: 2px solid #ff4500; */
  border-width: 1px;
  z-index: 999999;
  display: none;
  /* 优化渲染性能的属性 */
  transform: translateZ(0); /* 开启硬件加速 */
  will-change: left, top, width, height; /* 告诉浏览器提前优化 */
  backface-visibility: hidden;
  /* 去掉过渡动画，避免延迟感 */
  transition: none;
}
</style>
