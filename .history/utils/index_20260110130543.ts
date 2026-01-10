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
// 找出所有能滚动的元素
export function findScrollableElements() {
  const scrollable: HTMLElement[] = []
  document.querySelectorAll('*').forEach((el) => {
    const elNode = el as HTMLElement
    const style = window.getComputedStyle(elNode)
    if (
      (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll')
      && elNode.scrollHeight > elNode.clientHeight
    ) {
      scrollable.push(elNode)
    }
  })
  return scrollable
}
