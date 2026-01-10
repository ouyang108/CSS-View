<script setup lang="ts">
defineProps({
  attribute: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="css-attribute">
    <ul id="css-props-list" class="css-props-list" />
  </div>
</template>

<style  scoped>
    .css-attribute {
        position: absolute;
        width: 80px;
        z-index: 999;
        left: 50%;
        transform: translateX(-50%);
    }
       /* CSS 属性列表 */
        .css-props-list {
            list-style: none;
        }

        /* 列表项样式 - 单行布局 */
        .css-prop-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 4px;
            border-bottom: 1px solid #f8f8f8;
            cursor: help;
            line-height: 1.4;
        }

        .css-prop-item:last-child {
            border-bottom: none;
        }
</style>
