console.log('Popup js')
const settings = document.getElementById('settings')
const content = document.getElementById('content')

let note_array = null

//chrome.runtime.connect()

const addNote = ( index, name, url, text, collapsed )=>{
    console.log(collapsed)
    // Create nodes from all this
    const new_note = content.appendChild( new DOMParser().parseFromString(
        `<div class='note' data-index=${index}>
            <div class='note-head'>
                <h5 class='flex-left'>${name}</h5>
                <input type='text' class='hidden flex-left rounded' value='${name}'>
                <button class='btn-rename'>Rename</button>
                <button class='btn-collapse'>${collapsed ? '+' : '-'}</button>
                <button class='btn-dismiss'>delete</button>
            </div>
            <div class='note-collapse ${collapsed ? 'collapsed' : ''}'>
                <div class='note-inner'>
                    <div class='note-text rounded'>${text}</div>
                </div>
                <div class='note-footer'>
                    <small><a href='${url}'>${url}</a></small>
                </div>
            </div>
        </div>`
    , 'text/html').body.firstChild )
    
    // Actions
    const note_title_h = new_note.getElementsByTagName('h5')[0]
    const note_title_input = new_note.getElementsByTagName('input')[0]
    const btn_collapse = new_note.getElementsByClassName('btn-collapse')[0]
    const btn_dismiss = new_note.getElementsByClassName('btn-dismiss')[0]
    const btn_rename = new_note.getElementsByClassName('btn-rename')[0]
    const note_anchor = new_note.getElementsByTagName('a')[0]

    // Activate link
    note_anchor.onclick = 
        e => chrome.tabs.create({ active:true, url:note_anchor.href })

    // Collapse button
    btn_collapse.onclick = e =>{
        const collapse_div = new_note.getElementsByClassName('note-collapse')[0]        
        const is_collapsed = [...collapse_div.classList].includes('collapsed')
        btn_collapse.innerHTML = is_collapsed ? '-' : "+"    
        collapse_div.classList.toggle('collapsed')
        setNoteData(index, 'collapsed', !is_collapsed)
    }

    // Rename button
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
}

const setNoteData = (index, prop, new_val) =>{
    console.log(index, prop, new_val)
    //console.log(note_array)
    const obj = note_array[index]
    console.log(obj)
    obj[prop] = new_val
    //console.log(note_array)
    chrome.storage.sync.set({notes: note_array})
}

const getNoteData = (() => {
    chrome.storage.sync.get('notes', note_data => {
        note_array = note_data.notes
        console.log(note_array)
        note_array.forEach( (note, i)=>{
            const { name, text, url, collapsed } = note
            addNote( i, name, url, text, collapsed )
            //index, name, url, text, collapsed
        })
    });
})()
