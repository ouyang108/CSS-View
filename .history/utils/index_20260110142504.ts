import { storage } from '#imports'

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
