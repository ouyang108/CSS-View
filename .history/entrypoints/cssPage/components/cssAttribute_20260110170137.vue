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
    {{ attribute }}
  </div>
</template>

<style  scoped>
    .css-attribute {
        position: absolute;
    }
</style>
