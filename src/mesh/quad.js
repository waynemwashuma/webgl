import { Mesh } from "./mesh.js"
import { Attribute } from "./attribute/index.js"
import { SeparateAttributeData } from "./attributedata/index.js"



export class QuadGeometry extends Mesh {
  constructor(w = 1, h = 1) {
    const indices = [
      0, 2, 1,
      0, 3, 2
    ]
    const vertices = [
      0.5 * w, 0.5 * h, 0,
      0.5 * w, -0.5 * h, 0,
      -0.5 * w, -0.5 * h, 0,
      -0.5 * w, 0.5 * h, 0
    ]
    const uv = [
      1, 0,
      1, 1,
      0, 1,
      0, 0
    ]
    const normals = [
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 1.0
    ]
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
        new DataView(new Float32Array(uv).buffer)
      )
    super(attributes)
    this.indices = new Uint16Array(indices)
  }
}