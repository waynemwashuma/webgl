import { Geometry } from "./geometry.js"
import { Attribute } from "../core/index.js"



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

    this.setAttribute("indices", new Attribute(new Uint16Array(indices), 1))
    this.setAttribute("position", new Attribute(new Float32Array(vertices), 3))
    this.setAttribute("normal", new Attribute(new Float32Array(normals), 3))
    this.setAttribute("uv", new Attribute(new Float32Array(uv), 2))
  }
}