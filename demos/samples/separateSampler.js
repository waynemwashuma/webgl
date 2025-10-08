import {
  MeshMaterial3D,
  QuadGeometry,
  TextureWrap,
  BasicMaterial,
  Renderer,
  TextureLoader,
  PerspectiveProjection
} from 'webgllis';
import { Sampler } from '../../src/texture/sampler.js';

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function separateSamplers({
  renderer
}) {
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

  const geometry = new QuadGeometry(1, 1)
  const buffer = geometry._attributes.get('uv').value
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
}