var selected = null
const arrow_size = 20

//chrome.runtime.connect()

// Factories
const createNode = ({ type, id, classes, html } = obj ) => {  
    const node = document.createElement(type)
    if (id){ node.setAttribute('id', id) }
    if (classes){ classes.forEach( c => node.classList.add(c) )}
    if (html){ node.innerHTML = html }
    return node
}

const createBtn = (name, classes, on_click) =>{
    const btn = createNode({ type: 'button', id: name, html: name,
        classes: classes ? [...classes, 'noter-btn'] : ['noter-btn', 'rounded']        
    })   
    btn.addEventListener( 'click', on_click )
    return btn
}

// ToolTip 
const tool_tip = document.body.appendChild( createNode(
     { type:'div', id:'tool-tip', classes:['hidden']//, html:'Noter'
}))

tool_tip.appendChild( createBtn( 'Copy', null, e =>{
    navigator.clipboard.writeText( selected )
}))

//chrome.storage.sync.set({notes: []})
tool_tip.appendChild( createBtn( 'Add', null, e =>{
    if (selected) {

        // Append new object to note_data
        chrome.storage.sync.get('notes', note_data => {            
            const url = window.location.href
            const date = new Date().toLocaleString()
            const new_note = {
                name: date,
                collapsed: false,
                url: url,
                text: selected
            }
            note_data.notes.push(new_note)
            console.log('notes', note_data.notes)
            chrome.storage.sync.set({notes: note_data.notes})
        })

        tool_tip.classList.add('hidden')
    }
}))


addEventListener('resize', e => tool_tip.classList.add('hidden') )

document.addEventListener('mouseup', () => {
    console.log('UP')
    const selection = document.getSelection();
    const anchor_node = selection.anchorNode;
    const focus_node = selection.focusNode;
    selected = selection.toString()

    // No selection
    if ( !selection || selection.isCollapsed /* ||  anchor_node != focus_node  */){
        tool_tip.classList.add('hidden')
        return
    }    
    const selected_text = anchor_node.data.substring(selection.anchorOffset, selection.focusOffset);  
    const range_rect = selection.getRangeAt(0).getBoundingClientRect();
    const x = (range_rect.x + ( range_rect.width / 2 ) ) + scrollX
    const y = range_rect.top + scrollY - arrow_size    
    tool_tip.style.left = `${x}px`;
    tool_tip.style.top = `${y}px`;    
    tool_tip.classList.remove('hidden')
  })