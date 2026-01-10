type JsonPrimitive = string | number | boolean | null
interface JsonObject { [key: string]: JsonPrimitive | JsonObject | JsonArray }
type JsonArray = Array<JsonPrimitive | JsonObject | JsonArray>
export interface ConfigMessageData {
  data: {
    previewData?: JsonObject // 明确 previewData 的类型，根据实际需求调整
  }
  // 可补充其他必要属性，比如 messageType 等
}
type OnMessageCallback<T> = (_data: T) => Promise<void> | void
declare function onMessage<T = unknown>(
  _type: string,
  _callback: OnMessageCallback<T>,
): () => void
