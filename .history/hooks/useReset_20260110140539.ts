import type { Reactive, Ref, UnwrapRef } from 'vue'
import { isArray, isObject, isRef, reactive } from 'vue'

// 优化深拷贝函数（补充基础类型处理，避免 JSON 序列化的局限性）
function deepClone<T>(obj: T): T {
  // 处理基础类型和 null/undefined
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理数组
  if (isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }

  // 处理普通对象（排除 Date/RegExp 等特殊对象，如需支持可扩展）
  if (isObject(obj)) {
    const clonedObj = {} as Record<string, any>
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone((obj as Record<string, any>)[key])
      }
    }
    return clonedObj as T
  }

  // 兜底：兼容无法深拷贝的类型（如 Symbol/函数）
  return JSON.parse(JSON.stringify(obj)) as T
}

/**
 * 用于重置响应式状态的组合式函数
 * @param value - 初始值（支持普通值、Ref、响应式对象/数组）
 * @returns 响应式状态 + 重置方法
 */
export function useReset<T extends object | any[]>(
  value: T | Ref<T>,
): {
  state: Reactive<UnwrapRef<T>>
  reset: (keysToPreserve?: string | string[]) => void
} {
  // 解包 Ref，获取原始初始值
  const rawInitialValue = isRef(value) ? value.value : value
  // 缓存初始值的深拷贝（确保初始值不被外部修改影响）
  const initialValue = deepClone(rawInitialValue)

  // 创建响应式状态（自动推导 UnwrapRef 后的类型）
  const state = reactive(deepClone(initialValue)) as Reactive<UnwrapRef<T>>

  // 重置方法：支持保留指定键值，严格类型约束
  const reset = (keysToPreserve?: string | string[]) => {
    // 标准化保留键为 Set，提升查找效率
    const preserveKeys = new Set<string>(
      Array.isArray(keysToPreserve) ? keysToPreserve : keysToPreserve ? [keysToPreserve] : [],
    )

    // 保存需要保留的值（严格类型约束 state 的键）
    const preservedValues: Partial<UnwrapRef<T>> = {}
    preserveKeys.forEach((key) => {
      if (key in state) {
        preservedValues[key as keyof UnwrapRef<T>] = state[key as keyof UnwrapRef<T>]
      }
    })

    // 数组重置 - 保持响应式的同时替换内容
    if (isArray(state)) {
      state.splice(0, state.length, ...deepClone(initialValue))
    }
    // 对象重置 - 先清除现有属性再合并初始值
    else if (isObject(state)) {
      Object.keys(state).forEach((key) => {
        delete (state as Record<string, any>)[key]
      })
      Object.assign(state, deepClone(initialValue))
    }

    // 恢复保留的值（覆盖重置后的值，严格类型）
    Object.entries(preservedValues).forEach(([key, val]) => {
      (state as Record<string, any>)[key] = val
    })
  }

  return { state, reset }
}
