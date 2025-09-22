import { Geometry } from "./geometry.js"
import { Attribute, AttributeData } from "../core/index.js"


export class CircleGeometry extends Geometry {
  constructor(radius = 1, segments = 15, arcstart = 0, arclength = Math.PI * 2) {
    super()

    const vertices = [0, 0, 0]
    const normals = [0, 0, 1]
    const uvs = [0.5, 0.5]
    const indices = []
    const angleIncrement = arclength / segments
    const epilson = Math.pow(2,-31)
    
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

    this.indices = new Uint16Array(indices)
    this.setAttribute(Attribute.Position.name,
      new AttributeData(new DataView(new Float32Array(vertices).buffer))
    )
    this.setAttribute(Attribute.Normal.name,
      new AttributeData(new DataView(new Float32Array(normals).buffer))
    )
    this.setAttribute(Attribute.UV.name,
      new AttributeData(new DataView(new Float32Array(uvs).buffer))
    )
  }
}