import {
  Mesh,
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
  renderer,
  textureLoader
}) {
  const texture = textureLoader.load({
    path: "./assets/uv.jpg",
    name: 'wrap1',
  })

  const sampler1 = new Sampler({
    wrapS: TextureWrap.CLAMP,
    wrapT: TextureWrap.CLAMP
  })

  const sampler2 = new Sampler({
    wrapS: TextureWrap.REPEAT,
    wrapT: TextureWrap.REPEAT
  })

  const sampler3 = new Sampler({
    wrapS: TextureWrap.MIRRORREPEAT,
    wrapT: TextureWrap.MIRRORREPEAT
  })

  const geometry = new QuadGeometry(1, 1)
  const uvs = geometry._attributes.get('uv').value
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

  const mesh1 = new Mesh(geometry, material1)
  const mesh2 = new Mesh(geometry, material2)
  const mesh3 = new Mesh(geometry, material3)

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