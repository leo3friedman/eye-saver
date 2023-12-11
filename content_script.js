chrome.storage.onChanged.addListener((changes, area) => {
  const newState = changes?.state?.newValue;
  switch (newState) {
    case 'DISABLED':
      console.log('time to disable extension');
      break;
    case 'BREAK_FROM_SCREEN':
      console.log('time to take a break from the screen');
      break;
    case 'RETURN_TO_SCREEN':
      console.log('time to return to screen');
      break;
  }
});

window.onload = () => {};
