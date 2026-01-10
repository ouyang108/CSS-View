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
        }   .css-panel {
            /* 调整宽度，确保单行显示 */
            width: 200px;
            max-height: 400px;
            background-color: white;
            border: 1px solid #e6e6e6;
            border-radius: 4px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            padding: 8px;
            /* 绝对定位，相对于目标元素 */
            position: absolute;
            /* 默认显示在元素右侧 */
            left: calc(100% + 10px);
            top: 0;
            /* 移除默认隐藏，改为始终显示 */
            display: block;
            overflow-y: auto;
            overflow-x: hidden; /* 确保没有横向滚动 */
            z-index: 9999;
            font-size: 12px;
        }
</style>
