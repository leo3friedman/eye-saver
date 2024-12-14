window.onload = () => {
  const pinTutorialItem = document.querySelector('.pin-tutorial-item')
  const completePinTutorialButton = pinTutorialItem.querySelector(
    '.complete-todo-item-button'
  )

  completePinTutorialButton.onclick = () => {
    const pinTutorialTitle = pinTutorialItem.querySelector('.item-title')
    const pinTutorialStatusIcon = pinTutorialItem.querySelector('.item-status')
    const pinTutorialContent = pinTutorialItem.querySelector('.todo-content')

    pinTutorialTitle.classList.add('completed')
    pinTutorialStatusIcon.src = '../images/onboarding-item-completed.svg'
    pinTutorialContent.style.display = 'none'

    const customizeExperienceItem = document.querySelector(
      '.customize-experience-item'
    )

    customizeExperienceItem.querySelector('.todo-content').style.display =
      'flex'

    const completeCustomizeExperienceButton =
      customizeExperienceItem.querySelector('.complete-todo-item-button')

    completeCustomizeExperienceButton.onclick = () => {
      customizeExperienceItem
        .querySelector('.item-title')
        .classList.add('completed')

      customizeExperienceItem.querySelector('.item-status').src =
        '../images/onboarding-item-completed.svg'

      customizeExperienceItem.querySelector('.todo-content').style.display =
        'none'
    }
  }
}
