const states = ['DISABLED', 'BREAK_FROM_SCREEN', 'RETURN_TO_SCREEN'];

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create({ periodInMinutes: 0.05 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  const randState = states[Math.floor(Math.random() * 3)];
  chrome.storage.local.set({ state: randState });
});
