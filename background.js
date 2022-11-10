
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
  console.log(notes_array)
  chrome.action.setBadgeBackgroundColor( {color: badge_color });
  chrome.action.setBadgeText({ text: new_notes ? 
    `${new_notes}/${note_count}` : String( note_count ) });  
}


const addNote = obj =>{
  const { name, url, text } = obj
  notes_array.push({
    name: name,
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
chrome.contextMenus.create({
  id: 'add',
  title: 'Add new Note',
  contexts: ['selection']
})





function contextClick(info, tab) {
  const { pageUrl, selectionText } = info
  addNote({
    name: new Date().getDate(),
    url: pageUrl,
    text: selectionText
  })
}
chrome.contextMenus.onClicked.addListener(contextClick)


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
      if (request.type === "get"){        
        notes_array.forEach( n => n.viewed = true )
        setNewNotesBadge()
        chrome.storage.sync.set({notes: notes_array})
        sendResponse( notes_array )
      }
      
      // Add a new note
      if ( request.type === 'add' ){
        addNote( request.value )
        setNewNotesBadge()
      }
    }
);