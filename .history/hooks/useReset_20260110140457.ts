import type { Reactive } from 'vue'
import { isRef, reactive } from 'vue'
// 深拷贝函数，避免使用 JSON.parse(JSON.stringify) 的局限性
function deepClone(obj: any) {
  return JSON.parse(JSON.stringify(obj))
  // 或者使用更健壮的实现，比如 lodash 的 cloneDeep
  // return _.cloneDeep(obj);
}

export function useReset<T>(value: T | Ref<T>) {
  // 缓存初始值的深拷贝，避免重复克隆提高性能
  const initialValue = deepClone(isRef(value) ? value.value : value)

  // 基于初始值创建响应式状态（自动推导类型）
  const state: Reactive<T> = reactive(deepClone(initialValue))

  // 重置方法，优化参数类型和处理逻辑
  const reset = (keysToPreserve?: string | string[]) => {
    // 标准化保留键为Set，提升查找效率
    const preserveKeys = new Set<string>(
      Array.isArray(keysToPreserve) ? keysToPreserve : keysToPreserve ? [keysToPreserve] : [],
    )

    // 保存需要保留的值
    const preservedValues: Record<string, any> = {}
    preserveKeys.forEach((key) => {
      if (key in state) {
        preservedValues[key] = state[key]
      }
    })

    // 统一重置逻辑：基于缓存的初始值进行重置
    if (Array.isArray(state)) {
      // 数组重置 - 保持响应式的同时替换内容
      state.splice(0, state.length, ...deepClone(initialValue))
    }
    else {
      // 对象重置 - 先清除现有属性再合并初始值
      Object.keys(state).forEach(key => delete state[key])
      Object.assign(state, deepClone(initialValue))
    }

    // 恢复保留的值（覆盖重置后的值）
    Object.entries(preservedValues).forEach(([key, val]) => {
      state[key] = val
    })
  }

  return { state, reset }
}
