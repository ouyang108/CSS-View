import type { ToastOptions } from 'vue3-toastify'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

export function debounce<T extends (..._args: any[]) => any>(fn: T, delay: number) {
  let timer: number | null = null
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
// 判断是否是 mac 系统
// export const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
export function notify(message = '保存成功') {
  toast(message, {
    autoClose: 1000,
    position: toast.POSITION.TOP_CENTER,
  } as ToastOptions)
}
