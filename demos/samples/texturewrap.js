import {
  Mesh,
  Texture,
  PhongMaterial,
  QuadGeometry,
  Vector3,
  Quaternion,
  Color,
  TextureWrap
} from 'webgllis';

export function textureWrap({
  renderer,
  textureLoader
}) {
  const tex1 = textureLoader.load({
    src: "./assets/uv.jpg",
    name: 'wrap1',
    wrapS: TextureWrap.CLAMP,
    wrapT: TextureWrap.CLAMP
  })
  const tex2 = textureLoader.load({
    src: "./assets/uv.jpg",
    name: 'wrap2',
    wrapS: TextureWrap.REPEAT,
    wrapT: TextureWrap.REPEAT
  })
  const tex3 = textureLoader.load({
    src: "./assets/uv.jpg",
    name: 'wrap3',
    wrapS: TextureWrap.MIRRORREPEAT,
    wrapT: TextureWrap.MIRRORREPEAT
  })

  const geometry = new QuadGeometry(1, 1)
  const uvs = geometry._attributes.get('uv').value
  for (let i in uvs) {
    uvs[i] *= 2
  }

  const material1 = new PhongMaterial({
    mainTexture: tex1,
    lightDir: new Vector3(0, -3, -3),
    specularShininess: 4,
    specularStrength: 0.06,
    diffuseIntensity: 0.1
  })
  const material2 = new PhongMaterial({
    mainTexture: tex2,
    lightDir: new Vector3(0, -3, -3),
    specularShininess: 4,
    specularStrength: 0.06,
    diffuseIntensity: 0.1
  })
  const material3 = new PhongMaterial({
    mainTexture: tex3,
    lightDir: new Vector3(0, -3, -3),
    specularShininess: 4,
    specularStrength: 0.06,
    diffuseIntensity: 0.1
  })

  const mesh1 = new Mesh(geometry, material1)
  const mesh2 = new Mesh(geometry, material2)
  const mesh3 = new Mesh(geometry, material3)

  mesh1.transform.position.x = -1.2
  mesh2.transform.position.x = 0
  mesh3.transform.position.x = 1.2

  renderer.camera.transform.position.z = 2
  renderer.camera.makePerspective(120)
  renderer.add(mesh1)
  renderer.add(mesh2)
  renderer.add(mesh3)
}