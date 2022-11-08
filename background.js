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