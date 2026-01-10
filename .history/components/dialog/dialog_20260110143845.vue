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
  show: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <Teleport v-if="show" to="body">
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

<style scoped>
  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    z-index: 9999;

  }
</style>
