console.log('Popup js')
const settings = document.getElementById('settings')
const content = document.getElementById('content')

let note_array = null

chrome.runtime.connect()

const addNote = ( index, date, url, text )=>{

    // Create nodes from all this
    const new_note = content.appendChild( new DOMParser().parseFromString(
        `<div class='note' data-index=${index}>
            <div class='note-head'>
                <h5>${date}</h5>
                <button class='btn-collapse'>-</button>
                <button class='btn-dismiss'>delete</button>
            </div>
            <div class='note-collapse collapsed'>
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
    const btn_collapse = new_note.getElementsByClassName('btn-collapse')[0]
    const btn_dismiss = new_note.getElementsByClassName('btn-dismiss')[0]

    btn_collapse.onclick = e =>{
        const collapse_div = new_note.getElementsByClassName('note-collapse')[0]
        
        const is_collapsed = collapse_div.classList.contains('collapsed')        
        collapse_div.classList.toggle('collapsed')
       

        console.log(collapse_div)
    }



    //console.log(index, btn_dismiss) 

}

const createLinks = ()=>{
    [...document.getElementsByTagName('a')].forEach( a =>{
        a.onclick = e =>{
            chrome.tabs.create({ active:true, url:a.href })
        }
    })
}


chrome.runtime.sendMessage({ ask: "note_data"}, response => {
    //console.log(response.note_data);
    response.note_data.forEach( (note, i)=>{
        const { date, text, url } = note
        addNote( i, date, url, text )
    })
    createLinks()
});

/* chrome.storage.sync.get('notes', note_data => {
    note_array = note_data.notes
    note_array.forEach( (note, i)=>{
        const { date, text, url } = note
        addNote( i, date, url, text )
    })
    createLinks()
}); */


