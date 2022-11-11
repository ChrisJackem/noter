// Do not run if show_tooltip is false
chrome.storage.sync.get('show_tooltip', response => {
    if ( response.hasOwnProperty('show_tooltip') && !response.show_tooltip ) return

    var selected = null
    const arrow_size = 20

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

    tool_tip.appendChild( createBtn( 'Add', null, e =>{
        if (selected) {
            const new_note = {
                url: window.location.href,
                text: selected                  
            }            
            chrome.runtime.sendMessage({ type: "add", value: new_note });
            tool_tip.classList.add('hidden')
        }
    }))

    addEventListener('resize', e => tool_tip.classList.add('hidden') )

    document.addEventListener('mouseup', () => {
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

})