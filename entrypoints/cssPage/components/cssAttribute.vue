<script setup lang="ts">
import { useTemplateRef } from 'vue'

defineProps({
  attribute: {
    type: String,
    default: '',
  },
  cssList: {
    type: Array as PropType<{ label: string, value: string }[]>,
    default: () => [],
  },
})
const cssAttribute = useTemplateRef('cssAttribute')

async function copyValue(value: { label: string, value: string }) {
  // 如果是http ip地址的。不允许使用
  const copyValue = handleCopyFormat(value.label, value.value)
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(copyValue)
  }
  else {
    copyValueTraditional(copyValue)
  }
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
 * @param value
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
// 监听浏览器的rese
onMounted(() => {
  if (cssAttribute.value)
    observer.observe(cssAttribute.value)
})
</script>

<template>
  <div ref="cssAttribute" class="css-attribute">
    <div id="css-panel" class="css-panel">
      <ul id="css-props-list" class="css-props-list">
        <li v-for="value in cssList" :key="value.label" class="css-prop-item" @click="copyValue(value)">
          <span class="css-prop-name">{{ value.label }}</span>
          <span class="css-prop-value">{{ value.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style  scoped>
    @import './index.css';
    .css-attribute {
        position: absolute;
        width: 80px;
        z-index: 999;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: auto;
    }
</style>
