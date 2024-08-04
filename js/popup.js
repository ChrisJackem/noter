




// TODO :: Full Screen almost works, need many css hacks right now
/* document.getElementById('full-btn').onclick = e =>
    chrome.tabs.create({url:'html/default_popup.html'}) */

// Removed Tooltip
/* show_tooltip_checkbox.onclick = e =>{
    chrome.storage.sync.set({show_tooltip: e.currentTarget.checked})
} 
chrome.storage.sync.get('show_tooltip', response => {
    if (!response.hasOwnProperty('show_tooltip')) response.show_tooltip = true
    show_tooltip_checkbox.checked = response.show_tooltip
})*/

// Disable context menu on this page
window.addEventListener('contextmenu', e => e.preventDefault() )

// Store DOM
const output = document.getElementById('output');
//const actions = document.getElementById('actions');
const content = document.getElementById('content');
const tool_menu = document.getElementById('tools');
const tool_btns = [...tool_menu.getElementsByClassName('tool-btn')];
const show_tooltip_checkbox = document.getElementById('tooltip-box');
const delete_modal = document.getElementById('delete-confirm-modal');

// Button image paths
const img_save = '../img/buttons/save.svg';
const img_rename = '../img/buttons/rename.svg';
const img_copy = '../img/buttons/copy.svg';
const img_plus = '../img/buttons/plus.svg';
const img_minus = '../img/buttons/minus.svg';
const img_x = '../img/buttons/x.svg';

let note_array = null;
const no_notes = `<h3>No Notes Saved...</h3>`;

const dom_parser = new DOMParser();
var output_timer = null;


///////////////////////////////////////////////////////////////// Helpers

const getAllNotes = ()=> [...content.getElementsByClassName('note')];

const escapeHTML = str =>{ 
    return str.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
}

