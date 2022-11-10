console.log("bg")

let notes_array = null
chrome.storage.sync.get('notes', note_data => {
    notes_array = note_data.notes
})

chrome.runtime.onConnect.addListener( port =>{
    console.log('connect')

    port.onDisconnect.addListener(()=>{
        console.log('disconnect')
    })
})

chrome.contextMenus.create({
  id: 'foo',
  title: 'first',
  contexts: ['action']
})

function contextClick(info, tab) {
  const { menuItemId } = info

  if (menuItemId === 'foo') {
    // do something
  }
}





chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log('msg-', request)
      if (request.ask === "note_data"){
        sendResponse({note_data: notes_array})
      }
      
      if (request.add){
        console.log(request)
        sendResponse({ok: true})
      }
    }
);