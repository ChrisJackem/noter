console.log('Popup js')
const settings = document.getElementById('settings')
const content = document.getElementById('content')

const addNote = ( date, url, text )=>{
    content.innerHTML += 
    `<div class='note'>
        <h5>${date}</h5>
        <div class='note-inner'>${text}</div>
        <small><a href='${url}'>${url}</a></small>
    </div><hr>`
}

const createLinks = ()=>{
    [...document.getElementsByTagName('a')].forEach( a =>{
        a.onclick = e =>{
            chrome.tabs.create({ active:true, url:a.href })
        }
    })
}

chrome.storage.sync.get('notes', note_data => {
    for( let note of note_data.notes ){
        const { date, text, url } = note
        addNote( date, url, text )
    }
    createLinks()
});


