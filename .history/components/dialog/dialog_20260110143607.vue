<script setup>
</script>

<template>
  <div class="dialog">
    <div class="dialog-header">
      <h2>{{ title }}</h2>
    </div>
    <div class="dialog-content">
      <p>{{ content }}</p>
    </div>
    <div class="dialog-footer">
      <button @click="close">
        关闭
      </button>
    </div>
  </div>
</template>

<style lang='scss' scoped>
</style>
