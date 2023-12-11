chrome.storage.onChanged.addListener((changes, area) => {
  console.log('Storage Changed');
});

window.onload = () => {
  console.log('HELLO?');
};
