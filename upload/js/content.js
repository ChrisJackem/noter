// Send the current selection to the background worker
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'get_selected') {
        let selection = document.getSelection()
        sendResponse( selection.toString() )
    }
});

// Chrome makes workers inactive
// This breaks the context menu so we have to do this...
chrome.runtime.sendMessage({ type:"ping"})