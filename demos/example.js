import { demos } from "./samples/index.js";

init()

function init() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("example")
  
  if(!name) return
  
  const demo = recursiveSelect(
    name.split('/').filter(e=>e.length !== 0),
    demos
  )

  if(!demo) return

  const script = document.createElement('script')

  script.type = 'module'
  script.src = demo
  document.head.append(script)
}

/**
 * @param {string[]} items
 * @param {Record<string,any>} map 
 * @returns {string}
 */
function recursiveSelect(items,map){
  const item = map[items.shift()]

  if(item instanceof URL){
    return item.pathname
  }

  return recursiveSelect(items,item)
}
