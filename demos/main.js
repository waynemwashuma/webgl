import { Renderer, TextureLoader } from "webgllis"
import {
  rotatingCube,
  textureWrap,
  materials,
  drawModes,
  geometries,
  cullface,
  rotatingUvSphere
} from "./samples/index.js"

const canvas = document.getElementById("can")
const renderer = new Renderer(canvas)
const textureLoader = new TextureLoader(renderer)
const manager = {
  renderer,
  textureLoader
}
const demos = {
  "drawModes": drawModes,
  "rotating sphere": rotatingUvSphere,
  "rotating cube": rotatingCube,
  "texture wrap": textureWrap,
  "materials": materials,
  "geometries": geometries,
  "cullface": cullface
}

renderer.setViewport(innerWidth, innerHeight)

textureLoader.load({
  src: "./assets/uv.jpg",
  name: 'uv'
})

init(demos)
setupOpts(demos)
render()

function render(dt) {
  renderer.update()
  requestAnimationFrame(render)
}

function setupOpts(demos) {
  const container = document.body.appendChild(document.createElement("div"))
  const opts = container.appendChild(document.createElement("select"))

  container.style.position = "absolute"
  canvas.before(container)

  for (const name in demos) {
    const opt = document.createElement("option")
    opt.append(document.createTextNode(name))
    opts.append(opt)
  }
  opts.onchange = e => {
    localStorage.setItem("play", e.target.value)
    renderer.clearMeshes()
    demos[e.target.value](manager)
  }
}

function init(demos) {
  let name = localStorage.getItem("play")
  if (!name)
    name = Object.keys(demos)[0]
  if (!name) return
  demos[name](manager)
}