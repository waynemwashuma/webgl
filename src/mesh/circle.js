import { Mesh } from "./mesh.js"
import { Attribute } from "./attribute/index.js"
import { SeparateAttributeData } from "./attributedata/index.js"


export class CircleGeometry extends Mesh {
  constructor(radius = 1, segments = 15, arcstart = 0, arclength = Math.PI * 2) {
    const vertices = [0, 0, 0]
    const normals = [0, 0, 1]
    const uvs = [0.5, 0.5]
    const indices = []
    const angleIncrement = arclength / segments
    const epilson = Math.pow(2, -31)

    for (let i = arcstart; i < arclength + epilson; i += angleIncrement) {
      const cos = Math.cos(i)
      const sin = Math.sin(i)

      vertices.push(
        radius * cos,
        radius * sin,
        0
      )
      normals.push(
        0, 0, 1
      )
      uvs.push(
        (cos + 1) * 0.5, (sin + 1) * 0.5,
      )
    }
    for (let i = 2; i < vertices.length / 3; i++) {
      indices.push(i - 1, i, 0)
    }

    const attributes = new SeparateAttributeData()

    attributes
      .set(
        Attribute.Position.name,
        new DataView(new Float32Array(vertices).buffer)
      )
      .set(
        Attribute.Normal.name,
        new DataView(new Float32Array(normals).buffer)
      )
      .set(
        Attribute.UV.name,
        new DataView(new Float32Array(uvs).buffer)
      )
    super(attributes)
    this.indices = new Uint16Array(indices)
  }
}