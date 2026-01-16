/**
 * 定义样式结果的结构
 * 如果是简写属性且无法直接获取，则为 Record<string, string>
 */
type StyleValue = string | Record<string, string>

interface InspectResult {
  property: string
  normal: StyleValue
  current: StyleValue
  hasChanged: boolean
}

/**
 * 高级 CSS 探测器
 */
class CssDeepInspector {
  private tester: HTMLDivElement

  constructor() {
    this.tester = document.createElement('div')
  }

  /**
   * 判断是否为简写关系
   */
  private isShorthand(parent: string, child: string): boolean {
    if (parent === child)
      return false
    if (child.startsWith(`${parent}-`))
      return true

    this.tester.style.cssText = '';
    // 使用 any 绕过类型检查，因为我们需要动态探测任意属性
    (this.tester.style as any)[parent] = 'inherit'
    return (this.tester.style as any)[child] === 'inherit'
  }

  /**
   * 过滤输入：保留最高层级属性
   */
  public filterKeys(inputs: string[]): string[] {
    const unique = [...new Set(inputs)].sort((a, b) => a.length - b.length)
    const final: string[] = []

    for (const curr of unique) {
      if (!final.some(prev => this.isShorthand(prev, curr))) {
        final.push(curr)
      }
    }
    return final
  }

  /**
   * 获取属性的真实计算值 (处理简写属性展开)
   */
  private getPropertyData(dom: HTMLElement, key: string): StyleValue {
    const computed = window.getComputedStyle(dom)
    const value = computed.getPropertyValue(key)

    // 针对 Chrome 无法直接获取 border 等简写值的处理
    // 或者是默认的 0px none 状态进行 fallback 检查
    const isInvalidShorthand = value === '' || value === null
      || (key === 'border' && value.includes('0px none'))

    if (isInvalidShorthand) {
      const subStyles: Record<string, string> = {}
      // 遍历所有计算属性，寻找属于该简写属性的子属性
      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i]
        if (this.isShorthand(key, prop)) {
          subStyles[prop] = computed.getPropertyValue(prop)
        }
      }
      return Object.keys(subStyles).length > 0 ? subStyles : value
    }
    return value
  }

  /**
   * 获取“非 Hover”状态的基准样式 (克隆法)
   */
  private getNormalSnapshot(dom: HTMLElement, keys: string[]): Record<string, StyleValue> {
    const clone = dom.cloneNode(true) as HTMLElement

    // 样式屏蔽，防止克隆体影响页面布局
    Object.assign(clone.style, {
      position: 'fixed',
      pointerEvents: 'none',
      top: '-9999px',
      visibility: 'hidden',
    })

    // 插入到相同父节点以确保上下文样式（如变量、继承）一致
    if (dom.parentNode) {
      dom.parentNode.appendChild(clone)
    }
    else {
      document.body.appendChild(clone)
    }

    const snapshot: Record<string, StyleValue> = {}
    keys.forEach((key) => {
      snapshot[key] = this.getPropertyData(clone, key)
    })

    clone.remove()
    return snapshot
  }

  /**
   * 主执行函数：对比当前与原始状态
   */
  public inspect(dom: HTMLElement, userInput: string[]): InspectResult[] {
    const keys = this.filterKeys(userInput)
    const normalState = this.getNormalSnapshot(dom, keys)

    return keys.map((key) => {
      const current = this.getPropertyData(dom, key)
      const normal = normalState[key]

      // 使用 JSON.stringify 进行深度对比（处理 subStyles 对象）
      const hasChanged = JSON.stringify(normal) !== JSON.stringify(current)

      return {
        property: key,
        normal,
        current,
        hasChanged,
      }
    })
  }
}
const cssDeepInspector = new CssDeepInspector()
export {
  cssDeepInspector,
}

// // --- 使用示例 ---

// const inspector = new CssDeepInspector()
// const inputs = ['border', 'border-right', 'color', 'padding', 'transform']

// document.body.addEventListener('mouseover', (e: MouseEvent) => {
//   const target = e.target as HTMLElement
//   if (!target || target === document.body)
//     return

//   const result: InspectResult[] = inspector.inspect(target, inputs)

//   // 格式化输出
//   console.clear()
//   console.table(result.map(item => ({
//     属性: item.property,
//     原始状态: typeof item.normal === 'object' ? '{Object}' : item.normal,
//     当前状态: typeof item.current === 'object' ? '{Object}' : item.current,
//     Hover变化: item.hasChanged ? '✅ YES' : '❌ NO',
//   })))
// })
