<script setup lang="ts">
import { flip, offset, shift, useFloating } from '@floating-ui/vue'
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { onMessage } from 'webext-bridge/content-script'
import { default_CONFIG, local_CONFIG } from '@/constants'
import { cssDeepInspector, setToPlus } from '@/utils/css'
import { notify } from '@/utils/index'
// import { notify } from '@/utils/index'
import CssAttribute from './components/cssAttribute.vue'

const keyDown: Set<string> = new Set()
let onMessageOff: () => void = () => {}
const highlightLayerStyle = ref({
  left: '0px',
  top: '0px',
  width: '0px',
  height: '0px',
  display: 'none',
  borderColor: '',
  borderStyle: '',
  keyConfig: '',
  cssProps: [] as string[],
  isEnabled: true,
})
const cssList = ref<{ label: string, value: string }[]>([])
// 上一个悬停的元素（避免重复处理同一元素）
let lastTarget: HTMLElement | null = null
// 缓存元素位置，避免重复计算
let lastRect: DOMRect | null = null
const highlightLayer = useTemplateRef<HTMLDivElement>('highlightLayer')
const cssAttributeRef = useTemplateRef<HTMLDivElement>('cssAttributeRef')
// 用于监听元素位置变化的 MutationObserver
let mutationObserver: MutationObserver | null = null
// 标记是否正在更新样式，避免重复执行
let isUpdating = false
// 当前target
let currentTarget: HTMLElement | null = null
// 记录上一次的target
let lastTargetCss: HTMLElement | null = null
// 是否处于显示状态
const isVisible = ref(false)
const dialog = ref(false)
const message = ref('')

// 2. 配置 Floating UI 核心逻辑
const { floatingStyles } = useFloating(highlightLayer, cssAttributeRef, {
  // 放置位置：底部居中
  placement: 'bottom',
  // 只要 isVisible 为 true 就开启自动更新（处理滚动和位移）
  // whileElementsMounted: autoUpdate,
  middleware: [
    offset(), // 弹框与高亮框保持 10px 距离
    flip(),
    shift(),

  ],
})

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
  if (!isEnabled())
    return
  // 如果属性是显示，不更新位置

  if (isVisible.value)
    return

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
  currentTarget = target
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
// 统一挂载监听事件
function addListener() {
// 鼠标移动事件：passive: true 提升滚动性能
  document.addEventListener('mousemove', updateHighlight, { passive: true })
  // 滚动/窗口大小变化：用 capture 模式，更早触发
  window.addEventListener('scroll', handleViewportChange, { passive: true, capture: true })
  window.addEventListener('resize', handleViewportChange, { passive: true, capture: true })
}
// 统一移出监听事件
function removeListener() {
  document.removeEventListener('mousemove', updateHighlight)
  window.removeEventListener('scroll', handleViewportChange, { capture: true })
  window.removeEventListener('resize', handleViewportChange, { capture: true })
}
onMounted(async () => {
  await nextTick() // 确保高亮层已挂载
  addListener()
})

onUnmounted(() => {
  removeListener()

  // 清除 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }

  // 重置状态
  currentTarget = null
  lastTarget = null
  lastRect = null
  highlightLayerStyle.value.display = 'none'
})
// 关闭css属性展示框和高亮层
function closeCssAttributeAndHighlightLayer() {
  isVisible.value = false
  highlightLayerStyle.value.display = 'none'
}
// 接收消息
function getMessage() {
  onMessageOff = onMessage<any>('config', async (data) => {
    if (data?.data?.previewData) {
      highlightLayerStyle.value = {
        ...highlightLayerStyle.value,
        ...data?.data?.previewData,
      }
    }
  })
}
// 获取目标的所有css属性
/**
 * 获取元素的计算样式（仅查询全部属性时过滤默认值）
 * @param propNames - 可选，指定要获取的CSS属性名数组，不传则获取所有非默认属性
 * @returns 包含计算样式的对象数组
 */
