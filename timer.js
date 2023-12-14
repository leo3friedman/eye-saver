let progress = 0
const length = 10 * 1000

window.onload = () => {
  window.requestAnimationFrame(() => console.log('hello'))

  const timer = document.querySelector('.timer')
  const timerDims = timer.getBoundingClientRect()
  console.log(timerDims)

  const properties = {
    height: timerDims.height,
    width: timerDims.width,
    radius: timerDims.width / 2,
    circumference: timerDims.width * Math.PI,
    strokeWidth: 4,
  }

  const progressRings = document.querySelectorAll('.progress-ring')
  const circle = document.querySelector('.progress-ring__circle')
  const background = document.querySelector('.progress-ring__background')

  progressRings.forEach((ring) => {
    ring.style.height = properties.height
    ring.style.width = properties.width
  })

  circle.setAttribute('stroke-width', properties.strokeWidth)
  circle.setAttribute('r', properties.radius)
  circle.setAttribute('cx', properties.radius)
  circle.setAttribute('cy', properties.radius)

  background.setAttribute('stroke-width', properties.strokeWidth)
  background.setAttribute('r', properties.radius)
  background.setAttribute('cx', properties.radius)
  background.setAttribute('cy', properties.radius)

  circle.style.strokeDasharray = `${properties.circumference} ${properties.circumference}`

  const setProgress = (percent) => {
    const offset =
      properties.circumference - (percent / 100) * properties.circumference
    circle.style.strokeDashoffset = offset
  }

  const start = Date.now()
  const tick = () => {
    const now = Date.now()
    if (now < start + length) {
      const progress = 100 - ((now - start) / length) * 100
      setProgress(progress)
      window.requestAnimationFrame(tick)
    }
  }

  tick()
}
