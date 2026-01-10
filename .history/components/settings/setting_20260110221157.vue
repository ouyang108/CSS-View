<script setup lang="ts">
import type { ToastOptions } from 'vue3-toastify'
import { storage } from '#imports'
import { watch } from 'vue'
import { toast } from 'vue3-toastify'
import { sendMessage } from 'webext-bridge/popup'
import { default_CONFIG, local_CONFIG } from '@/constants'
import { useReset } from '@/hooks/useReset'

// 实时预览数据
const { state: previewData, reset } = useReset(default_CONFIG)
// 键盘事件的取消函数
let keyupEventCancle: any
// 是否已经绑定过
let isBind = false
function resets() {
  reset()
}
// 发送消息
async function sendConfig() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    await sendMessage(
      'config',
      { previewData },
      `content-script@${tabs[0].id}`,
    )
  }
  catch (error) {
    console.error('Error sending config:', error)
  }
}
// 保存配置
function saveConfig() {
  storage.setItem(local_CONFIG, JSON.stringify(previewData))
  //   提示保存成功
  notify()
  sendConfig()
}
function notify() {
  toast('保存成功', {
    autoClose: 1000,
    position: toast.POSITION.TOP_CENTER,
  } as ToastOptions)
}
// 监听键盘事件
function keydownListener() {
  if (isBind)
    return
  const keyupEvent = (e: KeyboardEvent) => {
    // 获取按下的键
    const key = e.key
    console.log(key)
  }
  document.addEventListener('keydown', (keyupEvent))
  return document.removeEventListener('keydown', keyupEvent)
}
// 输入框获取焦点
function focus() {
  keyupEventCancle = keydownListener()
}
function blur() {
  if (keyupEventCancle) {
    keyupEventCancle()
    keyupEventCancle = null
  }
}
watch(() => previewData.switch, (newVal) => {
  if (!newVal) {
    previewData.keyConfig = ''
  }
})
onMounted(async () => {
  const config: string | null = await storage.getItem(local_CONFIG)
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

      <!-- 自定义按键配置 -->
      <div id="keyConfigContainer" class="config-item">
        <label class="config-label">触发按键</label>
        <p class="config-desc">
          输入自定义按键（例如：Ctrl+Shift+L）
        </p>
        <input
          id="customKey" v-model="previewData.keyConfig" type="text" placeholder="请输入触发按键" @focus="focus"
          @blur="blur"
        >
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
