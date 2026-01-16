<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { debounce } from '@/utils'
import Dialog from './dialog.vue'

defineProps({
  attribute: {
    type: String,
    default: '',
  },

})
const cssList = defineModel<{ label: string, value: string }[]>({
  type: Array as PropType<{ label: string, value: string }[]>,
  default: () => [],
})
const originalCssList = ref<{ label: string, value: string }[]>([])
const cssAttribute = useTemplateRef('cssAttribute')
const dialog = ref(false)
async function copyValue(value: { label: string, value: string }) {
  // 如果是http ip地址的。不允许使用
  const copyValue = handleCopyFormat(value.label, value.value)
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(copyValue)
  }
  else {
    copyValueTraditional(copyValue)
  }
  dialog.value = true
  setTimeout(() => {
    dialog.value = false
  }, 1000)
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
// 监听dom元素是否交叉
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry.intersectionRatio)
    if (entry.isIntersecting) {
      console.log('元素进入视口')
    }
    else {
      console.log('元素离开视口')
    }
  })
}, {

  threshold: 1, // 元素100%进入root时触发
  //   rootMargin: '10px', // 无额外边距，精准判断

})
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
// 监听浏览器的resize事件
onMounted(() => {
  if (cssAttribute.value)
    observer.observe(cssAttribute.value)
})
watch(
  cssList,
  (newList) => {
    // 每次 cssList 变化，都更新原始数据副本
    originalCssList.value = [...newList]
  },
  { immediate: true }, // 立即执行一次（等同于 onMounted 里的初始化）
)
</script>

<template>
  <div ref="cssAttribute" class="css-attribute">
    <div id="css-panel" class="css-panel">
      <!-- 搜索框 -->
      <input id="css-search-input" type="text" class="css-panel-search" placeholder="搜索 CSS 属性..." @input="filterProps">
      <ul id="css-props-list" class="css-props-list">
        <li v-for="value in originalCssList" :key="value.label" class="css-prop-item" @click="copyValue(value)">
          <span class="css-prop-name">{{ value.label }}</span>
          <span class="css-prop-value" :title="value.value">{{ value.value }}</span>
        </li>
      </ul>
    </div>
    <Dialog :dialog />
  </div>
</template>

<style scoped>
@import './index.css';

.css-attribute {
  position: absolute;
  width: 80px;
  z-index: 999;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;

  ul {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
