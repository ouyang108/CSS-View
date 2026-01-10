<script setup lang="ts">
import { storage } from '#imports'
import { watch } from 'vue'
import { useReset } from '@/hooks/useReset'

// interface PreviewData {
//   borderColor: string
//   borderStyle: string
//   switch: boolean
//   keyConfig: string
// }
// 实时预览数据
const { state: previewData, reset } = useReset({
  borderColor: '#000000',
  borderStyle: 'solid',
  switch: false,
  keyConfig: '',
})

function resets() {
  reset()
}
// 保存配置
function saveConfig() {
  storage.setItem('local:inspectConfig', JSON.stringify(previewData))
  //   提示保存成功
}
watch(() => previewData.switch, (newVal) => {
  if (!newVal) {
    previewData.keyConfig = ''
  }
})
onMounted(async () => {
  const config: string | null = await storage.getItem('local:inspectConfig')
  if (config) {
    for (const key in previewData) {
      if (key in previewData) {
        previewData[key] = JSON.parse(config)[key]
      }
    }
  }
})
</script>

<template>
  <div>
    <div class="header">
      <h1>css Inspect配置</h1>
    </div>

    <div class="config-section">
      <!-- 边框颜色配置 -->
      <div class="config-item">
        <label class="config-label">边框颜色</label>
        <input id="borderColor" v-model="previewData.borderColor" type="color">
      </div>

      <!-- 边框样式配置 -->
      <div class="config-item">
        <label class="config-label">边框样式</label>
        <select id="borderStyle" v-model="previewData.borderStyle">
          <option value="solid">
            实线
          </option>
          <option value="dashed">
            虚线
          </option>
          <option value="dotted">
            点线
          </option>
          <option value="double">
            双线
          </option>
        </select>
      </div>

      <!-- 按键配置开关 -->
      <div class="config-item">
        <label class="config-label">启用按键触发</label>
        <label class="toggle-switch">
          <input id="enableKeyConfig" v-model="previewData.switch" type="checkbox">
          <span class="slider" />
        </label>
      </div>

      <!-- 自定义按键配置 -->
      <div id="keyConfigContainer" class="config-item">
        <label class="config-label">触发按键</label>
        <p class="config-desc">
          输入自定义按键（例如：Ctrl+Shift+L）
        </p>
        <input id="customKey" v-model="previewData.keyConfig" type="text" placeholder="请输入触发按键" :disabled="!previewData.switch">
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section">
      <p class="preview-text">
        实时预览
      </p>
      <div
        id="previewBox" class="preview-box" :style="{
          borderColor: previewData.borderColor,
          borderStyle: previewData.borderStyle,
        }"
      >
        预览区域
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="btn-container">
      <button id="saveBtn" class="btn-save" @click="saveConfig">
        保存配置
      </button>
      <button id="resetBtn" class="btn-reset" @click="resets">
        重置默认
      </button>
    </div>
  </div>
</template>

<style  scoped>
    @import './setting.css';
</style>
