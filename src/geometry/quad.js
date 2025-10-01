import { Geometry } from "./geometry.js"
import { AttributeData } from "../core/index.js"



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
    this.setAttribute("position", new AttributeData(new Float32Array(vertices)))
    this.setAttribute("normal", new AttributeData(new Float32Array(normals)))
    this.setAttribute("uv", new AttributeData(new Float32Array(uv)))
  }
}