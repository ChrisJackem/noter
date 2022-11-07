var selected = null
const arrow_size = 20

//////////////////// Factories ///////////////////
const createNode = (type, o) => {    
    const node = document.createElement(type)
    if (o.id){ node.setAttribute('id', o.id) }
    if (o.classes){ o.classes.forEach( c => node.classList.add(c) )}
    if (o.html){ node.innerHTML = o.html }
    return node
}

const createBtn = (name, classes, on_click) =>{
    const btn = createNode( 'button', {
        id: name,
        classes: classes ? [...classes, 'noter-btn'] : ['noter-btn'],
        html: name
    })   
    btn.addEventListener( 'click', on_click )
    return btn
}

const addTitleBar = (element, title, classes='') =>{
    element.innerHTML = 
        `<div class='noter-title ${classes}'>
            <h3 style='margin-right: auto'>${title}</h3>
        </div>`
}

//////////////// Text Window ///////////////
const notes = document.body.appendChild( createNode( 'div', { 
    id:'note-panel', classes:[], html:'Noter'
}))
const notes_inner = notes.appendChild( createNode( 'div', { id:'notes-inner' }))

//////////////////// ToolTip //////////////////////
const tool_tip = document.body.appendChild( createNode( 'div', { 
    id:'tool-tip', classes:['hidden'], html:'Noter'
}))

tool_tip.appendChild( createBtn( 'Copy', null, e =>{
    console.log('Copy')
}))

tool_tip.appendChild( createBtn( 'Add', null, e =>{
    if (selected) {      

        /* let s = JSON.stringify(selected).replaceAll('"', '')
         console.log(s)
        s=  s.replace(/(?:\r\n|\r|\n)/g, '<br/>') */
                 
        /* notes_inner.innerHTML +=
            s.replace(/(?:\r\n|\r|\n)/g, '<br/>')
            //selected.replace(/(?:\r\n|\r|\n)/g, '<br/>') */

        let s = selected.replace(/(?:\r\n|\r|\n)/g, '<br/>')
        console.log(s)
            s = s.replaceAll(' ', '&nbsp')
            console.log(s)
        
        //notes_inner.innerHTML += JSON.stringify(selected)
        notes_inner.insertAdjacentText('beforeend',`${selected}` )  //breaked.replace(/(?:\r\n|\r|\n)/g, 'AHHHHHH');
        //notes_inner.innerHTML = `<pre>${selected}</pre>`//breaked.replace(/(?:\r\n|\r|\n)/g, 'AHHHHHH');
    }
}))

// Hide tooltip 
addEventListener('resize', e => tool_tip.classList.add('hidden') )

document.addEventListener('mouseup', () => {
    const selection = document.getSelection();
    const anchor_node = selection.anchorNode;
    const focus_node = selection.focusNode;
    selected = selection.toString()
    // No selection or selected multiple nodes
    if ( !selection || selection.isCollapsed /* ||  anchor_node != focus_node  */){
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