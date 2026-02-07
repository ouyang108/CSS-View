<script setup lang="ts">
import type { FormattedResult } from '@/types/type'

import { debounce, notify } from '@/utils'

const props = defineProps({
  attribute: {
    type: String,
    default: '',
  },
  target: {
    type: Object as PropType<HTMLElement | null>,
    default: () => null,
  },
})
// 是否允许编辑

let clickTimer: ReturnType<typeof setTimeout> | null = null
let clickCount = 0 // 记录连续点击次数
const cssList = defineModel<FormattedResult[]>({
  type: Array as PropType<FormattedResult[]>,
  default: () => [],
})
const originalCssList = ref<FormattedResult[]>([])

watch(
  cssList,
  (newList) => {
    // 每次 cssList 变化，都更新原始数据副本
    newList.forEach((item) => {
      item.isContenteditable = false
    })
    originalCssList.value = newList.map(item => ({
      ...item, // 展开原有属性
      // 快照
      originValue: item.value,
      // 标记是否被修改过
      isDirty: false,
    }))
  },
  { immediate: true }, // 立即执行一次（等同于 onMounted 里的初始化）
)
// 修改样式
function applyStyle(item: FormattedResult) {
  if (!props.target)
    return
  // 设置内联样式，覆盖类样式
  props.target.style.setProperty(item.label, item.value)
}
// 可编辑失去焦点时触发
function handleBlur(e: FocusEvent, value: FormattedResult) {
  if (e.target instanceof HTMLElement) {
    const newValue = e.target.textContent || ''
    if (newValue !== value.value) {
      value.value = newValue
      value.isDirty = newValue !== value.originValue
      applyStyle(value)
    }
  }

  value.isContenteditable = false
}
async function copyValue(value: FormattedResult) {
  // 如果是http ip地址的。不允许使用
  const copyValue = handleCopyFormat(value.label, value.value)
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(copyValue)
  }
  else {
    copyValueTraditional(copyValue)
  }

  setTimeout(() => {
    notify('复制成功')
  }, 1000)
}
// 处理双击事件
function handleDb(value: FormattedResult) {
  value.isContenteditable = true
}
// 单次点击事件
function handleClick(value: FormattedResult) {
  // 如果正处于编辑状态，不允许点击
  if (value.isContenteditable)
    return
  clickCount++ // 每次点击计数加 1

  // 如果已经有计时器在跑，说明是连续点击，直接掐断它
  if (clickTimer) {
    clearTimeout(clickTimer)
  }

  // 重新开启计时器（即：只有最后一次点击能成功跑完这 300ms）
  clickTimer = setTimeout(() => {
    if (clickCount === 1) {
      // 刚好只点了一次
      copyValue(value)
    }
    else if (clickCount >= 2) {
      // 点了两次或更多次
      handleDb(value)
    }

    // 结算完成后，重置状态
    clickCount = 0
    clickTimer = null
  }, 300)
}
// 传统复制方法
function copyValueTraditional(value: string) {
  const input = document.createElement('input')
  input.value = value
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}
// 处理复制的格式
/**
 * attribute
 * 处理复制的格式 font-size: 16px;
 * @param attribute 属性名
 * @param value 属性值
 */
function handleCopyFormat(attribute: string, value: string) {
  return `${attribute}: ${value};\n`
}
// 重置数据
function resetData() {
  if (!props.target)
    return
  // 1. 找出所有被动过的属性
  const dirtyItems = originalCssList.value.filter(item => item.isDirty)

  if (dirtyItems.length === 0)
    return

  // 2. 批量移除内联样式（只针对脏数据）
  dirtyItems.forEach((item) => {
    props.target!.style.removeProperty(item.label)
  })

  // 3. 性能优化：一次性读取计算后的样式
  const computedStyle = window.getComputedStyle(props.target)

  // 4. 同步状态
  dirtyItems.forEach((item) => {
    item.value = computedStyle.getPropertyValue(item.label).trim()
    item.isDirty = false // 重置标记
  })

  notify('已恢复修改过的样式')
}
// 过滤属性列表
const filterProps = debounce((e: InputEvent) => {
  if (!cssList.value.length)
    return

  const searchTerm = (e.target as HTMLInputElement).value.toLowerCase()

  if (!searchTerm) {
    originalCssList.value = [...cssList.value]
    return
  }
  originalCssList.value = cssList.value.filter(item =>
    item.label.toLowerCase().includes(searchTerm),
  )
  // 当内容为空，需要展示所有的
}, 300)
</script>

<template>
  <div class="css-attribute">
    <div id="css-panel" class="css-panel">
      <!-- 搜索框 -->
      <input id="css-search-input" type="text" class="css-panel-search" placeholder="搜索 CSS 属性..." @input="filterProps">
      <!-- 重置按钮 -->
      <button id="css-reset-btn" class="css-panel-reset" @click="resetData">
        重置
      </button>
      <ul id="css-props-list" class="css-props-list">
        <li
          v-for="value in originalCssList" :key="value.label" class="css-prop-item" @click="handleClick(value)"
        >
          <span class="css-prop-name">{{ value.label }}</span>
          <span
            class="css-prop-value" :title="value.value" :contenteditable="value.isContenteditable"
            @blur="handleBlur($event, value)"
          >{{ value.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
@import './index.css';

.css-attribute {
  position: absolute;
  width: 80px;
  z-index: 9999;

  pointer-events: auto;

  ul {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
