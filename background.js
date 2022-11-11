
var notes_array = []
let new_notes = 0

const escapeHTML = str =>{ 
  return str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const setNewNotesBadge = ()=>{
  if (!notes_array) return
  //new_notes = notes_array.reduce( ( count, note )=> count += note.viewed ? 0 : 1, 0 )
  const badge_color =  [100,100,100,255] //new_notes ? [0,255,0,255] : [100,100,100,255]
  const note_count = notes_array.length
  chrome.action.setBadgeBackgroundColor( {color: badge_color });
  chrome.action.setBadgeText({ text: note_count ? String(note_count) : '' });  
}

const addNote = ( url, text ) =>{
  notes_array.push({
    name: new Date().toLocaleString(),
    url: url,
    text: escapeHTML(text),
    collapsed: false,
    viewed: false
  })
  //new_notes += 1
  setNewNotesBadge( new_notes )
  chrome.storage.sync.set({notes: notes_array})
}

// Get all notes and prepare
chrome.storage.sync.get('notes', note_data => {
  console.log('retrieving notes', note_data)
  notes_array = note_data.notes || []
  setNewNotesBadge()
})




// Context Menu Item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add',
    title: 'Add new Note',
    contexts: ['selection']
  })  
});

// Get selected text from the content script
// The selectedText leaves out breaks so we have to do this dance
function contextClick( info, tab ) { 
  console.log('Context click')
  chrome.tabs.sendMessage(tab.id, {text: 'get_selected'}, response =>{
    console.log(response)
    response && addNote( info.pageUrl, response )
  })
}
chrome.contextMenus.onClicked.addListener(contextClick)




chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      if ( request.type === "ping"){
        console.log("PINGED")
      }

      // popup requesting all notes
      if (request.type === "get" && request.value === 'notes'){ 
        notes_array.forEach( n => n.viewed = true )
        sendResponse( notes_array )
        setNewNotesBadge()        
        chrome.storage.sync.set({notes: notes_array})        
      }
      /* if (request.type === "get" && request.value === 'notes'){ 
        console.log('getting notes', notes_array)
        //if (!notes_array) sendResponse( [] )     
        notes_array.forEach( n => n.viewed = true )
        setNewNotesBadge()
        chrome.storage.sync.set({notes: notes_array}, ()=>{
          sendResponse( notes_array )
        })
        
      } */

      // popup setting new note values
      if ( request.type === 'set' && request.value === 'notes' ){        
        console.log('NEW DATA:',request.data)
        notes_array = request.data
        chrome.storage.sync.set({notes: notes_array})
        setNewNotesBadge()
      }
      
      // Add a new note
      if ( request.type === 'add' ){
        const { url, text } = request.value
        addNote( url, text )
        setNewNotesBadge()
      }

    }
);

