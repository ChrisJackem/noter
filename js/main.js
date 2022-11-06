console.log('main.js')
//const body = document.getElementsByTagName('body')[0]

// Create Tool Tip
const tool_tip = document.createElement('div')
tool_tip.classList.add('tool-tip')
tool_tip.innerHTML = "<small>Noter</small><br/>"

/* 
HATES SVG OMG
var arrow_url = chrome.runtime.getURL('img/arrow.svg');
tool_tip.innerHTML += `<img src=${arrow_url}>`
 */

// Add Buttons
const btns = ['copy', 'add']
btns.forEach( b =>{
    const btn_url = chrome.runtime.getURL(`img/${b}.png`)
    tool_tip.innerHTML += `<button id='${b}'>${b}</button>`
})



const arrow_size = 20

document.addEventListener('mouseup', () => {
    console.log('UP')
    
    const selection = document.getSelection();
    const anchor_node = selection.anchorNode;
    const focus_node = selection.focusNode;


    console.log(selection.toString())

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
    document.body.appendChild( tool_tip );
  })