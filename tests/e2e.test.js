const puppeteer = require('puppeteer')
const {
  currentElapsed,
  totalElapsed,
  assertDuration,
  assertNotInClassList,
  assertInClassList,
  withinError,
} = require('./testUtils')
const EXTENSION_PATH = './eyeSaver'
const EXTENSION_ID = 'fmgfnbafohlkohficcnbjdkekhiiliga'

let browser

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    // headless: 'new',
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  })
})

afterEach(async () => {
  await browser.close()
  browser = undefined
})

// const getText = async (page, selector) => {
//   await page.waitForSelector(selector)
//   return page.$eval(selector, (el) => el.innerText)
// }

// const getTimerDuration = async (page) => {
//   const timerText = await getText(page, '.timer-duration')
//   return timerText.split(':').map((d) => Number(d))
// }

// const hasClassName = async (page, selector, className) => {
//   return await page.$eval(
//     selector,
//     (el, className) => {
//       return el.classList.contains(className)
//     },
//     className
//   )
// }

// /**
//  *
//  * @param {*} page
//  * @param {number[]} durations expressed as [hours, minutes, seconds]
//  */
// const assertDuration = async (page, duration) => {
//   expect(await getTimerDuration(page)).toEqual(duration)
// }

// const totalElapsed = (timestamp) => {
//   return Math.floor((Date.now() - timestamp) / 1000)
// }
// const currentElapsed = (timestamp) => {
//   return Math.floor((Date.now() - timestamp) / 1000) % 15
// }
// const clickElement = async (page, selector) => {
//   await page.$eval(selector, (el) => el.click())
// }

const screenDuration = 10 * 1000
const restDuration = 5 * 1000
const defaultError = 1000

const inCriticalZone = (elapsed, error) => {
  const restStart = restDuration
  const restEnd = screenDuration + restDuration
  return (
    !withinError(elapsed, restStart, error) &&
    !withinError(elapsed, restEnd, error)
  )
}

test('popup ticks, finishes and restarts correctly', async () => {
  const page = await browser.newPage()
  await page.goto(`chrome-extension://${EXTENSION_ID}/popup.html`)

  const timestamp = Date.now()

  while (totalElapsed(timestamp) < 20000) {
    const elapsed = currentElapsed(timestamp)

    if (inCriticalZone(elapsed, defaultError)) continue

    const isResting = elapsed > screenDuration

    const allowedError = isResting ? 0 : 1000
    const expectedDuration = Math.max(10000 - elapsed, 0)

    await assertDuration(page, expectedDuration, allowedError)

    isResting
      ? await assertInClassList(page, '.timer-duration', 'blink')
      : await assertNotInClassList(page, '.timer-duration', 'blink')

    await page.waitForTimeout(1000)
  }
}, 25000)

// test('popup cancels and starts correctly', async () => {
//   const page = await browser.newPage()
//   await page.goto(`chrome-extension://${EXTENSION_ID}/popup.html`)

//   let timestamp = Date.now()
//   await page.waitForTimeout(1000)
//   await assertDuration(page, [0, 0, 9 - Math.min(currentElapsed(timestamp), 9)])
//   await clickElement(page, '.timer__cancel-button')
//   await assertDuration(page, [0, 0, 10])
//   await page.waitForTimeout(2000)
//   await assertDuration(page, [0, 0, 10])
//   await clickElement(page, '.timer__start-button')
//   timestamp = Date.now()
//   await page.waitForTimeout(1000)
//   await assertDuration(page, [0, 0, 9 - Math.min(currentElapsed(timestamp), 9)])
// }, 10000)
