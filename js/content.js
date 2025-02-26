
// Send the current selection to the background worker
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'get_selected') {
        let selection = document.getSelection();
        sendResponse( selection.toString() );
    }
});

// Chrome makes workers inactive sometimes - This breaks the context menu
chrome.runtime.sendMessage({ type:"ping"});