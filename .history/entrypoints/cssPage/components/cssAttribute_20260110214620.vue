<script setup lang="ts">
defineProps({
  attribute: {
    type: String,
    default: '',
  },
})
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
