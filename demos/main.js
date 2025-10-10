import { demos } from "./samples/index.js"

const fetchTemplate = (function () {
  /**
   * @type {string}
   */
  let template
  return async function () {
    if(template) return template
    const response = await fetch('./template.html')
    const text = await response.text()
  
    template = text
    return text
  }
})()
/**
 * @param {URL} demoName
 */
async function switchDemo(demoName) {
  const frame = document.getElementById("example-frame")

  if (!(frame instanceof HTMLIFrameElement)) {
    throw "The element selected is not an i frame"
  }

  const text = await fetchTemplate()
  const page = text.replace(/\{demo-src\}/g,demoName.pathname).replace(/\{demo-nonce\}/g,"fegrgwt4rgwgdw4g")
  frame.srcdoc = page
}

/**
 * @param {{ [x: string]: URL }} demos
 */
function setupOpts(demos) {
  const container = document.body.appendChild(document.createElement("div"))
  const opts = container.appendChild(document.createElement("select"))

  container.style.position = "absolute"
  container.style.top = "0px"
  container.style.left = "0px"

  for (const name in demos) {
    const opt = document.createElement("option")
    opt.append(document.createTextNode(name))
    opts.append(opt)
  }
  opts.onchange = e => {
    const {target} = e
    if(!(target instanceof HTMLSelectElement))return
    localStorage.setItem("play", target.value)

    const url = demos[target.value]
    switchDemo(url)
  }
}

/**
 * @param {{ [x: string]: URL }} demos
 */
function init(demos) {
  let name = localStorage.getItem("play")
  if (!name)
    name = Object.keys(demos)[0]
  if (!name) return
  
  switchDemo(demos[name])
}

init(demos)
setupOpts(demos)