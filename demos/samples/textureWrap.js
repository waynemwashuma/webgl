import {
  MeshMaterial3D,
  QuadGeometry,
  TextureWrap,
  BasicMaterial,
  Renderer,
  TextureLoader,
  Sampler,
  PerspectiveProjection,
  Camera
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)
const camera = new Camera()

document.body.append(canvas)
renderer.setViewport(innerWidth, innerHeight)

const textureLoader = new TextureLoader()
const texture1 = textureLoader.load({
  paths: ["./assets/uv.jpg"],
  textureSettings: {
    flipY:true,
    sampler: {
      ...Sampler.defaultSettings,
      wrapS: TextureWrap.Clamp,
      wrapT: TextureWrap.Clamp,
    }
  }
})
const texture2 = textureLoader.load({
  paths: ["./assets/uv.jpg"],
  textureSettings: {
    flipY:true,
    sampler: {
      ...Sampler.defaultSettings,
      wrapS: TextureWrap.Repeat,
      wrapT: TextureWrap.Repeat
    }
  }
})
const texture3 = textureLoader.load({
  paths: ["./assets/uv.jpg"],
  textureSettings: {
    flipY:true,
    sampler: {
      ...Sampler.defaultSettings,
      wrapS: TextureWrap.MirrorRepeat,
      wrapT: TextureWrap.MirrorRepeat
    }
  }
})

const mesh = new QuadGeometry(1, 1)
const buffer = mesh.attributes.get('uv').value
const uvs = new Float32Array(
  buffer.buffer,
  buffer.byteOffset / Float32Array.BYTES_PER_ELEMENT,
  buffer.byteLength / Float32Array.BYTES_PER_ELEMENT
)
for (let i in uvs) {
  uvs[i] *= 2
}

const material1 = new BasicMaterial({
  mainTexture: texture1
})
const material2 = new BasicMaterial({
  mainTexture: texture2
})
const material3 = new BasicMaterial({
  mainTexture: texture3
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
  camera.projection.aspect = innerWidth / innerHeight
}

requestAnimationFrame(update)

function update() {
  renderer.render([object1, object2, object3], camera)

  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (camera.projection instanceof PerspectiveProjection) {

    camera.projection.aspect = innerWidth / innerHeight
  }
})