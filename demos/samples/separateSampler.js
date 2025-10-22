import {
  MeshMaterial3D,
  QuadGeometry,
  TextureWrap,
  BasicMaterial,
  WebGLRenderer,
  TextureLoader,
  PerspectiveProjection,
  Camera,
  WebGLCanvasSurface
} from 'webgllis';
import { Sampler } from '../../src/texture/sampler.js';

const canvas = document.createElement('canvas')
const surface = new WebGLCanvasSurface(canvas)
const renderer = new WebGLRenderer()
const camera = new Camera()
const textureLoader = new TextureLoader()
const texture = textureLoader.load({
  paths: ["./assets/uv.jpg"]
})
const sampler1 = new Sampler({
  wrapS: TextureWrap.Clamp,
  wrapT: TextureWrap.Clamp
})
const sampler2 = new Sampler({
  wrapS: TextureWrap.Repeat,
  wrapT: TextureWrap.Repeat
})
const sampler3 = new Sampler({
  wrapS: TextureWrap.MirrorRepeat,
  wrapT: TextureWrap.MirrorRepeat
})

const mesh = new QuadGeometry(1, 1)
const buffer = mesh.attributes.get('uv').value
const uvs = new Float32Array(
  buffer.buffer,
  buffer.byteOffset,
  buffer.byteLength / Float32Array.BYTES_PER_ELEMENT
)
for (let i in uvs) {
  uvs[i] *= 2
}

const material1 = new BasicMaterial({
  mainTexture: texture,
  mainSampler: sampler1
})
const material2 = new BasicMaterial({
  mainTexture: texture,
  mainSampler: sampler2
})
const material3 = new BasicMaterial({
  mainTexture: texture,
  mainSampler: sampler3
})

const object1 = new MeshMaterial3D(mesh, material1)
const object2 = new MeshMaterial3D(mesh, material2)
const object3 = new MeshMaterial3D(mesh, material3)

object1.transform.position.x = -1.2
object2.transform.position.x = 0
object3.transform.position.x = 1.2

camera.transform.position.z = 2
if (camera.projection instanceof PerspectiveProjection) {
  camera.projection.fov = Math.PI / 180 * 120
}

document.body.append(canvas)
updateView()
addEventListener("resize", updateView)
requestAnimationFrame(update)

function update() {
  renderer.render([object1, object2, object3],surface, camera)
  requestAnimationFrame(update)
}

function updateView() {
  canvas.style.width = innerWidth + "px"
  canvas.style.height = innerHeight + "px"
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio

  if (camera.projection instanceof PerspectiveProjection) {
    camera.projection.aspect = innerWidth / innerHeight
  }
}