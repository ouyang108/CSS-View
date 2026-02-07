export interface FormattedResult {
  label: string
  value: string
  isContenteditable: boolean
  // 原始值
  originValue?: string
  // 标记是否被修改过
  isDirty?: boolean
}
