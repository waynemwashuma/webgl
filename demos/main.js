import { PerspectiveProjection, Renderer, TextureLoader } from "webgllis"
import {
  rotatingCube,
  textureWrap,
  materials,
  meshTopology,
  geometries,
  cullface,
  rotatingUvSphere,
  skyBox,
  objLoader,
  separateSamplers,
  transformPropagation,
  gltfLoader
} from "./samples/index.js"

const canvas = /**@type {HTMLCanvasElement}*/(document.getElementById("can"))
const renderer = new Renderer(canvas)
const textureLoader = new TextureLoader()
const manager = {
  renderer,
  textureLoader,
  objLoader
}
const demos = {
  "mesh topology": meshTopology,
  "rotating sphere": rotatingUvSphere,
  "rotating cube": rotatingCube,
  "separate samplers": separateSamplers,
  "texture wrap": textureWrap,
  "materials": materials,
  "geometries": geometries,
  "cullface": cullface,
  "skybox": skyBox,
  "obj loader": objLoader,
  "gltf loader": gltfLoader,
  "transform propagation": transformPropagation,
}

renderer.setViewport(innerWidth, innerHeight)

init(demos)
setupOpts(demos)
render(0)

/**
 * @param {number} _dt
 */
function render(_dt) {
  renderer.update()
  requestAnimationFrame(render)
}

/**
 * @param {{ [x: string]: (arg0: { renderer: Renderer; textureLoader: TextureLoader; objLoader: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; }) => void; drawModes?: ({ renderer }: { renderer: any; }) => void; "rotating sphere"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; "rotating cube"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; "texture wrap"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; materials?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; geometries?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; cullface?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; skybox?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; "obj loader"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; }} demos
 */
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
    // @ts-ignore
    localStorage.setItem("play", e.target.value)
    renderer.clearMeshes()

    // @ts-ignore
    demos[e.target.value](manager)
  }
}

/**
 * @param {{ [x: string]: (arg0: { renderer: Renderer; textureLoader: TextureLoader; objLoader: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; }) => void; drawModes?: ({ renderer }: { renderer: any; }) => void; "rotating sphere"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; "rotating cube"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; "texture wrap"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; materials?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; geometries?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; cullface?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; skybox?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; "obj loader"?: ({ renderer, textureLoader }: { renderer: any; textureLoader: any; }) => void; }} demos
 */
function init(demos) {
  let name = localStorage.getItem("play")
  if (!name)
    name = Object.keys(demos)[0]
  if (!name) return
  demos[name](manager)

  renderer.domElement.addEventListener("resize", () => {
    if (renderer.camera.projection instanceof PerspectiveProjection) {
      renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
    }
  })
}