window.onload = () => {
  const refreshTurtorialItem = document.querySelector('.refresh-tutorial-item')
  const completeRefreshTutorialButton = refreshTurtorialItem.querySelector(
    '.complete-todo-item-button'
  )

  completeRefreshTutorialButton.onclick = () => {
    const refreshTutorialTitle =
      refreshTurtorialItem.querySelector('.item-title')
    const refreshTutorialStatusIcon =
      refreshTurtorialItem.querySelector('.item-status')
    const refreshTutorialContent =
      refreshTurtorialItem.querySelector('.todo-content')

    refreshTutorialTitle.classList.add('completed')
    refreshTutorialStatusIcon.src = '../images/onboarding-item-completed.svg'
    refreshTutorialContent.style.display = 'none'

    const learnWhatsNewItem = document.querySelector('.learn-whats-new')

    learnWhatsNewItem.querySelector('.todo-content').style.display = 'flex'

    const learnWhatsNewButton = learnWhatsNewItem.querySelector(
      '.complete-todo-item-button'
    )

    learnWhatsNewButton.onclick = () => {
      learnWhatsNewItem.querySelector('.item-title').classList.add('completed')

      learnWhatsNewItem.querySelector('.item-status').src =
        '../images/onboarding-item-completed.svg'

      learnWhatsNewItem.querySelector('.todo-content').style.display = 'none'
    }
  }
}
