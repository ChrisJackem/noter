
const actions = document.getElementById('actions')
const content = document.getElementById('content')
const tool_menu = document.getElementById('tools')
const tool_btns = [...tool_menu.getElementsByClassName('tool-btn')]
const show_tooltip_checkbox = document.getElementById('tooltip-box')
const getAllNotes = ()=> [...content.getElementsByClassName('note')]
const dom_parser = new DOMParser()

const img_save = '../img/buttons/save.svg'
const img_rename = '../img/buttons/rename.svg'
const img_copy = '../img/buttons/copy.svg'
const img_plus = '../img/buttons/plus.svg'
const img_minus = '../img/buttons/minus.svg'
const img_x = '../img/buttons/x.svg'


let note_array = null


const escapeHTML = str =>{ 
    return str.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

////////////////////////////////////////////////////////////////// Tools 
for ( const tool_btn of tool_btns ){
    tool_btn.onclick = e =>{
        // Reset everything
        [...tool_menu.getElementsByClassName('top-menu')].forEach( d => d.classList.add('hidden'))
        tool_btns.forEach( tb =>{
            if ( tb === tool_btn ) return
            tb.classList.add( 'unselected' )
        })
        // Toggle btn and div id set in data-div
        tool_btn.classList.toggle('unselected')
        if ( !tool_btn.classList.contains('unselected') ){
            const div_id = tool_btn.getAttribute('data-div')
            document.getElementById(div_id).classList.remove('hidden')
        }
    }
}

document.getElementById('full-btn').onclick = e =>
    chrome.tabs.create({url:'html/default_popup.html'})
    
// call the click on all collapse buttons that match conditions.
// we set save to false because we want to send the message after all buttons are processed
const collapse_all = collapse =>{
    for ( const note of getAllNotes() ){
        const collapse_div = note.getElementsByClassName('note-collapse')[0]
        const collapse_btn = note.getElementsByClassName('btn-collapse')[0]
        const is_collapsed = collapse_div.classList.contains('collapsed')        
        if ( collapse ){
            !is_collapsed && collapse_btn.onclick(null, false)            
        }else{
            is_collapsed && collapse_btn.onclick(null, false)            
        }
    }
    chrome.runtime.sendMessage({ type: "set", value:"notes", data: note_array })
}
document.getElementById('collapse-all').onclick = e => collapse_all( true )
document.getElementById('uncollapse-all').onclick = e => collapse_all( false )

document.getElementById('delete-all').onclick = e => {
    note_array = []
    chrome.runtime.sendMessage({ type: "set", value:"notes", data: [] })
    getAllNotes().forEach( n => n.remove() )
}

show_tooltip_checkbox.onclick = e =>{
    chrome.storage.sync.set({show_tooltip: e.currentTarget.checked})
}
chrome.storage.sync.get('show_tooltip', response => {
    if (!response.hasOwnProperty('show_tooltip')) response.show_tooltip = true
    show_tooltip_checkbox.checked = response.show_tooltip
})

//////////////////////////////////////////////////////////////// Notes

const addNote = ( index, name, url, text, collapsed )=>{
    const new_note = content.appendChild( dom_parser.parseFromString(
        `<div class='note' data-index=${index}>
            <div class='note-head'>
                <h3 class='flex-left'>${name}</h3>
                <input type='text' class='hidden' value='${name}' tabindex=1 maxlength="50">                
                <button class='btn-edit'>
                    <img src='${img_rename}'>
                </button>                
                <button class='btn-copy'>
                    <img src='${img_copy}'>
                </button>                
                <button class='btn-collapse'>
                    <img src='${collapsed ? img_plus : img_minus}'>
                </button>                
                <button class='btn-dismiss'>
                    <img src='${img_x}'>
                </button>
            </div>
            <div class='note-collapse ${collapsed ? 'collapsed' : ''}'>
                <div class='note-inner'>
                    <pre class='note-text rounded' spellcheck=false tabindex=2>${text}</pre>
                    
                </div>
                <div class='note-footer'>
                    <small><a class='note-link' href='${url}'>${url}</a></small>
                </div>
            </div>
        </div>`
    , 'text/html').body.firstChild )
    
    // Actions
    const note_title_h = new_note.getElementsByTagName('h3')[0]
    const note_title_input = new_note.getElementsByTagName('input')[0]
    const btn_collapse = new_note.getElementsByClassName('btn-collapse')[0]
    const btn_dismiss = new_note.getElementsByClassName('btn-dismiss')[0]
    const btn_edit = new_note.getElementsByClassName('btn-edit')[0]
    const btn_copy = new_note.getElementsByClassName('btn-copy')[0]
    const note_anchor = new_note.getElementsByClassName('note-link')[0]
    const textarea = new_note.getElementsByTagName('textarea')[0]
    const note_text_div = new_note.getElementsByTagName('pre')[0]

    note_anchor.onclick = 
        e => chrome.tabs.create({ active:true, url:note_anchor.href })

    btn_edit.onclick = e =>{
        const header_showing = [...note_title_h.classList].includes('hidden')
        note_title_input.classList.toggle('hidden')
        note_title_h.classList.toggle('hidden')
        note_text_div.setAttribute('contenteditable', !header_showing)
        note_text_div.classList.toggle('editable')
        
        if (!header_showing){
            note_title_input.select()
            btn_edit.innerHTML = `<img src='${img_save}'>`
        }else{
            // Save 
            btn_edit.innerHTML = `<img src='${img_rename}'>`
            note_title_h.innerHTML = note_title_input.value
            let escaped = escapeHTML(note_text_div.innerText)          
            setNoteData( index, 'name', note_title_input.value )
            setNoteData( index, 'text',  escaped )
            //note_text_div.innerHTML = escaped
        }
    }

    

    // * pass save to setNoteData
    btn_collapse.onclick = (e, save=true) =>{
        console.log('collapse click',save)
        const collapse_div = new_note.getElementsByClassName('note-collapse')[0]        
        const is_collapsed = [...collapse_div.classList].includes('collapsed')
        btn_collapse.innerHTML = `<img src='${ is_collapsed ? img_minus : img_plus}'>`    
        collapse_div.classList.toggle('collapsed')
        setNoteData(index, 'collapsed', !is_collapsed, save)
    }

    btn_dismiss.onclick = e =>{        
        note_array.splice( index, 1 )
        chrome.runtime.sendMessage({ type: "set", value:"notes", data: note_array })
        new_note.remove()
    }

    btn_copy.onclick = e => 
        navigator.clipboard.writeText(note_text_div.innerText)
}


// * Set save to false for batch operations (save later)
const setNoteData = (index, prop, new_val, save=true) =>{
    console.log(index, prop, new_val)
    const obj = note_array[parseInt(index)]
    obj[prop] = new_val
    if (save){
        chrome.runtime.sendMessage({ type: "set", value:"notes", data: note_array })
    }
}

// Init notes
const getNoteData = (() => {   
    chrome.runtime.sendMessage({ type: "get", value:"notes" }, response =>{
        note_array = response
        note_array.forEach( (note, i)=>{
            const { name, text, url, collapsed } = note
            addNote( i, name, url, text, collapsed )
        })
    });
})()