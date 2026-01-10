<script setup>
onMounted(() => {
  addEventListener('click', () => {
    alert('点击了测试弹框')
  })
})
</script>

<template>
  <div class="css-inspect">
    测试弹框
  </div>
</template>

<style scoped>
.css-inspect {
  position: fixed;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24px;
  text-align: center;
  line-height: 100px;
}
</style>
