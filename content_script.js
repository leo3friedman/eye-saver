// const props = {}

// const showOverlay = () => {
//   chrome.storage.sync.get(props.defaults, (result) => {
//     console.log('time to rest!')
//     addCanvas()
//     setTimeout(initiateRestEnd, result.restDuration)
//   })
// }

// const removeCanvas = () => {
//   console.log('remove canvas!')
//   document
//     .querySelectorAll('.eye-saver__overlay')
//     .forEach((canvas) => document.body.removeChild(canvas))
// }

// const initiateRestEnd = () => {
//   removeCanvas()
//   chrome.runtime.sendMessage(props.messages.INITIATE_REST_END)
// }

// const addCanvas = () => {
//   const canvas = document.createElement('canvas')
//   canvas.className = 'eye-saver__overlay'

//   styles = {
//     height: '100vh',
//     width: '100vw',
//     position: 'fixed',
//     top: '0',
//     left: '0',
//     background: 'black',
//     opacity: '.4',
//     zIndex: Number.MAX_SAFE_INTEGER,
//   }

//   Object.keys(styles).forEach((key) => {
//     canvas.style[key] = styles[key]
//   })

//   document.body.appendChild(canvas)
// }

// chrome.storage.onChanged.addListener((changes, area) => {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     if (key === 'mode' && newValue === props.modes.BREAK_TIME) {
//       showOverlay()
//     }
//   }
// })

// window.onload = async () => {
//   props.enumsSrc = await import(chrome.runtime.getURL('enums.js'))
//   props.defaults = props.enumsSrc.defaults
//   props.messages = props.enumsSrc.messages
//   props.modes = props.enumsSrc.modes
// }
