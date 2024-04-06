export function injectFonts() {
  const style = document.createElement('style')
  style.className = 'eye-saver-fonts'
  const urlThin = chrome.runtime.getURL('/fonts/Roboto/Roboto-Thin.ttf')
  const urlRegular = chrome.runtime.getURL('/fonts/Roboto/Roboto-Regular.ttf')
  const urlLight = chrome.runtime.getURL('/fonts/Roboto/Roboto-Light.ttf')
  style.textContent = `
          @font-face {
            font-family: 'roboto-thin';
            src: url(${urlThin});
          }
          @font-face {
            font-family: roboto-regular;
            src: url(${urlRegular});
          }
          @font-face {
            font-family: roboto-light;
            src: url(${urlLight});
          }
        `

  document.head.appendChild(style)
}
