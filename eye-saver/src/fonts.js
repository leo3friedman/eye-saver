export function injectFonts() {
  const style = document.createElement('style')
  style.className = 'eye-saver-fonts'
  const url = chrome.runtime.getURL('/fonts/Roboto/Roboto-Thin.ttf')
  style.textContent = `
          @font-face {
            font-family: 'roboto-thin';
            src: url(${url});
          }
          @font-face {
            font-family: roboto-regular;
            src: url(${url});
          }
          @font-face {
            font-family: roboto-light;
            src: url(${url});
          }
        `

  document.head.appendChild(style)
}
