
import cssPage from './cssPage/index.vue'
export default defineContentScript({
  matches: ['*://*.google.com/*'],
  main(ctx) {
    console.log('Hello content.');
    const ui = createIntegratedUi(ctx, {
      position: 'overlay',
      anchor: 'body',
      onMount: (container) => {
        // 在容器中添加UI组件
        const app = document.createElement('p');
        app.textContent = 'Hello world!';
        container.append(app);
      },
    });

    ui.mount();
  },
});
