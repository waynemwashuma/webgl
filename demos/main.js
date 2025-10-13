import { demos } from "./samples/index.js"

/**
 * @param {string} name
 */
async function switchDemo(name) {
  const frame = document.getElementById("example-frame")
  const link = document.getElementById("popper")
  const nonce = "453jbibuibjkbjkbohno"
  if (!(frame instanceof HTMLIFrameElement)) {
    throw "The element selected is not an iframe"
  }
  if (!(link instanceof HTMLAnchorElement)) {
    throw "The element selected is not an anchor"
  }
  const linkSource = `./example.html?example=${name}`
  frame.src = linkSource
  link.href = linkSource
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
    const { target } = e
    if (!(target instanceof HTMLSelectElement)) return
    localStorage.setItem("play", target.value)

    const url = demos[target.value]
    switchDemo(target.value)
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

  switchDemo(name)
}

init(demos)
setupOpts(demos)