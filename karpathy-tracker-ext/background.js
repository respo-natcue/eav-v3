// background.js
// Service worker for the Karpathy Updates Chrome Extension.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Andrej Karpathy Updates extension installed.');
  // Future enhancements: could add an alarm here to periodically fetch blogs 
  // and update a badge on the extension icon if there are new ones.
});
