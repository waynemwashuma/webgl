import {
  MeshMaterial3D,
  QuadGeometry,
  TextureWrap,
  BasicMaterial,
  Renderer,
  TextureLoader,
  Sampler,
  PerspectiveProjection
} from 'webgllis';

const canvas = document.createElement('canvas')
const renderer = new Renderer(canvas)

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

const geometry = new QuadGeometry(1, 1)
const buffer = geometry._attributes.get('uv').value
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

const mesh1 = new MeshMaterial3D(geometry, material1)
const mesh2 = new MeshMaterial3D(geometry, material2)
const mesh3 = new MeshMaterial3D(geometry, material3)

mesh1.transform.position.x = -1.2
mesh2.transform.position.x = 0
mesh3.transform.position.x = 1.2

renderer.camera.transform.position.z = 2
if (renderer.camera.projection instanceof PerspectiveProjection) {
  renderer.camera.projection.fov = Math.PI / 180 * 120
  renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
}
renderer.add(mesh1)
renderer.add(mesh2)
renderer.add(mesh3)

requestAnimationFrame(update)

function update() {
  renderer.update()

  requestAnimationFrame(update)
}

addEventListener("resize", () => {
  renderer.setViewport(innerWidth, innerHeight)

  if (renderer.camera.projection instanceof PerspectiveProjection) {

    renderer.camera.projection.aspect = innerWidth / innerHeight
  }
})