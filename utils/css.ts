/**
 * 格式化后的原子样式项
 */
interface FormattedResult {
  label: string
  value: string
}

class CssDeepInspector {
  // 静态缓存，所有实例共享，减少重复探测开销
  private static shorthandCache: Map<string, string[]> = new Map()
  private tester: HTMLDivElement

  constructor() {
    this.tester = document.createElement('div')
    this.tester.style.display = 'none'
    document.body.appendChild(this.tester)
  }

  /**
   * 极致优化：获取某个简写属性下的所有原子子属性
   * 采用“一次探测，终身缓存”策略
   * 建立一套“CSS 属性家谱”
   */
  private getSubProperties(shorthand: string): string[] {
    if (CssDeepInspector.shorthandCache.has(shorthand)) {
      return CssDeepInspector.shorthandCache.get(shorthand)!
    }

    // 探测逻辑：利用 inherit 特性找出受影响的子属性
    this.tester.style.cssText = '';
    (this.tester.style as any)[shorthand] = 'inherit'

    const computed = window.getComputedStyle(this.tester)
    const subs: string[] = []

    // 只在第一次探测时遍历全量属性（约 300-500 个）
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i]
      if (prop !== shorthand && (this.tester.style as any)[prop] === 'inherit') {
        subs.push(prop)
      }
    }

    CssDeepInspector.shorthandCache.set(shorthand, subs)
    return subs
  }

  /**
   * 内部方法：判断 A 是否包含 B
   */
  private isShorthandOf(parent: string, child: string): boolean {
    return this.getSubProperties(parent).includes(child)
  }

  /**
   * 过滤输入：保留最高层级，并去重
   * 过滤用户输入，处理 border 和 border-right 的竞争
   * @param inputs 用户输入的属性数组
   * @returns 过滤后的属性数组
   */
  private filterInputs(inputs: string[]): string[] {
    const unique = [...new Set(inputs)].sort((a, b) => a.length - b.length)
    const final: string[] = []
    for (const curr of unique) {
      if (!final.some(prev => this.isShorthandOf(prev, curr))) {
        final.push(curr)
      }
    }
    return final
  }

  /**
   * 极致提取：将用户输入的 border, border-right 等
   * 全部转化为 [{label, value}] 格式，且不包含重复逻辑
   * @param dom 要提取样式的 DOM 元素
   * @param userInput 用户输入的属性数组
   * @returns 格式化后的原子样式数组
   */
  public extractStyles(dom: HTMLElement, userInput: string[]): FormattedResult[] {
    const computed = window.getComputedStyle(dom)
    const keys = this.filterInputs(userInput)
    const result: FormattedResult[] = []

    for (const key of keys) {
      const val = computed.getPropertyValue(key)

      // 判断是否是需要展开的简写属性
      // 逻辑：如果直接拿到的值是空的，或者是类似 "0px none rgb(0,0,0)" 的复合空值
      const isShorthand = this.getSubProperties(key).length > 0
      const isEmptyShorthand = !val || (key === 'border' && val.includes('0px none'))

      if (isShorthand && isEmptyShorthand) {
        // 极致展开：直接推入原子属性
        const subs = this.getSubProperties(key)
        for (const sub of subs) {
          const subVal = computed.getPropertyValue(sub)
          // 过滤掉无效值/空值（可选）
          if (subVal && subVal !== 'initial' && subVal !== 'none') {
            result.push({ label: sub, value: subVal })
          }
        }
      }
      else if (val) {
        // 普通属性或能直接取到值的简写属性
        result.push({ label: key, value: val })
      }
    }

    return result
  }
}

// 导出单例
export const cssDeepInspector = new CssDeepInspector()
