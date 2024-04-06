export async function createDevUI() {
  chrome.windows.getAll({ populate: true }, (windows) => {
    const windowExists = windows.some((w) => w?.type === 'popup')
    if (!windowExists)
      chrome.windows.create({
        url: chrome.runtime.getURL('src/devUI.html'),
        type: 'panel',
        width: 400,
        height: 300,
      })
  })
}
