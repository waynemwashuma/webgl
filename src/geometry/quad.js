import { Geometry } from "./geometry.js"
import { Attribute, AttributeData } from "../core/index.js"



export class QuadGeometry extends Geometry {
  constructor(w = 1, h = 1) {
    super()
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

    this.indices = new Uint16Array(indices)
    this.setAttribute(Attribute.Position.name, new AttributeData(new DataView(new Float32Array(vertices).buffer)))
    this.setAttribute(Attribute.Normal.name, new AttributeData(new DataView(new Float32Array(normals).buffer)))
    this.setAttribute(Attribute.UV.name, new AttributeData(new DataView(new Float32Array(uv).buffer)))
  }
}