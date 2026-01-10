<script setup lang="ts">
defineProps({
  attribute: {
    type: String,
    default: '',
  },
})
function renderCssProperties(element) {
  // 清空列表
  cssPropsList.innerHTML = ''

  // 获取元素的计算样式
  const computedStyle = window.getComputedStyle(element)

  // 收集常用的 CSS 属性
  const commonProps = [
    'width',
    'height',
    'background-color',
    'color',
    'padding',
    'margin',
    'border',
    'border-radius',
    'font-size',
    'font-weight',
    'line-height',
    'display',
    'position',
    'box-shadow',
    'overflow',
  ]

  // 遍历常用属性并创建列表项
  commonProps.forEach((propName) => {
    // 获取属性值
    const propValue = computedStyle.getPropertyValue(propName).trim()

    // 跳过空值属性
    if (!propValue)
      return

    // 创建列表项
    const listItem = document.createElement('li')
    listItem.className = 'css-prop-item'
    listItem.title = `${propName}: ${propValue}`

    // 创建属性名元素
    const propNameElement = document.createElement('span')
    propNameElement.className = 'prop-name'
    propNameElement.textContent = `${propName}:`

    // 创建属性值元素
    const propValueElement = document.createElement('span')
    propValueElement.className = 'prop-value'
    propValueElement.textContent = propValue

    // 组装元素
    listItem.appendChild(propNameElement)
    listItem.appendChild(propValueElement)

    // 添加到列表
    cssPropsList.appendChild(listItem)
  })
}
onMounted(() => {
  renderCssProperties()
})
</script>

<template>
  <div class="css-attribute">
    <div id="css-panel" class="css-panel">
      <ul id="css-props-list" class="css-props-list" />
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
    }
</style>
