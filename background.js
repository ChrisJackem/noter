
let notes_array = null
let new_notes = 0

//let fake_dom = new DOMImplementation().createHTMLDocument()

//console.log('Ok', fake_dom)



const escapeHTML = str =>{ 
  return str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const setNewNotesBadge = ()=>{
  new_notes = notes_array.reduce( ( count, note )=> count += note.viewed ? 0 : 1, 0 )
  const badge_color = new_notes ? [0,255,0,255] : [100,100,100,255]
  const note_count = notes_array.length
  chrome.action.setBadgeBackgroundColor( {color: badge_color });
  chrome.action.setBadgeText({ text: new_notes ? 
    `${new_notes}/${note_count}` : note_count ? String(note_count) : '' });  
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
    notes_array = note_data.notes || []
    setNewNotesBadge()
})


// Context Menu Item

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add',
    title: 'Add new Note',
    contexts: ['selection', 'page']
  })

  function contextClick( info, tab ) {
    console.log(info, tab )
    addNote( info.pageUrl, info.selectionText)   
  }
  chrome.contextMenus.onClicked.addListener(contextClick)
});




/* chrome.runtime.onConnect.addListener( port =>{
    console.log('connect')

    port.onDisconnect.addListener(()=>{
        console.log('disconnect')
    })
})
 */






chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      // popup requesting all notes
      if (request.type === "get" && request.value === 'notes'){      
        notes_array.forEach( n => n.viewed = true )
        setNewNotesBadge()
        chrome.storage.sync.set({notes: notes_array})
        sendResponse( notes_array )
      }

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