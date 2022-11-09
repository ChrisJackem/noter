
const actions = document.getElementById('actions')
const content = document.getElementById('content')
const tool_menu = document.getElementById('tools')
const tool_btns = [...tool_menu.getElementsByClassName('tool-btn')]
const show_tooltip_checkbox = document.getElementById('tooltip-box')
const getAllNotes = ()=> [...content.getElementsByClassName('note')]
const dom_parser = new DOMParser()

let note_array = null

////////////////////////////////////////////////////////////////// Tools 
// Tool buttons at the top. This basically acts like a tab menu
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
    
// TODO : We can slim this down by combining with the individual buttons
const collapse_all = collapse =>{
    //const all_notes = content.getElementsByClassName('note')
    for ( const note of getAllNotes() ){
        const collapse_div = note.getElementsByClassName('note-collapse')[0]
        const collapse_btn = note.getElementsByClassName('btn-collapse')[0]
        const is_collapsed = collapse_div.classList.contains('collapsed')        
        if ( collapse ){
            if ( !is_collapsed ){
                collapse_btn.innerHTML = '+'
                collapse_div.classList.add('collapsed') 
            }
        }else{
            if ( is_collapsed ){
                collapse_btn.innerHTML = '-'
                collapse_div.classList.remove('collapsed') 
            }
        }
    }
}
document.getElementById('collapse-all').onclick = e => collapse_all( true )
document.getElementById('uncollapse-all').onclick = e => collapse_all( false )

document.getElementById('delete-all').onclick = e => {
    note_array = []
    chrome.storage.sync.set({notes: note_array})
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
                <h4 class='flex-left'>${name}</h4>
                <input type='text' class='hidden' value='${name}' maxlength="50">
                <button class='btn-rename'>Rename</button>
                <button class='btn-copy'>Copy</button>
                <button class='btn-collapse'>${collapsed ? '+' : '-'}</button>
                <button class='btn-dismiss'>x</button>
            </div>
            <div class='note-collapse ${collapsed ? 'collapsed' : ''}'>
                <div class='note-inner'>
                    <pre class='note-text rounded'>${text}</pre>
                </div>
                <div class='note-footer'>
                    <small><a class='note-link' href='${url}'>${url}</a></small>
                </div>
            </div>
        </div>`
    , 'text/html').body.firstChild )
    
    // Actions
    const note_title_h = new_note.getElementsByTagName('h4')[0]
    const note_title_input = new_note.getElementsByTagName('input')[0]
    const btn_collapse = new_note.getElementsByClassName('btn-collapse')[0]
    const btn_dismiss = new_note.getElementsByClassName('btn-dismiss')[0]
    const btn_rename = new_note.getElementsByClassName('btn-rename')[0]
    const btn_copy = new_note.getElementsByClassName('btn-copy')[0]
    const note_anchor = new_note.getElementsByClassName('note-link')[0]

    note_anchor.onclick = 
        e => chrome.tabs.create({ active:true, url:note_anchor.href })

    btn_rename.onclick = e =>{
        const header_showing = [...note_title_h.classList].includes('hidden')
        note_title_input.classList.toggle('hidden')
        note_title_h.classList.toggle('hidden')
        
        if (!header_showing){
            note_title_input.select()
            btn_rename.innerHTML = 'Save'
        }else{
            // Save new name, clean up
            btn_rename.innerHTML = 'Rename'
            note_title_h.innerHTML = note_title_input.value
            setNoteData( index, 'name', note_title_input.value )
        }
    }

    btn_collapse.onclick = e =>{
        const collapse_div = new_note.getElementsByClassName('note-collapse')[0]        
        const is_collapsed = [...collapse_div.classList].includes('collapsed')
        btn_collapse.innerHTML = is_collapsed ? '-' : "+"    
        collapse_div.classList.toggle('collapsed')
        setNoteData(index, 'collapsed', !is_collapsed)
    }

    btn_dismiss.onclick = e =>{        
        note_array.splice( index, 1 )
        chrome.storage.sync.set({notes: note_array})
        new_note.remove()
    }
    btn_copy.onclick = e =>{ 
        let unescape = document.createElement('textarea')
        unescape.innerHTML = text
        navigator.clipboard.writeText( unescape.value )
    }
}

const setNoteData = (index, prop, new_val) =>{
    const obj = note_array[index]
    obj[prop] = new_val
    chrome.storage.sync.set({notes: note_array})
}

// Init notes
const getNoteData = (() => {
    chrome.storage.sync.get('notes', note_data => {
        note_array = note_data.notes
        if (!note_array) return
        note_array.forEach( (note, i)=>{
            const { name, text, url, collapsed } = note
            addNote( i, name, url, text, collapsed )
        })
    });
})()