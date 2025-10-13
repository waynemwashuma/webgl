import { demos } from "./samples/index.js";

init()

function init() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("example")
  
  if(!name) return
  
  const demo = demos[name]

  if(!demo) return

  const script = document.createElement('script')

  script.type = 'module'
  script.src = demo.pathname
  document.head.append(script)
}