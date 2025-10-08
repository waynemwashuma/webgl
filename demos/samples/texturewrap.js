import {
  Mesh,
  QuadGeometry,
  TextureWrap,
  BasicMaterial,
  Renderer,
  TextureLoader,
  Sampler,
  PerspectiveProjection
} from 'webgllis';

/**
 * @param {{renderer:Renderer, textureLoader:TextureLoader}} option 
 */
export function textureWrap({
  renderer,
  textureLoader
}) {
  const tex1 = textureLoader.load({
    path: "./assets/uv.jpg",
    name: 'wrap1',
    sampler:{
      ...Sampler.defaultSettings,
      wrapS: TextureWrap.Clamp,
      wrapT: TextureWrap.Clamp,
    }
  })
  const tex2 = textureLoader.load({
    path: "./assets/uv.jpg",
    name: 'wrap2',
    sampler:{
      ...Sampler.defaultSettings,
      wrapS: TextureWrap.Repeat,
      wrapT: TextureWrap.Repeat
    }
  })
  const tex3 = textureLoader.load({
    path: "./assets/uv.jpg",
    name: 'wrap3',
    sampler:{
      ...Sampler.defaultSettings,
      wrapS: TextureWrap.MirrorRepeat,
      wrapT: TextureWrap.MirrorRepeat
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
    mainTexture: tex1
  })
  const material2 = new BasicMaterial({
    mainTexture: tex2
  })
  const material3 = new BasicMaterial({
    mainTexture: tex3
  })

  const mesh1 = new Mesh(geometry, material1)
  const mesh2 = new Mesh(geometry, material2)
  const mesh3 = new Mesh(geometry, material3)

  mesh1.transform.position.x = -1.2
  mesh2.transform.position.x = 0
  mesh3.transform.position.x = 1.2

  renderer.camera.transform.position.z = 2
  if(renderer.camera.projection instanceof PerspectiveProjection){
    renderer.camera.projection.fov = Math.PI / 180 * 120
    renderer.camera.projection.aspect = renderer.domElement.width / renderer.domElement.height
  }
  renderer.add(mesh1)
  renderer.add(mesh2)
  renderer.add(mesh3)
}