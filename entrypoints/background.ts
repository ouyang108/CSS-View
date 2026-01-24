// import 'webext-bridge/background'
import { onMessage, sendMessage } from 'webext-bridge/background'

export default defineBackground(() => {
  // console.log('Hello background!', { id: browser.runtime.id })
  onMessage('switchStatus', async (message) => {
    const { data } = message
    console.log('Background 收到来自 Content 的消息:', data)

    try {
      // 2. 尝试转发给 Popup
      // 注意：如果 Popup 没打开，这里会 throw error
      await sendMessage('switchStatus', data, 'popup')
      return { status: 'forwarded_to_popup' }
    }
    catch (error) {
      console.log('Popup 当前未打开，消息无法直接送达.error:', error)
      return { status: 'popup_not_active' }
    }
  })
})