// Output
const writeToOutput = str => {
    if (output_timer){
        window.clearTimeout(output_timer);
    }else{
        output.innerHTML = '';
    }
    output.innerHTML += `<div>${str}</div>`;
    output.classList.add('showing');

    output_timer = window.setTimeout( ()=>{
        output.classList.remove('showing');        
        output_timer = null;
    }, 3000);
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

// Collapseable items in the tool menu
for ( const coll_next of [...document.getElementsByClassName('collapse-next')] ){
    coll_next.onclick = e =>{
        let next_sibling = coll_next.nextElementSibling
        let my_img = coll_next.getElementsByTagName('img')[0]
        next_sibling.classList.toggle('hidden')
        let next_hidden = [...next_sibling.classList].includes('hidden')
        my_img.src = next_hidden ? img_plus : img_minus
    }
}

// call the click on all collapse buttons that match conditions.
// we set save to false because we want to send the message after all buttons are processed
const collapse_all = collapse =>{
    let count = 0;
    for ( const note of getAllNotes() ){
        const collapse_div = note.getElementsByClassName('note-collapse')[0]
        const collapse_btn = note.getElementsByClassName('btn-collapse')[0]
        const is_collapsed = collapse_div.classList.contains('collapsed')        
        if ( collapse ){
            if ( !is_collapsed ){
                count++;
                collapse_btn.onclick(null, false);
            }       
        }else{
            if ( is_collapsed ){
                count++;
                collapse_btn.onclick(null, false);
            }          
        }    
    }
    writeToOutput(`${collapse?'Collapsed':'Expanded'} ${count ? count : 'no'} note${(count>1 || count==0) ? 's' : ''}.`);
    chrome.runtime.sendMessage({ type: "set", value:"notes", data: note_array })
}
document.getElementById('collapse-all').onclick = e => collapse_all( true );
document.getElementById('uncollapse-all').onclick = e => collapse_all( false );


// Delete button initiates delete_modal modal
document.getElementById('delete-all').onclick = e => {
    let length = note_array.length;
    if (length == 0) return;
    showModal( delete_modal, `${length} note${length > 1 ? 's' : ''}`, ()=>{
        note_array = [];
        chrome.runtime.sendMessage({ type: "set", value:"notes", data: [] });
        let count = 0;
        getAllNotes().forEach( n => {
            count++;
            n.remove()
        } );
        content.innerHTML = no_notes;
        writeToOutput(`Deleted ${count?count:'no'} note${count>1 || !count ? 's' : ''}.`);
    });
}

const showModal = ( element, text, callback=null ) => {
    element.classList.remove('hidden');
    let text_node = element.getElementsByClassName('modal-text')[0];
    let btn_y = element.getElementsByClassName('yes')[0];
    let btn_n = element.getElementsByClassName('no')[0];
    if (text_node) text_node.innerHTML = `${text}?`;    
    // confirm
    if  (btn_y){
        btn_y.onclick = () =>{
            element.classList.add('hidden');
            if (callback) callback();       
        }
    }
    // cancel
    if  (btn_n){
        btn_n.onclick = () =>{
            element.classList.add('hidden');
        }
    }
}

//////////////////////////////////////////////////////////////// Notes
const addNote = ( index, name, url, text, collapsed )=>{
    const new_note = content.appendChild( dom_parser.parseFromString(
        `<div class='note' data-index=${index}>
            <div class='note-head'>
                <h3 class='flex-left'>${name}</h3>
                <input type='text' class='hidden' value='${name}' tabindex=1 maxlength="50">                
                <button class='btn-edit tool' text="Edit Note">
                    <img src='${img_rename}'>
                </button>                
                <button class='btn-copy tool' text="Copy to Clipboard">
                    <img src='${img_copy}'>
                </button>                
                <button class='btn-collapse tool' text="${collapsed ? 'Expand Note': 'Collapse Note'}">
                    <img src='${collapsed ? img_plus : img_minus}'>
                </button>                
                <button class='btn-dismiss tool' text="Delete Note">
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
            writeToOutput('Note changed.');
        }
    }
  
    // * pass save to setNoteData
    btn_collapse.onclick = (e, save=true) =>{
        const collapse_div = new_note.getElementsByClassName('note-collapse')[0]        
        const is_collapsed = [...collapse_div.classList].includes('collapsed')
        btn_collapse.innerHTML = `<img src='${ is_collapsed ? img_minus : img_plus}'>`    
        collapse_div.classList.toggle('collapsed')
        setNoteData(index, 'collapsed', !is_collapsed, save)
        btn_collapse.setAttribute('text', is_collapsed ? 'Collapse Note' : 'Expand Note')
    }

    btn_dismiss.onclick = e =>{
        // Modal
        showModal( delete_modal, `${name}`, ()=>{
            let check_index = note_array.map( obj => obj.text ).indexOf(text)
            note_array.splice( check_index, 1 )
            chrome.runtime.sendMessage({ type: "set", value:"notes", data: note_array })
            new_note.remove()
            if (!note_array.length) content.innerHTML = no_notes;
            writeToOutput(`Deleted note.`);
        });
        
        /* let check_index = note_array.map( obj => obj.text ).indexOf(text)
        note_array.splice( check_index, 1 )
        chrome.runtime.sendMessage({ type: "set", value:"notes", data: note_array })
        new_note.remove()
        if (!note_array.length) content.innerHTML = no_notes;
        writeToOutput(`Deleted note.`); */
    }

    btn_copy.onclick = e => {
        navigator.clipboard.writeText( note_text_div.innerText );
        writeToOutput(`Copied note to clipboard.`);
    }
        

    
}


// * Set save to false for batch operations (save later)
const setNoteData = (index, prop, new_val, save=true) =>{
    const obj = note_array[parseInt(index)]
    obj[prop] = new_val
    if (save){
        chrome.runtime.sendMessage({ type: "set", value:"notes", data: note_array })
    }
}

// Init notes
const getNoteData = (()=> {
    try{
        chrome.runtime.sendMessage({ type: "get", value:"notes" }, response =>{
            // There is a bug in chrome... just send to wake up bg worker
            // This usually happens on browser load or after inactivity
        })  
    }catch(E){
        console.log(`Error messaging background worker: ${E}`)
    }
          
    chrome.storage.sync.get('notes', note_data => {
        note_array = note_data.notes || []
        content.innerHTML = note_array.length ? '' : no_notes
        
        note_array.forEach( (note, i)=>{
            const { name, text, url, collapsed } = note
            addNote( i, name, url, text, collapsed )
        })
        window.scrollTo(0, document.body.scrollHeight);
    })

})()