function getAllComputedStyles(propNames?: string[]): { label: string, value: string }[] {
  // 如果是同一个元素，直接返回缓存的结果

  if (currentTarget === lastTargetCss)
    return cssList.value
  // 获取目标元素的计算样式
  const computedStyle = window.getComputedStyle(currentTarget!)
  const result: { label: string, value: string }[] = []

  if (propNames && propNames.length > 0) {
    // console.log(cssDeepInspector.inspect(currentTarget!, propNames))
    const res = cssDeepInspector.extractStyles(currentTarget!, propNames)
    result.push(...res)
  }
  else {
    // 未传入propNames（查全部）：过滤默认值，逐个创建单属性对象
    // 创建同类型空元素获取浏览器默认样式
    const tempElement = document.createElement(currentTarget!.tagName)
    tempElement.style.position = 'absolute'
    tempElement.style.visibility = 'hidden'
    tempElement.style.pointerEvents = 'none'
    document.body.appendChild(tempElement)
    const defaultStyle = window.getComputedStyle(tempElement)

    // 遍历所有CSS属性，仅保留非默认值，逐个创建单属性对象
    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i]
      const computedValue = computedStyle.getPropertyValue(prop)
      const defaultValue = defaultStyle.getPropertyValue(prop)

      // 过滤默认值，且值不为空时创建单属性对象
      if (computedValue !== defaultValue && computedValue) {
        result.push({ label: prop, value: computedValue })
      }
    }

    // 清理临时元素
    document.body.removeChild(tempElement)
  }
  lastTargetCss = currentTarget
  return result
}
// 不启用功能。不执行
function isEnabled() {
  return highlightLayerStyle.value.isEnabled
}
// 关闭dialog
function closeDialog() {
  setTimeout(() => {
    dialog.value = false
  }, 1000)
}
// 监听按键开启和关闭功能，快捷点
function onkeydownF1(e: KeyboardEvent) {
  // 如果按下的是F1键
  // TODO:通知popup切换状态
  if (e.key === 'F4') {
    // 启用
    highlightLayerStyle.value.isEnabled = !highlightLayerStyle.value.isEnabled
    const isEnabled = highlightLayerStyle.value.isEnabled

    message.value = isEnabled ? '已启用' : '已禁用'
    dialog.value = true
    closeDialog()
  }
}
// 监听键盘按下事件
function keydownListener(e: KeyboardEvent) {
  onkeydownF1(e)
  // 如果不启用功能，不执行
  if (!isEnabled())
    return
  // 如果没有选中某个元素不执行

  if (highlightLayerStyle.value.display === 'none')
    return
    // 校验目标元素有效性
  if (!currentTarget || !(currentTarget instanceof HTMLElement)) {
    // console.error('传入的不是有效的DOM元素')
    dialog.value = true
    message.value = '传入的不是有效的DOM元素'
    closeDialog()
    return
  }

  keyDown.add(e.key)
  // 当按下的键是配置的键时，切换显示状态
  if (setToPlus(keyDown) === highlightLayerStyle.value.keyConfig) {
    isVisible.value = !isVisible.value
  }
  if (isVisible.value) {
    const { cssProps = [] } = highlightLayerStyle.value
    cssList.value = getAllComputedStyles(cssProps)
    // console.log(cssList.value)
  }
}
// 键盘up
function keyupListener() {
  keyDown.clear()
}
onMounted(async () => {
  window.addEventListener('keydown', keydownListener)
  window.addEventListener('keyup', keyupListener)
  const config: string | null = await storage.getItem(local_CONFIG)

  if (config) {
    highlightLayerStyle.value = {
      ...highlightLayerStyle.value,
      ...JSON.parse(config),
    }
  }
  else {
    highlightLayerStyle.value = {
      ...highlightLayerStyle.value,
      ...default_CONFIG,
    }
  }
  getMessage()
})
onBeforeUnmount(() => {
  if (typeof onMessageOff === 'function') {
    onMessageOff()
  }
  // 移除键盘按下事件监听
  window.removeEventListener('keydown', keydownListener)
  // 移除键盘up事件监听
  window.removeEventListener('keyup', keyupListener)
  // 清除 缓存的css列表
  cssList.value = []
})
// 监听isEnabled变化
watch(() => highlightLayerStyle.value.isEnabled, (newVal) => {
  if (!newVal) {
    closeCssAttributeAndHighlightLayer()
  }
})
watch(() => dialog.value, (newVal) => {
  if (newVal) {
    notify(message.value)
  }
})
</script>

<template>
  <div ref="highlightLayer" class="css-inspect" :style="highlightLayerStyle">
    <CssAttribute v-if="isVisible" ref="cssAttributeRef" v-model="cssList" :style="floatingStyles" />
  </div>
  <!-- <Dialog :dialog="dialog" :message="message" /> -->
</template>

<style scoped>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

.css-inspect {
  position: fixed; /* 关键：fixed 定位基于视口，无需加滚动偏移 */
  pointer-events: none;
  background: transparent;
  /* border: 2px solid #ff4500; */
  border-width: 1px;
  z-index: 99;
  display: none;
  /* 优化渲染性能的属性 */
  transform: translateZ(0); /* 开启硬件加速 */
  will-change: left, top, width, height; /* 告诉浏览器提前优化 */
  backface-visibility: hidden;
  /* 去掉过渡动画，避免延迟感 */
  transition: none;

}
</style>
