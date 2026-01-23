<script setup lang="ts">
defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '已复制',
  },
})
</script>

<template>
  <div class="dialog" :style="{ display: dialog ? 'block' : 'none' }">
    {{ message }}
  </div>
</template>

<style  scoped>
    .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        /* 不允许换行 */

        border-radius: 10px;
        font-size: 20px;

        white-space: nowrap;
    }
</style>
