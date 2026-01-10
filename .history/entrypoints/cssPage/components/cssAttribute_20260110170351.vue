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
    123
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
</style>
