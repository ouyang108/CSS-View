<script setup>
defineProps({
  title: {
    type: String,
    default: '提示',
  },
  content: {
    type: String,
    default: '这是一条提示信息',
  },
})
</script>

<template>
  <Teleport to="body">
    <div class="dialog">
      <div class="dialog-header">
        <h2>{{ title }}</h2>
      </div>
      <div class="dialog-content">
        <p>{{ content }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style lang='scss' scoped>
</style>
